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
// Sığır: 0-24 ay = Buzağı, 24-48 ay = Dana (erkek) / Düve (dişi), 48+ ay dişi = İnek
// Koyun: 0-12 ay = Kuzu, 12+ ay = Koç (erkek) / Koyun (dişi)
// Keçi: 0-12 ay = Oğlak, 12+ ay = Teke (erkek) / Keçi (dişi)
// Manda: 0-24 ay = Malak, 24-48 ay = Düğe (dişi) / Malak (erkek), 48+ ay = Manda
// At: 0-12 ay = Tay, 12-48 ay = Genç At, 48+ ay = At / Kısrak
export function getAnimalCategory(animal: Animal): { label: string; color: string } {
  const ageInMonths = differenceInMonths(new Date(), new Date(animal.birth_date));
  
  // Sığır (İnek tipi)
  if (animal.type === 'inek') {
    if (ageInMonths < 24) {
      return { label: 'Buzağı', color: 'bg-blue-100 text-blue-800' };
    } else if (ageInMonths < 48) {
      if (animal.gender === 'erkek') {
        return { label: 'Dana', color: 'bg-amber-100 text-amber-800' };
      } else {
        return { label: 'Düve', color: 'bg-pink-100 text-pink-800' };
      }
    } else {
      if (animal.gender === 'dişi') {
        return { label: 'İnek', color: 'bg-green-100 text-green-800' };
      } else {
        return { label: 'Boğa', color: 'bg-red-100 text-red-800' };
      }
    }
  }
  
  // Koyun
  if (animal.type === 'koyun') {
    if (ageInMonths < 12) {
      return { label: 'Kuzu', color: 'bg-sky-100 text-sky-800' };
    } else {
      if (animal.gender === 'erkek') {
        return { label: 'Koç', color: 'bg-orange-100 text-orange-800' };
      } else {
        return { label: 'Koyun', color: 'bg-rose-100 text-rose-800' };
      }
    }
  }
  
  // Keçi
  if (animal.type === 'keçi') {
    if (ageInMonths < 12) {
      return { label: 'Oğlak', color: 'bg-teal-100 text-teal-800' };
    } else {
      if (animal.gender === 'erkek') {
        return { label: 'Teke', color: 'bg-yellow-100 text-yellow-800' };
      } else {
        return { label: 'Keçi', color: 'bg-lime-100 text-lime-800' };
      }
    }
  }
  
  // Manda
  if (animal.type === 'manda') {
    if (ageInMonths < 24) {
      return { label: 'Malak', color: 'bg-indigo-100 text-indigo-800' };
    } else if (ageInMonths < 48) {
      if (animal.gender === 'dişi') {
        return { label: 'Düğe', color: 'bg-fuchsia-100 text-fuchsia-800' };
      } else {
        return { label: 'Genç Manda', color: 'bg-violet-100 text-violet-800' };
      }
    } else {
      return { label: 'Manda', color: 'bg-slate-100 text-slate-800' };
    }
  }
  
  // At
  if (animal.type === 'at') {
    if (ageInMonths < 12) {
      return { label: 'Tay', color: 'bg-cyan-100 text-cyan-800' };
    } else if (ageInMonths < 48) {
      return { label: 'Genç At', color: 'bg-emerald-100 text-emerald-800' };
    } else {
      if (animal.gender === 'dişi') {
        return { label: 'Kısrak', color: 'bg-pink-100 text-pink-800' };
      } else {
        return { label: 'At', color: 'bg-amber-100 text-amber-800' };
      }
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
    mutationFn: async ({ id, sold_to, sold_date, sold_price, ear_tag }: { id: string; sold_to: string; sold_date: string; sold_price: number; ear_tag?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Update animal status
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
      
      // Add income transaction automatically
      if (sold_price > 0) {
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'gelir',
            category: 'hayvan-satis',
            amount: sold_price,
            description: `${ear_tag || 'Hayvan'} satışı - ${sold_to}`,
            date: sold_date,
            animal_id: id,
          });
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Satış kaydedildi! 💰",
        description: "Satış bilgileri ve gelir kaydı oluşturuldu.",
      });
    },
  });

  const batchSell = useMutation({
    mutationFn: async ({ animal_ids, sold_to, sold_date, sold_price }: { animal_ids: string[]; sold_to: string; sold_date: string; sold_price: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      const pricePerAnimal = sold_price / animal_ids.length;
      const animalsToSell = animals.filter(a => animal_ids.includes(a.id));
      
      // Update all animals
      const { error } = await supabase
        .from('animals')
        .update({
          status: 'satıldı',
          sold_to,
          sold_date,
          sold_price: pricePerAnimal,
        })
        .in('id', animal_ids);
      
      if (error) throw error;
      
      // Add single income transaction for total
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'gelir',
          category: 'hayvan-satis',
          amount: sold_price,
          description: `Toplu satış (${animal_ids.length} hayvan) - ${sold_to}`,
          date: sold_date,
          animal_id: null,
        });
      
      return animal_ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Toplu satış kaydedildi! 💰",
        description: `${count} hayvan satıldı ve gelir kaydı oluşturuldu.`,
      });
    },
  });

  const batchMarkAsDead = useMutation({
    mutationFn: async ({ animal_ids, death_date, death_reason }: { animal_ids: string[]; death_date: string; death_reason?: string }) => {
      const { error } = await supabase
        .from('animals')
        .update({
          status: 'öldü',
          death_date,
          death_reason,
        })
        .in('id', animal_ids);
      
      if (error) throw error;
      return animal_ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      toast({
        title: "Kayıtlar güncellendi",
        description: `${count} hayvan için ölüm kaydı eklendi.`,
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
    batchSell,
    markAsDead,
    batchMarkAsDead,
    deleteAnimal,
  };
}
