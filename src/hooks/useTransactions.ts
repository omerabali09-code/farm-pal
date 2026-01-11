import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'gelir' | 'gider';
  category: string;
  amount: number;
  description: string | null;
  date: string;
  animal_id: string | null;
  created_at: string;
}

export const EXPENSE_CATEGORIES = [
  { value: 'yem', label: 'Yem' },
  { value: 'veteriner', label: 'Veteriner' },
  { value: 'ilac', label: 'İlaç/Aşı' },
  { value: 'ekipman', label: 'Ekipman' },
  { value: 'iscilik', label: 'İşçilik' },
  { value: 'elektrik', label: 'Elektrik/Su' },
  { value: 'yakit', label: 'Yakıt' },
  { value: 'bakim', label: 'Bakım/Onarım' },
  { value: 'diger-gider', label: 'Diğer Gider' },
];

export const INCOME_CATEGORIES = [
  { value: 'sut', label: 'Süt Satışı' },
  { value: 'hayvan-satis', label: 'Hayvan Satışı' },
  { value: 'et', label: 'Et Satışı' },
  { value: 'gubre', label: 'Gübre Satışı' },
  { value: 'deri', label: 'Deri/Yün' },
  { value: 'destek', label: 'Devlet Desteği' },
  { value: 'diger-gelir', label: 'Diğer Gelir' },
];

export function useTransactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: variables.type === 'gelir' ? "Gelir eklendi! 💰" : "Gider eklendi! 📝",
        description: "Kayıt başarıyla oluşturuldu.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kayıt eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Silindi",
        description: "Kayıt başarıyla silindi.",
      });
    },
  });

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'gelir')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'gider')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    transactions,
    isLoading,
    addTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}
