import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Animal {
  id: string;
  user_id: string;
  ear_tag: string;
  type: 'inek' | 'koyun' | 'keçi' | 'manda' | 'at' | 'diğer';
  breed: string;
  birth_date: string;
  gender: 'dişi' | 'erkek';
  notes: string | null;
  created_at: string;
  updated_at: string;
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
    mutationFn: async (animal: Omit<Animal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('animals')
        .insert({
          ...animal,
          user_id: user.id,
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
    onError: (error) => {
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

  return {
    animals,
    isLoading,
    addAnimal,
    updateAnimal,
    deleteAnimal,
  };
}
