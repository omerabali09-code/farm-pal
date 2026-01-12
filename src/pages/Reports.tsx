import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAnimals } from '@/hooks/useAnimals';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useInseminations } from '@/hooks/useInseminations';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { PawPrint, Baby, Syringe, TrendingUp, DollarSign, TrendingDown, Wallet } from 'lucide-react';
import { format, subMonths, subWeeks, subYears, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { tr } from 'date-fns/locale';

const COLORS = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7'];

type TimePeriod = 'weekly' | 'monthly' | 'yearly';

export default function Reports() {
  const { animals, soldAnimals } = useAnimals();
  const { vaccinations } = useVaccinations();
  const { inseminations } = useInseminations();
  const { transactions, totalIncome, totalExpense, netBalance } = useTransactions();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');

  // Generate time periods based on selection
  const getTimePeriods = () => {
    const periods = [];
    const now = new Date();
    
    if (timePeriod === 'weekly') {
      for (let i = 11; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(now, i), { locale: tr });
        const weekEnd = endOfWeek(subWeeks(now, i), { locale: tr });
        periods.push({
          label: `${format(weekStart, 'd MMM', { locale: tr })}`,
          start: weekStart,
          end: weekEnd,
        });
      }
    } else if (timePeriod === 'monthly') {
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(now, i);
        periods.push({
          label: format(date, 'MMM', { locale: tr }),
          start: startOfMonth(date),
          end: endOfMonth(date),
        });
      }
    } else {
      for (let i = 4; i >= 0; i--) {
        const date = subYears(now, i);
        periods.push({
          label: format(date, 'yyyy'),
          start: startOfYear(date),
          end: endOfYear(date),
        });
      }
    }
    return periods;
  };

  const periods = getTimePeriods();

  // Financial data
  const financialData = periods.map(({ label, start, end }) => {
    const periodTransactions = transactions.filter(t =>
      isWithinInterval(new Date(t.date), { start, end })
    );
    
    const income = periodTransactions
      .filter(t => t.type === 'gelir')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = periodTransactions
      .filter(t => t.type === 'gider')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      period: label,
      gelir: income,
      gider: expense,
      net: income - expense,
    };
  });

  // Activity data
  const activityData = periods.map(({ label, start, end }) => {
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
      period: label,
      hayvan: animalsAdded,
      aşı: vaccinationsGiven,
      doğum: birthsExpected,
    };
  });

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

  // Gender distribution
  const genderData = [
    { name: 'Dişi', value: animals.filter(a => a.gender === 'dişi').length },
    { name: 'Erkek', value: animals.filter(a => a.gender === 'erkek').length },
  ];

  // Income by category
  const incomeByCategory = Object.entries(
    transactions
      .filter(t => t.type === 'gelir')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Expense by category
  const expenseByCategory = Object.entries(
    transactions
      .filter(t => t.type === 'gider')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Pregnancy stats
  const pregnantCount = inseminations.filter(i => i.is_pregnant).length;
  const totalFemales = animals.filter(a => a.gender === 'dişi').length;

  // Vaccination completion rate
  const completedVaccinations = vaccinations.filter(v => v.completed).length;
  const vaccinationRate = vaccinations.length > 0 
    ? Math.round((completedVaccinations / vaccinations.length) * 100) 
    : 0;

  // Sales stats
  const totalSalesAmount = soldAnimals.reduce((sum, a) => sum + (a.sold_price || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Raporlar</h1>
            <p className="text-muted-foreground mt-1">
              Çiftlik istatistikleri ve analizler
            </p>
          </div>
          <Select value={timePeriod} onValueChange={(v: TimePeriod) => setTimePeriod(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="weekly">Haftalık</SelectItem>
              <SelectItem value="monthly">Aylık</SelectItem>
              <SelectItem value="yearly">Yıllık</SelectItem>
            </SelectContent>
          </Select>
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
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">₺{totalIncome.toLocaleString('tr-TR')}</p>
                  <p className="text-xs text-muted-foreground">Toplam Gelir</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">₺{totalExpense.toLocaleString('tr-TR')}</p>
                  <p className="text-xs text-muted-foreground">Toplam Gider</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ₺{netBalance.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-xs text-muted-foreground">Net Bakiye</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="financial">
          <TabsList>
            <TabsTrigger value="financial">Finansal</TabsTrigger>
            <TabsTrigger value="animals">Hayvanlar</TabsTrigger>
            <TabsTrigger value="activity">Aktivite</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-6 mt-6">
            {/* Financial Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gelir - Gider Trendi ({timePeriod === 'weekly' ? 'Haftalık' : timePeriod === 'monthly' ? 'Aylık' : 'Yıllık'})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="gelir" name="Gelir" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="gider" name="Gider" stackId="2" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gelir Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {incomeByCategory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomeByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            dataKey="value"
                          >
                            {incomeByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Henüz gelir kaydı yok
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Expense by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gider Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {expenseByCategory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                      <Pie
                            data={expenseByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ₺${value.toLocaleString('tr-TR')}`}
                          >
                            {expenseByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Henüz gider kaydı yok
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Satış Özeti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">{soldAnimals.length}</p>
                    <p className="text-sm text-muted-foreground">Satılan Hayvan</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-success">₺{totalSalesAmount.toLocaleString('tr-TR')}</p>
                    <p className="text-sm text-muted-foreground">Toplam Satış Geliri</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-foreground">
                      ₺{soldAnimals.length > 0 ? Math.round(totalSalesAmount / soldAnimals.length).toLocaleString('tr-TR') : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Ortalama Satış Fiyatı</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="animals" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <div className="h-[300px]">
                    {animals.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={genderData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
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
            </div>

            {/* Pregnancy & Vaccination Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aşı İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Toplam Aşı</span>
                        <span className="font-semibold">{vaccinations.length}</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Tamamlanan</span>
                        <span className="font-semibold">{completedVaccinations}</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success rounded-full transition-all"
                          style={{ width: `${vaccinationRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Tamamlanma Oranı</p>
                      <p className="text-3xl font-bold text-success">%{vaccinationRate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6 mt-6">
            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktivite Trendi ({timePeriod === 'weekly' ? 'Haftalık' : timePeriod === 'monthly' ? 'Aylık' : 'Yıllık'})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="hayvan" name="Hayvan Eklendi" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="aşı" name="Aşı Yapıldı" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="doğum" name="Beklenen Doğum" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
