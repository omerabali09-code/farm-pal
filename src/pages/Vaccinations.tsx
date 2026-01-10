import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockVaccinations, mockAnimals } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Syringe, Calendar, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Vaccinations() {
  const today = new Date();

  const getAnimalByID = (id: string) => mockAnimals.find(a => a.id === id);

  const getVaccinationStatus = (nextDate?: string) => {
    if (!nextDate) return 'completed';
    const days = differenceInDays(new Date(nextDate), today);
    if (days < 0) return 'overdue';
    if (days <= 7) return 'upcoming';
    return 'scheduled';
  };

  const statusConfig = {
    overdue: {
      label: 'Gecikmiş',
      variant: 'destructive' as const,
      icon: AlertTriangle,
      bgClass: 'bg-destructive/10 border-destructive/30',
    },
    upcoming: {
      label: 'Yaklaşan',
      variant: 'warning' as const,
      icon: Calendar,
      bgClass: 'bg-warning/10 border-warning/30',
    },
    scheduled: {
      label: 'Planlandı',
      variant: 'default' as const,
      icon: Calendar,
      bgClass: 'bg-card border-border',
    },
    completed: {
      label: 'Tamamlandı',
      variant: 'success' as const,
      icon: CheckCircle,
      bgClass: 'bg-success/10 border-success/30',
    },
  };

  // Aşıları öncelik sırasına göre sırala
  const sortedVaccinations = [...mockVaccinations].sort((a, b) => {
    const statusA = getVaccinationStatus(a.nextDate);
    const statusB = getVaccinationStatus(b.nextDate);
    const priority = { overdue: 0, upcoming: 1, scheduled: 2, completed: 3 };
    return priority[statusA] - priority[statusB];
  });

  const overdueCount = mockVaccinations.filter(v => getVaccinationStatus(v.nextDate) === 'overdue').length;
  const upcomingCount = mockVaccinations.filter(v => getVaccinationStatus(v.nextDate) === 'upcoming').length;

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
          <Button variant="farm" size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Aşı Kaydet
          </Button>
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
              {mockVaccinations.filter(v => getVaccinationStatus(v.nextDate) === 'scheduled').length}
            </p>
          </div>
          <div className="bg-success/10 rounded-xl p-4 border-2 border-success/20">
            <p className="text-sm text-muted-foreground">Toplam Kayıt</p>
            <p className="text-2xl font-bold text-success">{mockVaccinations.length}</p>
          </div>
        </div>

        {/* Vaccination List */}
        <div className="space-y-4">
          {sortedVaccinations.map((vaccination) => {
            const animal = getAnimalByID(vaccination.animalId);
            const status = getVaccinationStatus(vaccination.nextDate);
            const config = statusConfig[status];
            const Icon = config.icon;
            const daysUntil = vaccination.nextDate 
              ? differenceInDays(new Date(vaccination.nextDate), today)
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
                        {animal?.earTag} • {animal?.breed}
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
                    
                    {vaccination.nextDate && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Sonraki Tarih</p>
                        <p className={cn(
                          "font-medium",
                          status === 'overdue' ? 'text-destructive' :
                          status === 'upcoming' ? 'text-warning' : 'text-foreground'
                        )}>
                          {format(new Date(vaccination.nextDate), 'd MMMM yyyy', { locale: tr })}
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
        </div>
      </div>
    </MainLayout>
  );
}
