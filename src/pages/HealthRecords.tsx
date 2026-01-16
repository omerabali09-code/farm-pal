import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { useAnimals } from '@/hooks/useAnimals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Stethoscope, Trash2, Loader2, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { HEALTH_RECORD_TYPES } from '@/data/vaccinationTypes';
import { Badge } from '@/components/ui/badge';

export default function HealthRecords() {
  const { healthRecords, isLoading, addHealthRecord, deleteHealthRecord } = useHealthRecords();
  const { animals } = useAnimals();
  const activeAnimals = animals.filter(a => a.status === 'aktif');
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<string>('all');
  
  const [form, setForm] = useState({
    animal_id: '',
    record_type: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    vet_name: '',
    cost: '',
    follow_up_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addHealthRecord.mutateAsync({
      animal_id: form.animal_id,
      record_type: form.record_type,
      title: form.title,
      description: form.description || null,
      date: form.date,
      vet_name: form.vet_name || null,
      cost: form.cost ? Number(form.cost) : null,
      medications: null,
      follow_up_date: form.follow_up_date || null,
    });
    setForm({
      animal_id: '',
      record_type: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      vet_name: '',
      cost: '',
      follow_up_date: '',
    });
    setIsOpen(false);
  };

  const filteredRecords = healthRecords.filter(record => {
    const animal = animals.find(a => a.id === record.animal_id);
    const matchesSearch = 
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal?.ear_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vet_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAnimal = selectedAnimal === 'all' || record.animal_id === selectedAnimal;
    return matchesSearch && matchesAnimal;
  });

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'treatment': return 'bg-primary/20 text-primary';
      case 'vet_visit': return 'bg-success/20 text-success';
      case 'surgery': return 'bg-destructive/20 text-destructive';
      case 'illness': return 'bg-warning/20 text-warning';
      case 'injury': return 'bg-orange-100 text-orange-800';
      default: return 'bg-muted text-muted-foreground';
    }
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
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="w-8 h-8 text-primary" />
              Sağlık Geçmişi
            </h1>
            <p className="text-muted-foreground mt-1">Veteriner ziyaretleri ve tedavi kayıtları</p>
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
                <DialogTitle>Sağlık Kaydı Ekle</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Hayvan *</Label>
                  <Select value={form.animal_id} onValueChange={(v) => setForm({ ...form, animal_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hayvan seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeAnimals.map(animal => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.ear_tag} - {animal.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Kayıt Tipi *</Label>
                  <Select value={form.record_type} onValueChange={(v) => setForm({ ...form, record_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tip seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {HEALTH_RECORD_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Başlık *</Label>
                  <Input 
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Örn: Ayak tedavisi"
                    required
                  />
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
                
                <div className="space-y-2">
                  <Label>Veteriner Adı</Label>
                  <Input 
                    value={form.vet_name}
                    onChange={(e) => setForm({ ...form, vet_name: e.target.value })}
                    placeholder="Dr. ..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Maliyet (₺)</Label>
                  <Input 
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Textarea 
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Tedavi detayları..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Kontrol Tarihi</Label>
                  <Input 
                    type="date"
                    value={form.follow_up_date}
                    onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={addHealthRecord.isPending}>
                  {addHealthRecord.isPending ? 'Ekleniyor...' : 'Kaydet'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Kayıt veya hayvan ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Hayvan filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Hayvanlar</SelectItem>
                  {activeAnimals.map(animal => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.ear_tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sağlık Kayıtları ({filteredRecords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Henüz sağlık kaydı yok</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Hayvan</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Veteriner</TableHead>
                      <TableHead>Maliyet</TableHead>
                      <TableHead>Kontrol</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      const animal = animals.find(a => a.id === record.animal_id);
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {format(new Date(record.date), 'dd MMM yyyy', { locale: tr })}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{animal?.ear_tag || '-'}</TableCell>
                          <TableCell>
                            <Badge className={getRecordTypeColor(record.record_type)}>
                              {HEALTH_RECORD_TYPES.find(t => t.value === record.record_type)?.label || record.record_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.title}</TableCell>
                          <TableCell>{record.vet_name || '-'}</TableCell>
                          <TableCell>{record.cost ? `₺${record.cost.toLocaleString('tr-TR')}` : '-'}</TableCell>
                          <TableCell>
                            {record.follow_up_date 
                              ? format(new Date(record.follow_up_date), 'dd MMM', { locale: tr })
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteHealthRecord.mutate(record.id)}
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
