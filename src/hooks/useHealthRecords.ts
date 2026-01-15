import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface HealthRecord {
  id: string;
  user_id: string;
  animal_id: string;
  record_type: string;
  title: string;
  description: string | null;
  date: string;
  vet_name: string | null;
  cost: number | null;
  medications: string[] | null;
  follow_up_date: string | null;
  created_at: string;
}

export function useHealthRecords(animalId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: healthRecords = [], isLoading } = useQuery({
    queryKey: ['health_records', user?.id, animalId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('health_records')
        .select('*')
        .order('date', { ascending: false });
      
      if (animalId) {
        query = query.eq('animal_id', animalId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as HealthRecord[];
    },
    enabled: !!user,
  });

  const addHealthRecord = useMutation({
    mutationFn: async (record: Omit<HealthRecord, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('health_records')
        .insert({
          ...record,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health_records'] });
      toast({
        title: 'Sağlık kaydı eklendi! 🩺',
        description: 'Kayıt başarıyla kaydedildi.',
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Kayıt eklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    },
  });

  const deleteHealthRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health_records'] });
      toast({
        title: 'Silindi',
        description: 'Sağlık kaydı silindi.',
      });
    },
  });

  return {
    healthRecords,
    isLoading,
    addHealthRecord,
    deleteHealthRecord,
  };
}
