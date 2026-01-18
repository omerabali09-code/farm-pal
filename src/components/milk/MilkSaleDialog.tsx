import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Settings, Milk } from 'lucide-react';
import { useMilkSales } from '@/hooks/useMilkSales';
import { useMilkProductions } from '@/hooks/useMilkProductions';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface MilkSaleDialogProps {
  trigger?: React.ReactNode;
}

export function MilkSaleDialog({ trigger }: MilkSaleDialogProps) {
  const { getMilkPrice, setMilkPrice, createMilkSale, monthlyMilkIncome } = useMilkSales();
  const { totalThisMonth } = useMilkProductions();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pricePerLiter, setPricePerLiter] = useState(getMilkPrice());
  const [form, setForm] = useState({
    liters: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    setPricePerLiter(getMilkPrice());
  }, []);

  const handleSavePrice = () => {
    setMilkPrice(pricePerLiter);
    setShowSettings(false);
    toast({
      title: 'Fiyat kaydedildi',
      description: `Süt fiyatı: ₺${pricePerLiter}/litre`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.liters) return;

    await createMilkSale({
      liters: parseFloat(form.liters),
      pricePerLiter,
      date: form.date,
      description: form.description,
    });

    setForm({
      liters: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setIsOpen(false);
  };

  const calculatedAmount = form.liters ? parseFloat(form.liters) * pricePerLiter : 0;
  const potentialMonthlyIncome = totalThisMonth * pricePerLiter;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Süt Satışı
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Milk className="w-5 h-5 text-primary" />
            Süt Satışı Kaydı
          </DialogTitle>
        </DialogHeader>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Bu Ay Üretim</p>
              <p className="text-lg font-bold">{totalThisMonth.toFixed(1)} L</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Potansiyel Gelir</p>
              <p className="text-lg font-bold text-success">₺{potentialMonthlyIncome.toLocaleString('tr-TR')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Price Settings */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">Litre Fiyatı</p>
            <p className="text-2xl font-bold text-primary">₺{pricePerLiter}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {showSettings && (
          <div className="flex gap-2">
            <Input
              type="number"
              value={pricePerLiter}
              onChange={(e) => setPricePerLiter(parseFloat(e.target.value) || 0)}
              placeholder="Litre fiyatı"
            />
            <Button onClick={handleSavePrice}>Kaydet</Button>
          </div>
        )}

        {/* Sale Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Satılan Miktar (Litre) *</Label>
            <Input
              type="number"
              step="0.1"
              value={form.liters}
              onChange={(e) => setForm({ ...form, liters: e.target.value })}
              placeholder="Örn: 100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Satış Tarihi *</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Satış detayları..."
            />
          </div>

          {form.liters && (
            <div className="p-4 bg-success/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Toplam Gelir</p>
              <p className="text-3xl font-bold text-success">₺{calculatedAmount.toLocaleString('tr-TR')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {form.liters} L x ₺{pricePerLiter}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!form.liters}>
            Satış Kaydı Oluştur
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
