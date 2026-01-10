import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AnimalCard } from '@/components/animals/AnimalCard';
import { AddAnimalDialog } from '@/components/animals/AddAnimalDialog';
import { mockAnimals, mockInseminations } from '@/data/mockData';
import { Animal, AnimalType, ANIMAL_TYPE_LABELS } from '@/types/animal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Animals() {
  const [animals, setAnimals] = useState<Animal[]>(mockAnimals);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<AnimalType | 'all'>('all');
  const { toast } = useToast();

  const pregnantAnimalIds = mockInseminations.filter(i => i.isPregnant).map(i => i.animalId);

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.earTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || animal.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddAnimal = (newAnimal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const animal: Animal = {
      ...newAnimal,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAnimals([animal, ...animals]);
    toast({
      title: "Hayvan eklendi! 🎉",
      description: `${animal.earTag} numaralı hayvan başarıyla kaydedildi.`,
    });
  };

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
            <Select value={filterType} onValueChange={(v) => setFilterType(v as AnimalType | 'all')}>
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
