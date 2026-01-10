import { MainLayout } from '@/components/layout/MainLayout';
import { useAnimals } from '@/hooks/useAnimals';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useInseminations } from '@/hooks/useInseminations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { PawPrint, Baby, Syringe, TrendingUp } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { tr } from 'date-fns/locale';

const COLORS = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7'];

export default function Reports() {
  const { animals } = useAnimals();
  const { vaccinations } = useVaccinations();
  const { inseminations } = useInseminations();

  // Animal type distribution
  const animalTypeData = Object.entries(
    animals.reduce((acc, animal) => {
      acc[animal.type] = (acc[animal.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ 
    name: name.charAt(0).toUpperCase() + name.slice(1), 
    value 
  }));

  // Monthly statistics for last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      month: format(date, 'MMM', { locale: tr }),
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  });

  const monthlyData = last6Months.map(({ month, start, end }) => {
    const animalsAdded = animals.filter(a => 
      isWithinInterval(new Date(a.created_at), { start, end })
    ).length;

    const vaccinationsGiven = vaccinations.filter(v =>
      isWithinInterval(new Date(v.date), { start, end })
    ).length;

    const birthsExpected = inseminations.filter(i =>
      i.is_pregnant && isWithinInterval(new Date(i.expected_birth_date), { start, end })
    ).length;

    return {
      month,
      hayvan: animalsAdded,
      aşı: vaccinationsGiven,
      doğum: birthsExpected,
    };
  });

  // Gender distribution
  const genderData = [
    { name: 'Dişi', value: animals.filter(a => a.gender === 'dişi').length },
    { name: 'Erkek', value: animals.filter(a => a.gender === 'erkek').length },
  ];

  // Pregnancy stats
  const pregnantCount = inseminations.filter(i => i.is_pregnant).length;
  const totalFemales = animals.filter(a => a.gender === 'dişi').length;

  // Vaccination completion rate
  const completedVaccinations = vaccinations.filter(v => v.completed).length;
  const vaccinationRate = vaccinations.length > 0 
    ? Math.round((completedVaccinations / vaccinations.length) * 100) 
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Raporlar</h1>
          <p className="text-muted-foreground mt-1">
            Çiftlik istatistikleri ve analizler
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{animals.length}</p>
                  <p className="text-xs text-muted-foreground">Toplam Hayvan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Baby className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pregnantCount}</p>
                  <p className="text-xs text-muted-foreground">Gebe Hayvan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Syringe className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{vaccinations.length}</p>
                  <p className="text-xs text-muted-foreground">Aşı Kaydı</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">%{vaccinationRate}</p>
                  <p className="text-xs text-muted-foreground">Aşı Oranı</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aylık Aktivite</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="hayvan" name="Hayvan" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="aşı" name="Aşı" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="doğum" name="Doğum" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Animal Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hayvan Türü Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {animalTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={animalTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {animalTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Henüz veri yok
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cinsiyet Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {animals.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="hsl(var(--accent))" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Henüz veri yok
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pregnancy Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gebelik İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Dişi Hayvanlar</span>
                    <span className="font-semibold">{totalFemales}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${animals.length > 0 ? (totalFemales / animals.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Gebe Olanlar</span>
                    <span className="font-semibold">{pregnantCount}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success rounded-full transition-all"
                      style={{ width: `${totalFemales > 0 ? (pregnantCount / totalFemales) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Gebelik Oranı</p>
                  <p className="text-3xl font-bold text-success">
                    %{totalFemales > 0 ? Math.round((pregnantCount / totalFemales) * 100) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
