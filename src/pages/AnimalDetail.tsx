import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAnimals, getAnimalCategory } from '@/hooks/useAnimals';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useInseminations } from '@/hooks/useInseminations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimalPhotoGallery } from '@/components/animals/AnimalPhotoGallery';
import { SellAnimalDialog } from '@/components/animals/SellAnimalDialog';
import { MarkDeadDialog } from '@/components/animals/MarkDeadDialog';
import { 
  ArrowLeft, Calendar, Syringe, Baby, FileText, 
  Edit, Trash2, AlertTriangle, CheckCircle, Camera,
  DollarSign, Skull, Tag
} from 'lucide-react';
import { format, differenceInDays, differenceInYears, differenceInMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ANIMAL_TYPE_ICONS: Record<string, string> = {
  'inek': '🐄',
  'koyun': '🐑',
  'keçi': '🐐',
  'manda': '🐃',
  'at': '🐴',
  'diğer': '🐾',
};

const ANIMAL_TYPE_LABELS: Record<string, string> = {
  'inek': 'İnek',
  'koyun': 'Koyun',
  'keçi': 'Keçi',
  'manda': 'Manda',
  'at': 'At',
  'diğer': 'Diğer',
};

export default function AnimalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { animals, deleteAnimal, sellAnimal, markAsDead } = useAnimals();
  const { vaccinations } = useVaccinations();
  const { inseminations } = useInseminations();
  
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [deadDialogOpen, setDeadDialogOpen] = useState(false);

  const animal = animals.find(a => a.id === id);
  const animalVaccinations = vaccinations.filter(v => v.animal_id === id);
  const animalInseminations = inseminations.filter(i => i.animal_id === id);

  if (!animal) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Hayvan bulunamadı</p>
          <Button variant="outline" onClick={() => navigate('/hayvanlar')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
          </Button>
        </div>
      </MainLayout>
    );
  }

  const birthDate = new Date(animal.birth_date);
  const years = differenceInYears(new Date(), birthDate);
  const months = differenceInMonths(new Date(), birthDate) % 12;
  const ageText = years > 0 ? `${years} yıl ${months > 0 ? `${months} ay` : ''}` : `${months} ay`;
  
  const isPregnant = animalInseminations.some(i => i.is_pregnant);
  const currentPregnancy = animalInseminations.find(i => i.is_pregnant);
  const today = new Date();
  const category = getAnimalCategory(animal);

  const handleDelete = async () => {
    if (confirm('Bu hayvanı silmek istediğinize emin misiniz?')) {
      await deleteAnimal.mutateAsync(animal.id);
      navigate('/hayvanlar');
    }
  };

  const handleSell = async (data: { sold_to: string; sold_date: string; sold_price: number }) => {
    await sellAnimal.mutateAsync({ id: animal.id, ...data });
    setSellDialogOpen(false);
  };

  const handleMarkDead = async (data: { death_date: string; death_reason?: string }) => {
    await markAsDead.mutateAsync({ id: animal.id, ...data });
    setDeadDialogOpen(false);
  };

  // Show sold or dead status
  if (animal.status === 'satıldı') {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/hayvanlar')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{animal.ear_tag}</h1>
              <Badge variant="secondary" className="mt-1">Satıldı</Badge>
            </div>
          </div>
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <DollarSign className="w-10 h-10 text-warning" />
                <div>
                  <p className="font-bold text-lg">Bu hayvan satılmıştır</p>
                  <p className="text-muted-foreground">
                    Satış Tarihi: {animal.sold_date && format(new Date(animal.sold_date), 'd MMMM yyyy', { locale: tr })}
                  </p>
                  <p className="text-muted-foreground">Alıcı: {animal.sold_to}</p>
                  <p className="text-success font-bold">Satış Fiyatı: ₺{animal.sold_price?.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (animal.status === 'öldü') {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/hayvanlar')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{animal.ear_tag}</h1>
              <Badge variant="destructive" className="mt-1">Öldü</Badge>
            </div>
          </div>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skull className="w-10 h-10 text-destructive" />
                <div>
                  <p className="font-bold text-lg">Bu hayvan vefat etmiştir</p>
                  <p className="text-muted-foreground">
                    Ölüm Tarihi: {animal.death_date && format(new Date(animal.death_date), 'd MMMM yyyy', { locale: tr })}
                  </p>
                  {animal.death_reason && (
                    <p className="text-muted-foreground">Sebep: {animal.death_reason}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/hayvanlar')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-4xl shadow-farm-md overflow-hidden">
              {animal.profile_image_url ? (
                <img src={animal.profile_image_url} alt={animal.ear_tag} className="w-full h-full object-cover" />
              ) : (
                ANIMAL_TYPE_ICONS[animal.type]
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{animal.ear_tag}</h1>
                <Badge className={category.color}>{category.label}</Badge>
                {isPregnant && (
                  <Badge variant="default" className="bg-success">Gebe</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {ANIMAL_TYPE_LABELS[animal.type]} • {animal.breed} • {animal.gender}
              </p>
              {animal.mother_ear_tag && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Anne: {animal.mother_ear_tag}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setSellDialogOpen(true)}>
              <DollarSign className="w-4 h-4 mr-1" /> Sat
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDeadDialogOpen(true)}>
              <Skull className="w-4 h-4 mr-1" /> Öldü
            </Button>
            <Button variant="outline" size="icon">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Yaş</p>
              <p className="text-xl font-bold">{ageText}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Doğum Tarihi</p>
              <p className="text-xl font-bold">
                {format(birthDate, 'd MMM yyyy', { locale: tr })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Aşı Sayısı</p>
              <p className="text-xl font-bold">{animalVaccinations.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Tohumlama Sayısı</p>
              <p className="text-xl font-bold">{animalInseminations.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Pregnancy Alert */}
        {currentPregnancy && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <Baby className="w-8 h-8 text-success" />
                <div>
                  <p className="font-bold text-foreground">Aktif Gebelik</p>
                  <p className="text-sm text-muted-foreground">
                    Tahmini doğum: {format(new Date(currentPregnancy.expected_birth_date), 'd MMMM yyyy', { locale: tr })}
                    {' • '}
                    {differenceInDays(new Date(currentPregnancy.expected_birth_date), today)} gün kaldı
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="photos">
          <TabsList className="flex-wrap">
            <TabsTrigger value="photos">
              <Camera className="w-4 h-4 mr-2" /> Fotoğraflar
            </TabsTrigger>
            <TabsTrigger value="vaccinations">
              <Syringe className="w-4 h-4 mr-2" /> Aşılar ({animalVaccinations.length})
            </TabsTrigger>
            <TabsTrigger value="inseminations">
              <Baby className="w-4 h-4 mr-2" /> Tohumlamalar ({animalInseminations.length})
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="w-4 h-4 mr-2" /> Notlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="mt-4">
            <AnimalPhotoGallery animalId={animal.id} />
          </TabsContent>

          <TabsContent value="vaccinations" className="mt-4 space-y-3">
            {animalVaccinations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Henüz aşı kaydı yok
                </CardContent>
              </Card>
            ) : (
              animalVaccinations.map(v => {
                const isOverdue = v.next_date && differenceInDays(new Date(v.next_date), today) < 0;
                return (
                  <Card key={v.id} className={cn(isOverdue && 'border-destructive/30')}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            isOverdue ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'
                          )}>
                            {isOverdue ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-semibold">{v.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Yapıldı: {format(new Date(v.date), 'd MMM yyyy', { locale: tr })}
                            </p>
                          </div>
                        </div>
                        {v.next_date && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Sonraki</p>
                            <p className={cn("font-medium", isOverdue && 'text-destructive')}>
                              {format(new Date(v.next_date), 'd MMM yyyy', { locale: tr })}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="inseminations" className="mt-4 space-y-3">
            {animalInseminations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Henüz tohumlama kaydı yok
                </CardContent>
              </Card>
            ) : (
              animalInseminations.map(i => (
                <Card key={i.id} className={cn(i.is_pregnant && 'border-success/30')}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          i.is_pregnant ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                        )}>
                          <Baby className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{i.type} Tohumlama</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(i.date), 'd MMM yyyy', { locale: tr })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={i.is_pregnant ? 'default' : 'secondary'}>
                          {i.is_pregnant ? 'Gebe' : 'Tamamlandı'}
                        </Badge>
                        {i.is_pregnant && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Doğum: {format(new Date(i.expected_birth_date), 'd MMM', { locale: tr })}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardContent className="py-4">
                {animal.notes ? (
                  <p className="whitespace-pre-wrap">{animal.notes}</p>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Henüz not eklenmemiş</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <SellAnimalDialog
        open={sellDialogOpen}
        onOpenChange={setSellDialogOpen}
        onSell={handleSell}
        animalTag={animal.ear_tag}
      />
      <MarkDeadDialog
        open={deadDialogOpen}
        onOpenChange={setDeadDialogOpen}
        onMarkDead={handleMarkDead}
        animalTag={animal.ear_tag}
      />
    </MainLayout>
  );
}
