import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAnimals, Animal, getAnimalCategory } from '@/hooks/useAnimals';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Loader2, DollarSign, Skull, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ANIMAL_TYPE_LABELS: Record<string, string> = {
  'inek': 'İnek',
  'koyun': 'Koyun',
  'keçi': 'Keçi',
  'manda': 'Manda',
  'at': 'At',
  'diğer': 'Diğer',
};

export default function ExitedAnimals() {
  const navigate = useNavigate();
  const { soldAnimals, deadAnimals, isLoading } = useAnimals();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'sold' | 'dead'>('sold');

  const currentAnimals = activeTab === 'sold' ? soldAnimals : deadAnimals;

  const filteredAnimals = currentAnimals.filter(animal => {
    const matchesSearch = animal.ear_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || animal.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAnimalClick = (animal: Animal) => {
    navigate(`/hayvan/${animal.id}`);
  };

  // Calculate total income from sold animals
  const totalSaleIncome = soldAnimals.reduce((sum, animal) => sum + (animal.sold_price || 0), 0);

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
            <h1 className="text-3xl font-bold text-foreground">Çıkış Yapan Hayvanlar</h1>
            <p className="text-muted-foreground mt-1">
              Satılan ve ölen hayvanların kayıtları
            </p>
          </div>
          <div className="flex gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="flex items-center gap-2 p-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-green-600">Toplam Satış Geliri</p>
                  <p className="font-bold text-green-700">{totalSaleIncome.toLocaleString('tr-TR')} ₺</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sold' | 'dead')}>
          <TabsList>
            <TabsTrigger value="sold" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Satılan ({soldAnimals.length})
            </TabsTrigger>
            <TabsTrigger value="dead" className="gap-2">
              <Skull className="w-4 h-4" />
              Ölen ({deadAnimals.length})
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Küpe no veya ırk ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tür seçin" />
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

          <TabsContent value="sold" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnimals.map(animal => {
                const category = getAnimalCategory(animal);
                return (
                  <Card 
                    key={animal.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-green-200 bg-green-50/50"
                    onClick={() => handleAnimalClick(animal)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{animal.ear_tag}</h3>
                          <p className="text-sm text-muted-foreground">{animal.breed}</p>
                        </div>
                        <Badge className={category.color}>{category.label}</Badge>
                      </div>
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-green-700">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">{animal.sold_price?.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{animal.sold_date ? format(new Date(animal.sold_date), 'dd MMM yyyy', { locale: tr }) : '-'}</span>
                        </div>
                        {animal.sold_to && (
                          <p className="text-muted-foreground">Alıcı: {animal.sold_to}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="dead" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnimals.map(animal => {
                const category = getAnimalCategory(animal);
                return (
                  <Card 
                    key={animal.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-gray-300 bg-gray-50/50"
                    onClick={() => handleAnimalClick(animal)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{animal.ear_tag}</h3>
                          <p className="text-sm text-muted-foreground">{animal.breed}</p>
                        </div>
                        <Badge className={category.color}>{category.label}</Badge>
                      </div>
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{animal.death_date ? format(new Date(animal.death_date), 'dd MMM yyyy', { locale: tr }) : '-'}</span>
                        </div>
                        {animal.death_reason && (
                          <p className="text-muted-foreground">Sebep: {animal.death_reason}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {filteredAnimals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchTerm || filterType !== 'all' 
                ? 'Arama kriterlerine uygun hayvan bulunamadı' 
                : activeTab === 'sold' ? 'Henüz satılan hayvan yok' : 'Henüz ölen hayvan yok'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}