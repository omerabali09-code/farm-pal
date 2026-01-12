import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { Animal } from '@/hooks/useAnimals';

interface AddAnimalDialogProps {
  onAdd: (animal: Omit<Animal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status' | 'sold_to' | 'sold_date' | 'sold_price' | 'death_date' | 'death_reason'>) => Promise<void>;
}

const ANIMAL_TYPE_LABELS: Record<string, string> = {
  'inek': 'İnek',
  'koyun': 'Koyun',
  'keçi': 'Keçi',
  'manda': 'Manda',
  'at': 'At',
  'diğer': 'Diğer',
};

export function AddAnimalDialog({ onAdd }: AddAnimalDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ear_tag: '',
    type: 'inek' as Animal['type'],
    breed: '',
    birth_date: '',
    gender: 'dişi' as Animal['gender'],
    notes: '',
    mother_ear_tag: '',
    profile_image_url: null as string | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onAdd({
        ...formData,
        notes: formData.notes || null,
        mother_ear_tag: formData.mother_ear_tag || null,
        profile_image_url: formData.profile_image_url,
      });
      setFormData({
        ear_tag: '',
        type: 'inek',
        breed: '',
        birth_date: '',
        gender: 'dişi',
        notes: '',
        mother_ear_tag: '',
        profile_image_url: null,
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
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
              <Label htmlFor="ear_tag">Küpe Numarası *</Label>
              <Input
                id="ear_tag"
                placeholder="TR-2024-XXX"
                value={formData.ear_tag}
                onChange={(e) => setFormData({ ...formData, ear_tag: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tür *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Animal['type']) => setFormData({ ...formData, type: value })}
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
                onValueChange={(value: Animal['gender']) => setFormData({ ...formData, gender: value })}
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
            <Label htmlFor="birth_date">Doğum Tarihi *</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mother_ear_tag">Anne Küpe No</Label>
            <Input
              id="mother_ear_tag"
              placeholder="Anne hayvanın küpe numarası"
              value={formData.mother_ear_tag}
              onChange={(e) => setFormData({ ...formData, mother_ear_tag: e.target.value })}
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
            <Button type="submit" variant="farm" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
