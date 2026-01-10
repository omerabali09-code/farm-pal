import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAnimals } from '@/hooks/useAnimals';
import { useVaccinations, Vaccination } from '@/hooks/useVaccinations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Syringe, Calendar, AlertTriangle, CheckCircle, Plus, Loader2 } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Vaccinations() {
  const { animals } = useAnimals();
  const { vaccinations, isLoading, addVaccination } = useVaccinations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: '',
    name: '',
    date: '',
    next_date: '',
  });

  const today = new Date();

  const getAnimalByID = (id: string) => animals.find(a => a.id === id);

  const getVaccinationStatus = (nextDate: string | null) => {
    if (!nextDate) return 'completed';
    const days = differenceInDays(new Date(nextDate), today);
    if (days < 0) return 'overdue';
    if (days <= 7) return 'upcoming';
    return 'scheduled';
  };

  const statusConfig = {
    overdue: {
      label: 'Gecikmiş',
      icon: AlertTriangle,
      bgClass: 'bg-destructive/10 border-destructive/30',
    },
    upcoming: {
      label: 'Yaklaşan',
      icon: Calendar,
      bgClass: 'bg-warning/10 border-warning/30',
    },
    scheduled: {
      label: 'Planlandı',
      icon: Calendar,
      bgClass: 'bg-card border-border',
    },
    completed: {
      label: 'Tamamlandı',
      icon: CheckCircle,
      bgClass: 'bg-success/10 border-success/30',
    },
  };

  const sortedVaccinations = [...vaccinations].sort((a, b) => {
    const statusA = getVaccinationStatus(a.next_date);
    const statusB = getVaccinationStatus(b.next_date);
    const priority = { overdue: 0, upcoming: 1, scheduled: 2, completed: 3 };
    return priority[statusA] - priority[statusB];
  });

  const overdueCount = vaccinations.filter(v => getVaccinationStatus(v.next_date) === 'overdue').length;
  const upcomingCount = vaccinations.filter(v => getVaccinationStatus(v.next_date) === 'upcoming').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      await addVaccination.mutateAsync({
        animal_id: formData.animal_id,
        name: formData.name,
        date: formData.date,
        next_date: formData.next_date || null,
        completed: true,
        notes: null,
      });
      setFormData({ animal_id: '', name: '', date: '', next_date: '' });
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
            <h1 className="text-3xl font-bold text-foreground">Aşı Takibi</h1>
            <p className="text-muted-foreground mt-1">
              {overdueCount > 0 && <span className="text-destructive font-medium">{overdueCount} gecikmiş, </span>}
              {upcomingCount > 0 && <span className="text-warning font-medium">{upcomingCount} yaklaşan aşı</span>}
              {overdueCount === 0 && upcomingCount === 0 && 'Tüm aşılar güncel'}
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="farm" size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Aşı Kaydet
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-popover">
              <DialogHeader>
                <DialogTitle>Yeni Aşı Kaydı</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Hayvan *</Label>
                  <Select value={formData.animal_id} onValueChange={(v) => setFormData({ ...formData, animal_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hayvan seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {animals.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.ear_tag} - {a.breed}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Aşı Adı *</Label>
                  <Input
                    placeholder="Şap Aşısı, Brusella..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Yapıldığı Tarih *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sonraki Tarih</Label>
                    <Input
                      type="date"
                      value={formData.next_date}
                      onChange={(e) => setFormData({ ...formData, next_date: e.target.value })}
                    />
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

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-destructive/10 rounded-xl p-4 border-2 border-destructive/20">
            <p className="text-sm text-muted-foreground">Gecikmiş</p>
            <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
          </div>
          <div className="bg-warning/10 rounded-xl p-4 border-2 border-warning/20">
            <p className="text-sm text-muted-foreground">Yaklaşan (7 gün)</p>
            <p className="text-2xl font-bold text-warning">{upcomingCount}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border-2 border-border">
            <p className="text-sm text-muted-foreground">Planlanmış</p>
            <p className="text-2xl font-bold text-foreground">
              {vaccinations.filter(v => getVaccinationStatus(v.next_date) === 'scheduled').length}
            </p>
          </div>
          <div className="bg-success/10 rounded-xl p-4 border-2 border-success/20">
            <p className="text-sm text-muted-foreground">Toplam Kayıt</p>
            <p className="text-2xl font-bold text-success">{vaccinations.length}</p>
          </div>
        </div>

        {/* Vaccination List */}
        <div className="space-y-4">
          {sortedVaccinations.map((vaccination) => {
            const animal = getAnimalByID(vaccination.animal_id);
            const status = getVaccinationStatus(vaccination.next_date);
            const config = statusConfig[status];
            const Icon = config.icon;
            const daysUntil = vaccination.next_date 
              ? differenceInDays(new Date(vaccination.next_date), today)
              : null;

            return (
              <div
                key={vaccination.id}
                className={cn(
                  "rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-farm-md",
                  config.bgClass
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      status === 'overdue' ? 'bg-destructive text-destructive-foreground' :
                      status === 'upcoming' ? 'bg-warning text-warning-foreground' :
                      status === 'completed' ? 'bg-success text-success-foreground' :
                      'bg-secondary text-secondary-foreground'
                    )}>
                      <Syringe className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{vaccination.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {animal?.ear_tag} • {animal?.breed}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Son Yapılan</p>
                      <p className="font-medium text-foreground">
                        {format(new Date(vaccination.date), 'd MMMM yyyy', { locale: tr })}
                      </p>
                    </div>
                    
                    {vaccination.next_date && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Sonraki Tarih</p>
                        <p className={cn(
                          "font-medium",
                          status === 'overdue' ? 'text-destructive' :
                          status === 'upcoming' ? 'text-warning' : 'text-foreground'
                        )}>
                          {format(new Date(vaccination.next_date), 'd MMMM yyyy', { locale: tr })}
                        </p>
                      </div>
                    )}

                    <Badge 
                      variant={status === 'overdue' ? 'destructive' : 
                              status === 'upcoming' ? 'outline' : 
                              status === 'completed' ? 'default' : 'secondary'}
                      className="whitespace-nowrap"
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {daysUntil !== null && daysUntil < 0 
                        ? `${Math.abs(daysUntil)} gün gecikti`
                        : daysUntil !== null && daysUntil <= 7
                        ? `${daysUntil} gün kaldı`
                        : config.label
                      }
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}

          {vaccinations.length === 0 && (
            <div className="text-center py-12 bg-card rounded-2xl border-2">
              <Syringe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz aşı kaydı yok</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
