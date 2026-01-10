import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { NotificationCard } from '@/components/dashboard/NotificationCard';
import { AnimalCard } from '@/components/animals/AnimalCard';
import { mockAnimals, mockInseminations, mockVaccinations, mockNotifications } from '@/data/mockData';
import { PawPrint, Baby, Syringe, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { differenceInDays } from 'date-fns';

export default function Dashboard() {
  const today = new Date();
  
  // Stats hesaplamaları
  const totalAnimals = mockAnimals.length;
  const pregnantAnimals = mockInseminations.filter(i => i.isPregnant).length;
  
  const upcomingBirths = mockInseminations.filter(i => {
    if (!i.isPregnant) return false;
    const daysUntil = differenceInDays(new Date(i.expectedBirthDate), today);
    return daysUntil >= 0 && daysUntil <= 30;
  }).length;
  
  const overdueVaccinations = mockVaccinations.filter(v => {
    if (!v.nextDate) return false;
    return differenceInDays(new Date(v.nextDate), today) < 0;
  }).length;

  const unreadNotifications = mockNotifications.filter(n => !n.isRead);
  
  // Gebe hayvanları bul
  const pregnantAnimalIds = mockInseminations.filter(i => i.isPregnant).map(i => i.animalId);
  const animalsWithPregnancy = mockAnimals.map(animal => ({
    animal,
    isPregnant: pregnantAnimalIds.includes(animal.id)
  }));

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
            description={`${upcomingBirths} yaklaşan doğum`}
          />
          <StatCard
            title="Yaklaşan Aşı"
            value={mockVaccinations.filter(v => {
              if (!v.nextDate) return false;
              const days = differenceInDays(new Date(v.nextDate), today);
              return days >= 0 && days <= 7;
            }).length}
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
              {unreadNotifications.slice(0, 4).map((notification) => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification}
                />
              ))}
              {unreadNotifications.length === 0 && (
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
              {animalsWithPregnancy.slice(0, 4).map(({ animal, isPregnant }) => (
                <AnimalCard 
                  key={animal.id} 
                  animal={animal}
                  isPregnant={isPregnant}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
