import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Syringe, Loader2, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Animal } from '@/hooks/useAnimals';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BatchVaccinationDialogProps {
  animals: Animal[];
  onBatchVaccinate: (data: { animal_ids: string[]; name: string; date: string; next_date?: string }) => Promise<void>;
}

const ANIMAL_TYPE_LABELS: Record<string, string> = {
  'inek': 'İnek',
  'koyun': 'Koyun',
  'keçi': 'Keçi',
  'manda': 'Manda',
  'at': 'At',
  'diğer': 'Diğer',
};

export function BatchVaccinationDialog({ animals, onBatchVaccinate }: BatchVaccinationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    next_date: '',
  });

  const activeAnimals = animals.filter(a => !('status' in a) || (a as any).status === 'aktif');
  
  const filteredAnimals = filterType === 'all'
    ? activeAnimals
    : activeAnimals.filter(a => a.type === filterType);

  const toggleAnimal = (id: string) => {
    setSelectedAnimalIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedAnimalIds.length === filteredAnimals.length) {
      setSelectedAnimalIds([]);
    } else {
      setSelectedAnimalIds(filteredAnimals.map(a => a.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnimalIds.length === 0) return;
    
    setLoading(true);
    try {
      await onBatchVaccinate({
        animal_ids: selectedAnimalIds,
        name: formData.name,
        date: formData.date,
        next_date: formData.next_date || undefined,
      });
      setOpen(false);
      setSelectedAnimalIds([]);
      setFormData({
        name: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        next_date: '',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <CheckSquare className="w-5 h-5" />
          Toplu Aşılama
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-popover sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Toplu Aşı Kaydı</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aşı Adı *</Label>
              <Input
                placeholder="Şap Aşısı, Brusella..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Türe Göre Filtrele</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Tümü</SelectItem>
                  {Object.entries(ANIMAL_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Yapıldığı Tarih *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Sonraki Tarih</Label>
              <Input
                type="date"
                value={formData.next_date}
                onChange={(e) => setFormData({ ...formData, next_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Hayvanları Seçin ({selectedAnimalIds.length} seçili)</Label>
              <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                {selectedAnimalIds.length === filteredAnimals.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
              </Button>
            </div>
            <ScrollArea className="h-[200px] border rounded-lg p-3">
              <div className="space-y-2">
                {filteredAnimals.map((animal) => (
                  <div
                    key={animal.id}
                    className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                    onClick={() => toggleAnimal(animal.id)}
                  >
                    <Checkbox
                      checked={selectedAnimalIds.includes(animal.id)}
                      onCheckedChange={() => toggleAnimal(animal.id)}
                    />
                    <span className="font-medium">{animal.ear_tag}</span>
                    <span className="text-sm text-muted-foreground">
                      {ANIMAL_TYPE_LABELS[animal.type]} • {animal.breed}
                    </span>
                  </div>
                ))}
                {filteredAnimals.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Hayvan bulunamadı</p>
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
              disabled={loading || selectedAnimalIds.length === 0}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Syringe className="w-4 h-4 mr-2" />
                  {selectedAnimalIds.length} Hayvana Aşı Yap
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
