import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useMilkProductions } from '@/hooks/useMilkProductions';
import { useAnimals } from '@/hooks/useAnimals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Milk, Trash2, Loader2, Calendar, TrendingUp } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function MilkProduction() {
  const { milkProductions, isLoading, addMilkProduction, deleteMilkProduction, totalToday, totalThisMonth } = useMilkProductions();
  const { animals } = useAnimals();
  // Only female cattle that are active (inek type includes all cattle)
  const milkingAnimals = animals.filter(a => 
    a.status === 'aktif' && 
    a.gender === 'dişi' && 
    a.type === 'inek'
  );
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<string>('all');
  
  const [form, setForm] = useState({
    animal_id: '',
    date: new Date().toISOString().split('T')[0],
    morning_amount: '',
    evening_amount: '',
    quality: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMilkProduction.mutateAsync({
      animal_id: form.animal_id,
      date: form.date,
      morning_amount: Number(form.morning_amount) || 0,
      evening_amount: Number(form.evening_amount) || 0,
      quality: form.quality || null,
      notes: form.notes || null,
    });
    setForm({
      animal_id: '',
      date: new Date().toISOString().split('T')[0],
      morning_amount: '',
      evening_amount: '',
      quality: '',
      notes: '',
    });
    setIsOpen(false);
  };

  // Filter productions
  const filteredProductions = selectedAnimal === 'all' 
    ? milkProductions 
    : milkProductions.filter(m => m.animal_id === selectedAnimal);

  // Chart data - last 30 days
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  const dailyData = last30Days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayProductions = filteredProductions.filter(m => m.date === dateStr);
    const total = dayProductions.reduce((sum, m) => sum + Number(m.total_amount || 0), 0);
    return {
      date: format(day, 'dd MMM', { locale: tr }),
      total: total,
    };
  });

  // Monthly comparison data
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const monthlyData = daysInMonth.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayProductions = filteredProductions.filter(m => m.date === dateStr);
    const total = dayProductions.reduce((sum, m) => sum + Number(m.total_amount || 0), 0);
    return {
      date: format(day, 'd', { locale: tr }),
      total: total,
    };
  });

  // Average daily production
  const daysWithProduction = dailyData.filter(d => d.total > 0).length;
  const avgDaily = daysWithProduction > 0 
    ? dailyData.reduce((sum, d) => sum + d.total, 0) / daysWithProduction 
    : 0;

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
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Milk className="w-8 h-8 text-primary" />
              Süt Üretimi
            </h1>
            <p className="text-muted-foreground mt-1">Günlük süt miktarlarını takip edin</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="farm" className="gap-2">
                <Plus className="w-5 h-5" />
                Kayıt Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Süt Kaydı Ekle</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Hayvan *</Label>
                  <Select value={form.animal_id} onValueChange={(v) => setForm({ ...form, animal_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hayvan seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {milkingAnimals.map(animal => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.ear_tag} - {animal.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Tarih *</Label>
                  <Input 
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sabah (Litre)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={form.morning_amount}
                      onChange={(e) => setForm({ ...form, morning_amount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Akşam (Litre)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={form.evening_amount}
                      onChange={(e) => setForm({ ...form, evening_amount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Kalite</Label>
                  <Select value={form.quality} onValueChange={(v) => setForm({ ...form, quality: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kalite seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iyi">İyi</SelectItem>
                      <SelectItem value="orta">Orta</SelectItem>
                      <SelectItem value="kotu">Kötü</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Notlar</Label>
                  <Textarea 
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Ek notlar..."
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={addMilkProduction.isPending}>
                  {addMilkProduction.isPending ? 'Ekleniyor...' : 'Kaydet'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Milk className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bugün</p>
                  <p className="text-2xl font-bold">{totalToday.toFixed(1)} L</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bu Ay Toplam</p>
                  <p className="text-2xl font-bold">{totalThisMonth.toFixed(1)} L</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Günlük Ortalama</p>
                  <p className="text-2xl font-bold">{avgDaily.toFixed(1)} L</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Hayvan filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Hayvanlar</SelectItem>
                {milkingAnimals.map(animal => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.ear_tag} - {animal.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Son 30 Gün Üretim</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)} L`, 'Toplam']}
                      labelFormatter={(label) => `Tarih: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bu Ay Günlük Üretim</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)} L`, 'Toplam']}
                    />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Son Kayıtlar</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProductions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Milk className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Henüz süt kaydı yok</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Hayvan</TableHead>
                      <TableHead>Sabah</TableHead>
                      <TableHead>Akşam</TableHead>
                      <TableHead>Toplam</TableHead>
                      <TableHead>Kalite</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProductions.slice(0, 20).map((record) => {
                      const animal = animals.find(a => a.id === record.animal_id);
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            {format(new Date(record.date), 'dd MMM yyyy', { locale: tr })}
                          </TableCell>
                          <TableCell className="font-medium">{animal?.ear_tag || '-'}</TableCell>
                          <TableCell>{record.morning_amount || 0} L</TableCell>
                          <TableCell>{record.evening_amount || 0} L</TableCell>
                          <TableCell className="font-bold">{record.total_amount || 0} L</TableCell>
                          <TableCell>{record.quality || '-'}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMilkProduction.mutate(record.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
