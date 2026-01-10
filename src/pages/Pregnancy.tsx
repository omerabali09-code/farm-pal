import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAnimals } from '@/hooks/useAnimals';
import { useInseminations } from '@/hooks/useInseminations';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Baby, Plus, Heart, Loader2 } from 'lucide-react';
import { differenceInDays, format, addDays } from 'date-fns';
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
  const { inseminations, isLoading, addInsemination } = useInseminations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: '',
    date: '',
    type: 'suni' as 'doğal' | 'suni',
  });

  const today = new Date();
  const femaleAnimals = animals.filter(a => a.gender === 'dişi');
  const pregnantInseminations = inseminations.filter(i => i.is_pregnant);

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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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

            const isUrgent = daysRemaining <= 14 && daysRemaining >= 0;
            const isOverdue = daysRemaining < 0;

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
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1",
                    isOverdue ? 'bg-destructive text-destructive-foreground' :
                    isUrgent ? 'bg-warning text-warning-foreground' :
                    'bg-success/20 text-success'
                  )}>
                    <Heart className="w-4 h-4" />
                    {isOverdue ? 'Gecikmiş' : isUrgent ? 'Yaklaşan' : 'Gebe'}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gebelik Süreci</span>
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
