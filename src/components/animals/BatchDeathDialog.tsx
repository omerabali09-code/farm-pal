import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skull, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Animal } from '@/hooks/useAnimals';

interface BatchDeathDialogProps {
  animals: Animal[];
  onBatchDeath: (data: { animal_ids: string[]; death_date: string; death_reason?: string }) => Promise<void>;
}

const ANIMAL_TYPE_LABELS: Record<string, string> = {
  'inek': 'İnek',
  'koyun': 'Koyun',
  'keçi': 'Keçi',
  'manda': 'Manda',
  'at': 'At',
  'diğer': 'Diğer',
};

export function BatchDeathDialog({ animals, onBatchDeath }: BatchDeathDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    death_date: format(new Date(), 'yyyy-MM-dd'),
    death_reason: '',
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
    if (selectedAnimals.length === 0) return;
    
    setLoading(true);
    try {
      await onBatchDeath({
        animal_ids: selectedAnimals,
        death_date: formData.death_date,
        death_reason: formData.death_reason || undefined,
      });
      setOpen(false);
      setSelectedAnimals([]);
      setFormData({ death_date: format(new Date(), 'yyyy-MM-dd'), death_reason: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
          <Skull className="w-4 h-4" />
          Toplu Ölüm
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-popover max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-destructive">Toplu Ölüm Kaydı</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ölüm Tarihi *</Label>
              <Input
                type="date"
                value={formData.death_date}
                onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Ölüm Sebebi</Label>
              <Input
                placeholder="Hastalık, kaza vb."
                value={formData.death_reason}
                onChange={(e) => setFormData({ ...formData, death_reason: e.target.value })}
              />
            </div>
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
              variant="destructive" 
              className="flex-1" 
              disabled={loading || selectedAnimals.length === 0}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${selectedAnimals.length} Hayvan Kaydet`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
