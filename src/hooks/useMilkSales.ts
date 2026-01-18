import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from './useTransactions';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface MilkSaleSetting {
  pricePerLiter: number;
}

export function useMilkSales() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { transactions, addTransaction } = useTransactions();

  // Get milk price from localStorage (simple approach)
  const getMilkPrice = (): number => {
    const stored = localStorage.getItem(`milk_price_${user?.id}`);
    return stored ? parseFloat(stored) : 30; // Default 30 TL per liter
  };

  const setMilkPrice = (price: number) => {
    if (user) {
      localStorage.setItem(`milk_price_${user.id}`, price.toString());
    }
  };

  // Get milk sales (transactions with category 'sut')
  const milkSales = transactions.filter(t => t.type === 'gelir' && t.category === 'sut');

  // Calculate monthly milk income
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const monthlyMilkIncome = milkSales
    .filter(t => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Create milk sale transaction
  const createMilkSale = async (data: {
    liters: number;
    pricePerLiter: number;
    date: string;
    description?: string;
  }) => {
    const amount = data.liters * data.pricePerLiter;
    await addTransaction.mutateAsync({
      type: 'gelir',
      category: 'sut',
      amount,
      date: data.date,
      description: data.description || `Süt satışı - ${data.liters} litre x ₺${data.pricePerLiter}`,
      animal_id: null,
    });
  };

  return {
    milkSales,
    monthlyMilkIncome,
    getMilkPrice,
    setMilkPrice,
    createMilkSale,
    isLoading: false,
  };
}
