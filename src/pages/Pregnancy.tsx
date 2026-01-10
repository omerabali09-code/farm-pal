import { MainLayout } from '@/components/layout/MainLayout';
import { mockInseminations, mockAnimals } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Baby, Calendar, Plus, Heart } from 'lucide-react';
import { differenceInDays, format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { GESTATION_PERIODS, ANIMAL_TYPE_ICONS } from '@/types/animal';

export default function Pregnancy() {
  const today = new Date();

  const getAnimalByID = (id: string) => mockAnimals.find(a => a.id === id);

  const pregnantInseminations = mockInseminations.filter(i => i.isPregnant);

  // Doğuma kalan gün sayısına göre sırala
  const sortedPregnancies = [...pregnantInseminations].sort((a, b) => {
    const daysA = differenceInDays(new Date(a.expectedBirthDate), today);
    const daysB = differenceInDays(new Date(b.expectedBirthDate), today);
    return daysA - daysB;
  });

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
          <Button variant="farm" size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Tohumlama Kaydet
          </Button>
        </div>

        {/* Pregnancy Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedPregnancies.map((insemination) => {
            const animal = getAnimalByID(insemination.animalId);
            if (!animal) return null;

            const gestationDays = GESTATION_PERIODS[animal.type];
            const inseminationDate = new Date(insemination.date);
            const expectedDate = new Date(insemination.expectedBirthDate);
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
                      {ANIMAL_TYPE_ICONS[animal.type]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{animal.earTag}</h3>
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

                {insemination.notes && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">{insemination.notes}</p>
                  </div>
                )}
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
