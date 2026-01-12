import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAnimals } from '@/hooks/useAnimals';
import { useInseminations } from '@/hooks/useInseminations';
import { usePregnancyReminders } from '@/hooks/usePregnancyReminders';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Baby, Plus, Heart, Loader2, Bell, Milk, AlertTriangle } from 'lucide-react';
import { differenceInDays, differenceInMonths, format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ANIMAL_TYPE_ICONS: Record<string, string> = {
  'inek': '🐄',
  'koyun': '🐑',
  'keçi': '🐐',
  'manda': '🐃',
  'at': '🐴',
  'diğer': '🐾',
};

const GESTATION_PERIODS: Record<string, number> = {
  'inek': 283,
  'koyun': 150,
  'keçi': 150,
  'manda': 310,
  'at': 340,
  'diğer': 200,
};

export default function Pregnancy() {
  const { animals } = useAnimals();
  const { inseminations, isLoading, addInsemination, updateInsemination } = useInseminations();
  const { getMonthWarnings, getPregnancyMonth } = usePregnancyReminders();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: '',
    date: '',
    type: 'suni' as 'doğal' | 'suni',
  });

  const today = new Date();
  const femaleAnimals = animals.filter(a => a.gender === 'dişi' && a.status === 'aktif');
  const pregnantInseminations = inseminations.filter(i => i.is_pregnant);
  const monthWarnings = getMonthWarnings();

  const sortedPregnancies = [...pregnantInseminations].sort((a, b) => {
    const daysA = differenceInDays(new Date(a.expected_birth_date), today);
    const daysB = differenceInDays(new Date(b.expected_birth_date), today);
    return daysA - daysB;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const animal = animals.find(a => a.id === formData.animal_id);
      const gestationDays = GESTATION_PERIODS[animal?.type || 'diğer'];
      const expectedBirthDate = format(addDays(new Date(formData.date), gestationDays), 'yyyy-MM-dd');
      
      await addInsemination.mutateAsync({
        animal_id: formData.animal_id,
        date: formData.date,
        type: formData.type,
        expected_birth_date: expectedBirthDate,
        actual_birth_date: null,
        is_pregnant: true,
        notes: null,
      });
      setFormData({ animal_id: '', date: '', type: 'suni' });
      setDialogOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleMarkBirth = async (inseminationId: string) => {
    if (confirm('Doğum gerçekleşti olarak işaretlensin mi?')) {
      await updateInsemination.mutateAsync({
        id: inseminationId,
        is_pregnant: false,
        actual_birth_date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Group warnings by type
  const sixthMonthWarnings = monthWarnings.filter(w => w.type === '6_month');
  const seventhMonthWarnings = monthWarnings.filter(w => w.type === '7_month');

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gebelik Takibi</h1>
            <p className="text-muted-foreground mt-1">
              {pregnantInseminations.length} gebe hayvan takip ediliyor
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="farm" size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Tohumlama Kaydet
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-popover">
              <DialogHeader>
                <DialogTitle>Yeni Tohumlama Kaydı</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Hayvan (Dişi) *</Label>
                  <Select value={formData.animal_id} onValueChange={(v) => setFormData({ ...formData, animal_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hayvan seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {femaleAnimals.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.ear_tag} - {a.breed}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tohumlama Tarihi *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tohumlama Türü *</Label>
                    <Select value={formData.type} onValueChange={(v: 'doğal' | 'suni') => setFormData({ ...formData, type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="suni">Suni Tohumlama</SelectItem>
                        <SelectItem value="doğal">Doğal Tohumlama</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" variant="farm" className="flex-1" disabled={formLoading}>
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kaydet'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Month Warnings */}
        {(sixthMonthWarnings.length > 0 || seventhMonthWarnings.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sixthMonthWarnings.length > 0 && (
              <Card className="border-warning/50 bg-warning/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-warning">
                    <Milk className="w-5 h-5" />
                    6. Ay - Süt Alımını Azaltın
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sixthMonthWarnings.map(warning => {
                      const insemination = inseminations.find(i => i.id === warning.insemination_id);
                      const animal = animals.find(a => a.id === insemination?.animal_id);
                      return animal ? (
                        <div key={warning.insemination_id} className="flex items-center gap-2 text-sm">
                          <span>{ANIMAL_TYPE_ICONS[animal.type]}</span>
                          <span className="font-medium">{animal.ear_tag}</span>
                          <span className="text-muted-foreground">- {animal.breed}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {seventhMonthWarnings.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    7. Ay - Süt Alımını Durdurun
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {seventhMonthWarnings.map(warning => {
                      const insemination = inseminations.find(i => i.id === warning.insemination_id);
                      const animal = animals.find(a => a.id === insemination?.animal_id);
                      return animal ? (
                        <div key={warning.insemination_id} className="flex items-center gap-2 text-sm">
                          <span>{ANIMAL_TYPE_ICONS[animal.type]}</span>
                          <span className="font-medium">{animal.ear_tag}</span>
                          <span className="text-muted-foreground">- {animal.breed}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Pregnancy Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedPregnancies.map((insemination) => {
            const animal = animals.find(a => a.id === insemination.animal_id);
            if (!animal) return null;

            const gestationDays = GESTATION_PERIODS[animal.type];
            const inseminationDate = new Date(insemination.date);
            const expectedDate = new Date(insemination.expected_birth_date);
            const daysPassed = differenceInDays(today, inseminationDate);
            const daysRemaining = differenceInDays(expectedDate, today);
            const progress = Math.min((daysPassed / gestationDays) * 100, 100);
            const pregnancyMonth = getPregnancyMonth(insemination.date);

            const isUrgent = daysRemaining <= 14 && daysRemaining >= 0;
            const isOverdue = daysRemaining < 0;
            const is6thMonth = pregnancyMonth >= 6 && pregnancyMonth < 7;
            const is7thMonth = pregnancyMonth >= 7;

            return (
              <div
                key={insemination.id}
                className={cn(
                  "rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-farm-md",
                  isOverdue ? 'bg-destructive/5 border-destructive/30' :
                  isUrgent ? 'bg-warning/5 border-warning/30' :
                  'bg-card border-border'
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-3xl shadow-farm-sm">
                      {ANIMAL_TYPE_ICONS[animal.type] || '🐾'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{animal.ear_tag}</h3>
                      <p className="text-sm text-muted-foreground">{animal.breed}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <div className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1",
                      isOverdue ? 'bg-destructive text-destructive-foreground' :
                      isUrgent ? 'bg-warning text-warning-foreground' :
                      'bg-success/20 text-success'
                    )}>
                      <Heart className="w-4 h-4" />
                      {isOverdue ? 'Gecikmiş' : isUrgent ? 'Yaklaşan' : 'Gebe'}
                    </div>
                    {(is6thMonth || is7thMonth) && (
                      <Badge variant={is7thMonth ? 'destructive' : 'outline'} className="text-xs">
                        <Milk className="w-3 h-3 mr-1" />
                        {is7thMonth ? 'Süt Kesilmeli' : 'Süt Azaltılmalı'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gebelik Süreci ({pregnancyMonth}. ay)</span>
                    <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{daysPassed} gün geçti</span>
                    <span>{gestationDays} gün toplam</span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tohumlama Tarihi</p>
                    <p className="font-medium text-foreground">
                      {format(inseminationDate, 'd MMMM yyyy', { locale: tr })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {insemination.type} tohumlama
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tahmini Doğum</p>
                    <p className={cn(
                      "font-bold",
                      isOverdue ? 'text-destructive' :
                      isUrgent ? 'text-warning' : 'text-foreground'
                    )}>
                      {format(expectedDate, 'd MMMM yyyy', { locale: tr })}
                    </p>
                    <p className={cn(
                      "text-sm font-semibold mt-0.5",
                      isOverdue ? 'text-destructive' :
                      isUrgent ? 'text-warning' : 'text-success'
                    )}>
                      {isOverdue 
                        ? `${Math.abs(daysRemaining)} gün gecikti!`
                        : `${daysRemaining} gün kaldı`
                      }
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleMarkBirth(insemination.id)}
                  >
                    <Baby className="w-4 h-4 mr-2" />
                    Doğum Gerçekleşti
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {pregnantInseminations.length === 0 && (
          <div className="text-center py-12 bg-card rounded-2xl border-2 border-border">
            <Baby className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Henüz gebe hayvan kaydı yok
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Tohumlama kaydı ekleyerek takibe başlayın
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
