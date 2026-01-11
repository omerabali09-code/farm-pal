import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { differenceInMonths } from 'date-fns';

export interface Animal {
  id: string;
  user_id: string;
  ear_tag: string;
  type: 'inek' | 'koyun' | 'keçi' | 'manda' | 'at' | 'diğer';
  breed: string;
  birth_date: string;
  gender: 'dişi' | 'erkek';
  notes: string | null;
  mother_ear_tag: string | null;
  status: 'aktif' | 'satıldı' | 'öldü';
  profile_image_url: string | null;
  sold_to: string | null;
  sold_date: string | null;
  sold_price: number | null;
  death_date: string | null;
  death_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Get animal category based on age and gender
export function getAnimalCategory(animal: Animal): { label: string; color: string } {
  const ageInMonths = differenceInMonths(new Date(), new Date(animal.birth_date));
  
  if (animal.type === 'inek') {
    if (ageInMonths < 12) {
      return { label: 'Buzağı', color: 'bg-blue-100 text-blue-800' };
    } else if (ageInMonths >= 18) {
      if (animal.gender === 'erkek') {
        return { label: 'Dana', color: 'bg-amber-100 text-amber-800' };
      } else {
        return { label: 'Düve', color: 'bg-pink-100 text-pink-800' };
      }
    } else {
      return { label: animal.gender === 'erkek' ? 'Tosun' : 'Dişi Buzağı', color: 'bg-purple-100 text-purple-800' };
    }
  }
  
  return { label: animal.gender === 'erkek' ? 'Erkek' : 'Dişi', color: 'bg-gray-100 text-gray-800' };
}

export function useAnimals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: animals = [], isLoading } = useQuery({
    queryKey: ['animals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Animal[];
    },
    enabled: !!user,
  });

  const addAnimal = useMutation({
    mutationFn: async (animal: Omit<Animal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status' | 'sold_to' | 'sold_date' | 'sold_price' | 'death_date' | 'death_reason'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('animals')
        .insert({
          ...animal,
          user_id: user.id,
          status: 'aktif',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      toast({
        title: "Hayvan eklendi! 🎉",
        description: "Yeni hayvan başarıyla kaydedildi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Hayvan eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const updateAnimal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Animal> & { id: string }) => {
      const { data, error } = await supabase
        .from('animals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      toast({
        title: "Güncellendi",
        description: "Hayvan bilgileri güncellendi.",
      });
    },
  });

  const sellAnimal = useMutation({
    mutationFn: async ({ id, sold_to, sold_date, sold_price }: { id: string; sold_to: string; sold_date: string; sold_price: number }) => {
      const { data, error } = await supabase
        .from('animals')
        .update({
          status: 'satıldı',
          sold_to,
          sold_date,
          sold_price,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      toast({
        title: "Satış kaydedildi! 💰",
        description: "Hayvan satış bilgileri güncellendi.",
      });
    },
  });

  const markAsDead = useMutation({
    mutationFn: async ({ id, death_date, death_reason }: { id: string; death_date: string; death_reason?: string }) => {
      const { data, error } = await supabase
        .from('animals')
        .update({
          status: 'öldü',
          death_date,
          death_reason,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      toast({
        title: "Kayıt güncellendi",
        description: "Ölüm kaydı eklendi.",
      });
    },
  });

  const deleteAnimal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      toast({
        title: "Silindi",
        description: "Hayvan kaydı silindi.",
      });
    },
  });

  // Filter helpers
  const activeAnimals = animals.filter(a => a.status === 'aktif');
  const soldAnimals = animals.filter(a => a.status === 'satıldı');
  const deadAnimals = animals.filter(a => a.status === 'öldü');

  return {
    animals,
    activeAnimals,
    soldAnimals,
    deadAnimals,
    isLoading,
    addAnimal,
    updateAnimal,
    sellAnimal,
    markAsDead,
    deleteAnimal,
  };
}
