import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skull, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface MarkDeadDialogProps {
  animalId: string;
  earTag: string;
  onMarkDead: (data: { death_date: string; death_reason?: string }) => Promise<void>;
}

export function MarkDeadDialog({ animalId, earTag, onMarkDead }: MarkDeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    death_date: format(new Date(), 'yyyy-MM-dd'),
    death_reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onMarkDead({
        death_date: formData.death_date,
        death_reason: formData.death_reason || undefined,
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Skull className="w-4 h-4" />
          Öldü
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-popover">
        <DialogHeader>
          <DialogTitle className="text-destructive">Ölüm Kaydı - {earTag}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            <Textarea
              placeholder="Hastalık, kaza vb..."
              value={formData.death_reason}
              onChange={(e) => setFormData({ ...formData, death_reason: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="destructive" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
