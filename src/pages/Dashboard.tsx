import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { NotificationCard } from '@/components/dashboard/NotificationCard';
import { AnimalCard } from '@/components/animals/AnimalCard';
import { useAnimals } from '@/hooks/useAnimals';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useInseminations } from '@/hooks/useInseminations';
import { useAuth } from '@/contexts/AuthContext';
import { seedSampleData } from '@/utils/seedData';
import { PawPrint, Baby, Syringe, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { animals, isLoading: animalsLoading } = useAnimals();
  const { vaccinations, isLoading: vaccinationsLoading } = useVaccinations();
  const { inseminations, isLoading: inseminationsLoading } = useInseminations();

  const isLoading = animalsLoading || vaccinationsLoading || inseminationsLoading;
  const today = new Date();
  
  // Stats hesaplamaları
  const totalAnimals = animals.length;
  const pregnantAnimals = inseminations.filter(i => i.is_pregnant).length;
  
  const upcomingBirths = inseminations.filter(i => {
    if (!i.is_pregnant) return false;
    const daysUntil = differenceInDays(new Date(i.expected_birth_date), today);
    return daysUntil >= 0 && daysUntil <= 30;
  }).length;
  
  const overdueVaccinations = vaccinations.filter(v => {
    if (!v.next_date) return false;
    return differenceInDays(new Date(v.next_date), today) < 0;
  }).length;

  const upcomingVaccinations = vaccinations.filter(v => {
    if (!v.next_date) return false;
    const days = differenceInDays(new Date(v.next_date), today);
    return days >= 0 && days <= 7;
  }).length;

  // Bildirimler oluştur
  const notifications = [
    ...inseminations
      .filter(i => {
        if (!i.is_pregnant) return false;
        const days = differenceInDays(new Date(i.expected_birth_date), today);
        return days >= 0 && days <= 14;
      })
      .map(i => {
        const animal = animals.find(a => a.id === i.animal_id);
        const days = differenceInDays(new Date(i.expected_birth_date), today);
        return {
          id: `birth-${i.id}`,
          type: 'birth' as const,
          animalId: i.animal_id,
          message: `${animal?.ear_tag || 'Hayvan'} - Doğum ${days} gün içinde`,
          date: i.expected_birth_date,
          isRead: false,
          priority: days <= 7 ? 'high' as const : 'medium' as const,
        };
      }),
    ...vaccinations
      .filter(v => {
        if (!v.next_date) return false;
        return differenceInDays(new Date(v.next_date), today) < 0;
      })
      .map(v => {
        const animal = animals.find(a => a.id === v.animal_id);
        const days = Math.abs(differenceInDays(new Date(v.next_date!), today));
        return {
          id: `vac-${v.id}`,
          type: 'vaccination' as const,
          animalId: v.animal_id,
          message: `${animal?.ear_tag || 'Hayvan'} - ${v.name} aşısı ${days} gün gecikti`,
          date: v.next_date!,
          isRead: false,
          priority: 'high' as const,
        };
      }),
  ].sort((a, b) => (a.priority === 'high' ? -1 : 1));

  // Gebe hayvanları bul
  const pregnantAnimalIds = inseminations.filter(i => i.is_pregnant).map(i => i.animal_id);

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
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Hoş Geldiniz! 👋</h1>
          <p className="text-muted-foreground mt-1">Çiftliğinizin güncel durumu aşağıda</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Toplam Hayvan"
            value={totalAnimals}
            icon={<PawPrint className="w-6 h-6" />}
            variant="primary"
          />
          <StatCard
            title="Gebe Hayvan"
            value={pregnantAnimals}
            icon={<Baby className="w-6 h-6" />}
            variant="success"
            description={upcomingBirths > 0 ? `${upcomingBirths} yaklaşan doğum` : undefined}
          />
          <StatCard
            title="Yaklaşan Aşı"
            value={upcomingVaccinations}
            icon={<Syringe className="w-6 h-6" />}
            variant="warning"
          />
          <StatCard
            title="Gecikmiş Aşı"
            value={overdueVaccinations}
            icon={<AlertTriangle className="w-6 h-6" />}
            variant={overdueVaccinations > 0 ? 'destructive' : 'default'}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Bildirimler</h2>
              <Link to="/bildirimler">
                <Button variant="ghost" size="sm" className="gap-1">
                  Tümü <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 4).map((notification) => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification}
                />
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Yeni bildirim yok 🎉</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Animals */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Son Eklenen Hayvanlar</h2>
              <Link to="/hayvanlar">
                <Button variant="ghost" size="sm" className="gap-1">
                  Tümünü Gör <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {animals.slice(0, 4).map((animal) => (
                <AnimalCard 
                  key={animal.id} 
                  animal={animal}
                  isPregnant={pregnantAnimalIds.includes(animal.id)}
                  onClick={() => navigate(`/hayvan/${animal.id}`)}
                />
              ))}
              {animals.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground bg-card rounded-2xl border-2">
                  <p>Henüz hayvan eklenmemiş</p>
                  <Link to="/hayvanlar">
                    <Button variant="farm" className="mt-4">İlk Hayvanı Ekle</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
