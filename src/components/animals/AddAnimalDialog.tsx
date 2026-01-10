import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Animal, AnimalType, Gender, ANIMAL_TYPE_LABELS } from '@/types/animal';

interface AddAnimalDialogProps {
  onAdd: (animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function AddAnimalDialog({ onAdd }: AddAnimalDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    earTag: '',
    type: 'inek' as AnimalType,
    breed: '',
    birthDate: '',
    gender: 'dişi' as Gender,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      earTag: '',
      type: 'inek',
      breed: '',
      birthDate: '',
      gender: 'dişi',
      notes: '',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="farm" size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Hayvan Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-popover">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Yeni Hayvan Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="earTag">Küpe Numarası *</Label>
              <Input
                id="earTag"
                placeholder="TR-2024-XXX"
                value={formData.earTag}
                onChange={(e) => setFormData({ ...formData, earTag: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tür *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: AnimalType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {Object.entries(ANIMAL_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Irk *</Label>
              <Input
                id="breed"
                placeholder="Simental, Holstein..."
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Cinsiyet *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: Gender) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="dişi">Dişi</SelectItem>
                  <SelectItem value="erkek">Erkek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Doğum Tarihi *</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              placeholder="Hayvan hakkında ek bilgiler..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="farm" className="flex-1">
              Kaydet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
