import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface SellAnimalDialogProps {
  animalId: string;
  earTag: string;
  onSell: (data: { sold_to: string; sold_date: string; sold_price: number; notes?: string }) => Promise<void>;
}

export function SellAnimalDialog({ animalId, earTag, onSell }: SellAnimalDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sold_to: '',
    sold_date: format(new Date(), 'yyyy-MM-dd'),
    sold_price: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSell({
        sold_to: formData.sold_to,
        sold_date: formData.sold_date,
        sold_price: parseFloat(formData.sold_price),
        notes: formData.notes || undefined,
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ShoppingCart className="w-4 h-4" />
          Satıldı
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-popover">
        <DialogHeader>
          <DialogTitle>Hayvan Satışı - {earTag}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Alıcı Bilgisi *</Label>
            <Input
              placeholder="Alıcı adı veya firma"
              value={formData.sold_to}
              onChange={(e) => setFormData({ ...formData, sold_to: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Satış Tarihi *</Label>
              <Input
                type="date"
                value={formData.sold_date}
                onChange={(e) => setFormData({ ...formData, sold_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Satış Fiyatı (₺) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.sold_price}
                onChange={(e) => setFormData({ ...formData, sold_price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notlar</Label>
            <Textarea
              placeholder="Ek bilgiler..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="farm" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Satışı Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
