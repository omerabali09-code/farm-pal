import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Insemination {
  id: string;
  user_id: string;
  animal_id: string;
  date: string;
  type: 'doğal' | 'suni';
  expected_birth_date: string;
  actual_birth_date: string | null;
  is_pregnant: boolean;
  notes: string | null;
  created_at: string;
}

export function useInseminations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inseminations = [], isLoading } = useQuery({
    queryKey: ['inseminations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('inseminations')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Insemination[];
    },
    enabled: !!user,
  });

  const addInsemination = useMutation({
    mutationFn: async (insemination: Omit<Insemination, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('inseminations')
        .insert({
          ...insemination,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inseminations'] });
      toast({
        title: "Kayıt eklendi! 🐄",
        description: "Tohumlama kaydı başarıyla eklendi.",
      });
    },
  });

  const updateInsemination = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Insemination> & { id: string }) => {
      const { data, error } = await supabase
        .from('inseminations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inseminations'] });
    },
  });

  const deleteInsemination = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inseminations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inseminations'] });
    },
  });

  return {
    inseminations,
    isLoading,
    addInsemination,
    updateInsemination,
    deleteInsemination,
  };
}
