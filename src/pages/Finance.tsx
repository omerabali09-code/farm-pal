import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTransactions, Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/hooks/useTransactions';
import { useAnimals } from '@/hooks/useAnimals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Loader2, TrendingUp, TrendingDown, Wallet, 
  Trash2, Calendar, Filter 
} from 'lucide-react';
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Finance() {
  const { transactions, isLoading, addTransaction, deleteTransaction, totalIncome, totalExpense, balance } = useTransactions();
  const { animals } = useAnimals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState('all');
  const [formData, setFormData] = useState({
    type: 'gider' as 'gelir' | 'gider',
    category: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    animal_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      await addTransaction.mutateAsync({
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        date: formData.date,
        animal_id: formData.animal_id || null,
      });
      setFormData({
        type: 'gider',
        category: '',
        amount: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        animal_id: '',
      });
      setDialogOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      await deleteTransaction.mutateAsync(id);
    }
  };

  // Filter transactions by month
  const filteredTransactions = filterMonth === 'all' 
    ? transactions 
    : transactions.filter(t => {
        const monthsAgo = parseInt(filterMonth);
        const targetDate = subMonths(new Date(), monthsAgo);
        return isWithinInterval(new Date(t.date), {
          start: startOfMonth(targetDate),
          end: endOfMonth(targetDate),
        });
      });

  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'gelir')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const filteredExpense = filteredTransactions
    .filter(t => t.type === 'gider')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const getCategoryLabel = (category: string, type: string) => {
    const categories = type === 'gelir' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return categories.find(c => c.value === category)?.label || category;
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
            <h1 className="text-3xl font-bold text-foreground">Gelir / Gider Takibi</h1>
            <p className="text-muted-foreground mt-1">
              Çiftlik mali durumunu takip edin
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="farm" size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Kayıt Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-popover sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Yeni Gelir/Gider Kaydı</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Tabs value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as 'gelir' | 'gider', category: '' })}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="gider" className="gap-2">
                      <TrendingDown className="w-4 h-4" /> Gider
                    </TabsTrigger>
                    <TabsTrigger value="gelir" className="gap-2">
                      <TrendingUp className="w-4 h-4" /> Gelir
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-2">
                  <Label>Kategori *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {(formData.type === 'gelir' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tutar (₺) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tarih *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {formData.type === 'gelir' && formData.category === 'hayvan-satis' && (
                  <div className="space-y-2">
                    <Label>İlgili Hayvan</Label>
                    <Select value={formData.animal_id} onValueChange={(v) => setFormData({ ...formData, animal_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Hayvan seçin (opsiyonel)" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {animals.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.ear_tag} - {a.breed}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    placeholder="Detaylı açıklama..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-success/30 bg-success/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-success">₺{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Gider</p>
                  <p className="text-2xl font-bold text-destructive">₺{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            balance >= 0 ? 'border-primary/30 bg-primary/5' : 'border-warning/30 bg-warning/5'
          )}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  balance >= 0 ? 'bg-primary/20' : 'bg-warning/20'
                )}>
                  <Wallet className={cn("w-6 h-6", balance >= 0 ? 'text-primary' : 'text-warning')} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Bakiye</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    balance >= 0 ? 'text-primary' : 'text-warning'
                  )}>
                    {balance >= 0 ? '+' : ''}₺{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Tüm Zamanlar</SelectItem>
              <SelectItem value="0">Bu Ay</SelectItem>
              <SelectItem value="1">Geçen Ay</SelectItem>
              <SelectItem value="2">2 Ay Önce</SelectItem>
              <SelectItem value="3">3 Ay Önce</SelectItem>
            </SelectContent>
          </Select>
          {filterMonth !== 'all' && (
            <div className="text-sm text-muted-foreground">
              Gelir: <span className="text-success font-medium">₺{filteredIncome.toLocaleString('tr-TR')}</span>
              {' • '}
              Gider: <span className="text-destructive font-medium">₺{filteredExpense.toLocaleString('tr-TR')}</span>
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className={cn(
              "transition-all hover:shadow-farm-md",
              transaction.type === 'gelir' 
                ? 'border-l-4 border-l-success' 
                : 'border-l-4 border-l-destructive'
            )}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      transaction.type === 'gelir' ? 'bg-success/20' : 'bg-destructive/20'
                    )}>
                      {transaction.type === 'gelir' 
                        ? <TrendingUp className="w-5 h-5 text-success" />
                        : <TrendingDown className="w-5 h-5 text-destructive" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {getCategoryLabel(transaction.category, transaction.type)}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {transaction.type === 'gelir' ? 'Gelir' : 'Gider'}
                        </Badge>
                      </div>
                      {transaction.description && (
                        <p className="text-sm text-muted-foreground">{transaction.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {format(new Date(transaction.date), 'd MMMM yyyy', { locale: tr })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <p className={cn(
                      "text-xl font-bold",
                      transaction.type === 'gelir' ? 'text-success' : 'text-destructive'
                    )}>
                      {transaction.type === 'gelir' ? '+' : '-'}₺{Number(transaction.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 bg-card rounded-2xl border-2">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz kayıt yok</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
