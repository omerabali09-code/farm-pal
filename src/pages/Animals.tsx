import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AnimalCard } from '@/components/animals/AnimalCard';
import { AddAnimalDialog } from '@/components/animals/AddAnimalDialog';
import { useAnimals, Animal } from '@/hooks/useAnimals';
import { useInseminations } from '@/hooks/useInseminations';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader2 } from 'lucide-react';

const ANIMAL_TYPE_LABELS: Record<string, string> = {
  'inek': 'İnek',
  'koyun': 'Koyun',
  'keçi': 'Keçi',
  'manda': 'Manda',
  'at': 'At',
  'diğer': 'Diğer',
};

export default function Animals() {
  const navigate = useNavigate();
  const { animals, isLoading, addAnimal } = useAnimals();
  const { inseminations } = useInseminations();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const pregnantAnimalIds = inseminations.filter(i => i.is_pregnant).map(i => i.animal_id);

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.ear_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || animal.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddAnimal = async (newAnimal: Omit<Animal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await addAnimal.mutateAsync(newAnimal);
  };

  const handleAnimalClick = (animal: Animal) => {
    navigate(`/hayvan/${animal.id}`);
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
            <h1 className="text-3xl font-bold text-foreground">Hayvanlar</h1>
            <p className="text-muted-foreground mt-1">
              Toplam {animals.length} hayvan kayıtlı
            </p>
          </div>
          <AddAnimalDialog onAdd={handleAddAnimal} />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
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

        {/* Animals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnimals.map(animal => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              isPregnant={pregnantAnimalIds.includes(animal.id)}
              onClick={() => handleAnimalClick(animal)}
            />
          ))}
        </div>

        {filteredAnimals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchTerm || filterType !== 'all' 
                ? 'Arama kriterlerine uygun hayvan bulunamadı' 
                : 'Henüz hayvan eklenmemiş'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
