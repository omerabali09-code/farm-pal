import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Animal } from '@/hooks/useAnimals';

interface BatchSaleDialogProps {
  animals: Animal[];
  onBatchSale: (data: { 
    animal_ids: string[]; 
    sold_to: string; 
    sold_date: string; 
    sold_price: number;
  }) => Promise<void>;
}

const ANIMAL_TYPE_LABELS: Record<string, string> = {
  'inek': 'İnek',
  'koyun': 'Koyun',
  'keçi': 'Keçi',
  'manda': 'Manda',
  'at': 'At',
  'diğer': 'Diğer',
};

export function BatchSaleDialog({ animals, onBatchSale }: BatchSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    sold_to: '',
    sold_date: format(new Date(), 'yyyy-MM-dd'),
    sold_price: '',
  });

  const activeAnimals = animals.filter(a => a.status === 'aktif');
  const filteredAnimals = filterType === 'all' 
    ? activeAnimals 
    : activeAnimals.filter(a => a.type === filterType);

  const toggleAnimal = (id: string) => {
    setSelectedAnimals(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedAnimals.length === filteredAnimals.length) {
      setSelectedAnimals([]);
    } else {
      setSelectedAnimals(filteredAnimals.map(a => a.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnimals.length === 0 || !formData.sold_to || !formData.sold_price) return;
    
    setLoading(true);
    try {
      await onBatchSale({
        animal_ids: selectedAnimals,
        sold_to: formData.sold_to,
        sold_date: formData.sold_date,
        sold_price: Number(formData.sold_price),
      });
      setOpen(false);
      setSelectedAnimals([]);
      setFormData({ sold_to: '', sold_date: format(new Date(), 'yyyy-MM-dd'), sold_price: '' });
    } finally {
      setLoading(false);
    }
  };

  const pricePerAnimal = formData.sold_price ? Number(formData.sold_price) / selectedAnimals.length : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <DollarSign className="w-4 h-4" />
          Toplu Satış
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-popover max-w-lg">
        <DialogHeader>
          <DialogTitle>Toplu Satış Kaydı</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alıcı *</Label>
              <Input
                placeholder="Alıcı adı/firma"
                value={formData.sold_to}
                onChange={(e) => setFormData({ ...formData, sold_to: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Satış Tarihi *</Label>
              <Input
                type="date"
                value={formData.sold_date}
                onChange={(e) => setFormData({ ...formData, sold_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Toplam Satış Tutarı (₺) *</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={formData.sold_price}
              onChange={(e) => setFormData({ ...formData, sold_price: e.target.value })}
              required
              min="0"
              step="0.01"
            />
            {selectedAnimals.length > 1 && formData.sold_price && (
              <p className="text-xs text-muted-foreground">
                Hayvan başına: ₺{pricePerAnimal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Hayvanları Seç</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tür filtrele" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Tümü</SelectItem>
                  {Object.entries(ANIMAL_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
              <span>{selectedAnimals.length} hayvan seçildi</span>
              <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                {selectedAnimals.length === filteredAnimals.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </Button>
            </div>
            
            <ScrollArea className="h-48 border rounded-lg p-2">
              <div className="space-y-2">
                {filteredAnimals.map(animal => (
                  <div
                    key={animal.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleAnimal(animal.id)}
                  >
                    <Checkbox
                      checked={selectedAnimals.includes(animal.id)}
                      onCheckedChange={() => toggleAnimal(animal.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{animal.ear_tag}</p>
                      <p className="text-xs text-muted-foreground">{animal.breed}</p>
                    </div>
                  </div>
                ))}
                {filteredAnimals.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Aktif hayvan yok</p>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button 
              type="submit" 
              variant="farm" 
              className="flex-1" 
              disabled={loading || selectedAnimals.length === 0}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${selectedAnimals.length} Hayvan Sat`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
