import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MilkProduction {
  id: string;
  user_id: string;
  animal_id: string;
  date: string;
  morning_amount: number;
  evening_amount: number;
  total_amount: number;
  quality: string | null;
  notes: string | null;
  created_at: string;
}

export function useMilkProductions(animalId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: milkProductions = [], isLoading } = useQuery({
    queryKey: ['milk_productions', user?.id, animalId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('milk_productions')
        .select('*')
        .order('date', { ascending: false });
      
      if (animalId) {
        query = query.eq('animal_id', animalId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as MilkProduction[];
    },
    enabled: !!user,
  });

  const addMilkProduction = useMutation({
    mutationFn: async (record: Omit<MilkProduction, 'id' | 'user_id' | 'created_at' | 'total_amount'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('milk_productions')
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
      queryClient.invalidateQueries({ queryKey: ['milk_productions'] });
      toast({
        title: 'Süt kaydı eklendi! 🥛',
        description: 'Kayıt başarıyla kaydedildi.',
      });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast({
          title: 'Kayıt mevcut',
          description: 'Bu tarihte zaten bir kayıt var. Güncellemek için mevcut kaydı düzenleyin.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Hata',
          description: 'Kayıt eklenirken bir hata oluştu.',
          variant: 'destructive',
        });
      }
    },
  });

  const updateMilkProduction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MilkProduction> & { id: string }) => {
      const { data, error } = await supabase
        .from('milk_productions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milk_productions'] });
      toast({
        title: 'Güncellendi',
        description: 'Süt kaydı güncellendi.',
      });
    },
  });

  const deleteMilkProduction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('milk_productions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milk_productions'] });
      toast({
        title: 'Silindi',
        description: 'Süt kaydı silindi.',
      });
    },
  });

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayProduction = milkProductions.filter(m => m.date === today);
  const totalToday = todayProduction.reduce((sum, m) => sum + Number(m.total_amount), 0);

  // Monthly stats
  const thisMonth = new Date();
  const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1).toISOString().split('T')[0];
  const monthlyProduction = milkProductions.filter(m => m.date >= startOfMonth);
  const totalThisMonth = monthlyProduction.reduce((sum, m) => sum + Number(m.total_amount), 0);

  return {
    milkProductions,
    isLoading,
    addMilkProduction,
    updateMilkProduction,
    deleteMilkProduction,
    totalToday,
    totalThisMonth,
  };
}
