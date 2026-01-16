import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { VACCINATION_TYPES } from '@/data/vaccinationTypes';

export interface Vaccination {
  id: string;
  user_id: string;
  animal_id: string;
  name: string;
  date: string;
  next_date: string | null;
  completed: boolean;
  notes: string | null;
  created_at: string;
}

export function useVaccinations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vaccinations = [], isLoading } = useQuery({
    queryKey: ['vaccinations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Vaccination[];
    },
    enabled: !!user,
  });

  const addVaccination = useMutation({
    mutationFn: async (vaccination: Omit<Vaccination, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('vaccinations')
        .insert({
          ...vaccination,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      toast({
        title: "Aşı kaydedildi! 💉",
        description: "Aşı kaydı başarıyla eklendi.",
      });
    },
  });

  const updateVaccination = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vaccination> & { id: string }) => {
      const { data, error } = await supabase
        .from('vaccinations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
    },
  });

  const deleteVaccination = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vaccinations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
    },
  });

  const batchVaccinate = useMutation({
    mutationFn: async ({ animal_ids, name, date, next_date, cost }: { animal_ids: string[]; name: string; date: string; next_date?: string; cost?: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      const records = animal_ids.map(animal_id => ({
        user_id: user.id,
        animal_id,
        name,
        date,
        next_date: next_date || null,
        completed: true,
        notes: null,
      }));

      const { data, error } = await supabase
        .from('vaccinations')
        .insert(records)
        .select();
      
      if (error) throw error;
      
      // Add expense transaction if cost is provided
      if (cost && cost > 0) {
        const vaccineLabel = VACCINATION_TYPES.find(v => v.value === name)?.label || name;
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'gider',
            category: 'ilac',
            amount: cost,
            description: `${vaccineLabel} - ${animal_ids.length} hayvan aşılama`,
            date: date,
            animal_id: null,
          });
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Toplu aşılama tamamlandı! 💉",
        description: `${data.length} hayvana aşı kaydı eklendi.`,
      });
    },
  });

  return {
    vaccinations,
    isLoading,
    addVaccination,
    batchVaccinate,
    updateVaccination,
    deleteVaccination,
  };
}
