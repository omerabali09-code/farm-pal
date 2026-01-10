import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAnimals } from '@/hooks/useAnimals';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useInseminations } from '@/hooks/useInseminations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Calendar, Syringe, Baby, FileText, 
  Edit, Trash2, AlertTriangle, CheckCircle 
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
  const { animals, deleteAnimal } = useAnimals();
  const { vaccinations } = useVaccinations();
  const { inseminations } = useInseminations();

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

  const handleDelete = async () => {
    if (confirm('Bu hayvanı silmek istediğinize emin misiniz?')) {
      await deleteAnimal.mutateAsync(animal.id);
      navigate('/hayvanlar');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/hayvanlar')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-4xl shadow-farm-md">
              {ANIMAL_TYPE_ICONS[animal.type]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{animal.ear_tag}</h1>
                {isPregnant && (
                  <Badge variant="default" className="bg-success">Gebe</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {ANIMAL_TYPE_LABELS[animal.type]} • {animal.breed} • {animal.gender}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
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
        <Tabs defaultValue="vaccinations">
          <TabsList>
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
    </MainLayout>
  );
}
