import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useInseminations } from './useInseminations';
import { differenceInDays, differenceInMonths, addMonths } from 'date-fns';

export interface PregnancyReminder {
  id: string;
  user_id: string;
  insemination_id: string;
  reminder_type: '6_month' | '7_month';
  reminder_date: string;
  is_sent: boolean;
  created_at: string;
}

export function usePregnancyReminders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { inseminations, updateInsemination } = useInseminations();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['pregnancy_reminders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pregnancy_reminders')
        .select('*')
        .order('reminder_date', { ascending: true });
      
      if (error) throw error;
      return data as PregnancyReminder[];
    },
    enabled: !!user,
  });

  // Get active pregnancy reminders (due reminders)
  const getDueReminders = () => {
    const today = new Date();
    return reminders.filter(r => {
      const reminderDate = new Date(r.reminder_date);
      return !r.is_sent && differenceInDays(reminderDate, today) <= 0;
    });
  };

  // Get upcoming reminders (within next 7 days)
  const getUpcomingReminders = () => {
    const today = new Date();
    return reminders.filter(r => {
      const reminderDate = new Date(r.reminder_date);
      const daysUntil = differenceInDays(reminderDate, today);
      return !r.is_sent && daysUntil > 0 && daysUntil <= 7;
    });
  };

  // Calculate pregnancy month for each insemination
  const getPregnancyMonth = (inseminationDate: string): number => {
    const today = new Date();
    const insDate = new Date(inseminationDate);
    return differenceInMonths(today, insDate);
  };

  // Get 6th and 7th month warnings for active pregnancies
  const getMonthWarnings = () => {
    const warnings: Array<{
      insemination_id: string;
      month: number;
      type: '6_month' | '7_month';
      message: string;
    }> = [];

    inseminations
      .filter(i => i.is_pregnant)
      .forEach(insemination => {
        const month = getPregnancyMonth(insemination.date);
        
        if (month >= 6 && month < 7) {
          warnings.push({
            insemination_id: insemination.id,
            month: 6,
            type: '6_month',
            message: 'Süt alımını azaltın - 6. ay hatırlatıcısı',
          });
        } else if (month >= 7) {
          warnings.push({
            insemination_id: insemination.id,
            month: 7,
            type: '7_month',
            message: 'Süt alımını tamamen bırakın - 7. ay hatırlatıcısı',
          });
        }
      });

    return warnings;
  };

  const createReminder = useMutation({
    mutationFn: async (reminder: Omit<PregnancyReminder, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('pregnancy_reminders')
        .insert({
          ...reminder,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy_reminders'] });
    },
  });

  const markReminderSent = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('pregnancy_reminders')
        .update({ is_sent: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy_reminders'] });
    },
  });

  // Mark birth as completed
  const markBirthCompleted = useMutation({
    mutationFn: async ({ inseminationId, actualBirthDate }: { inseminationId: string; actualBirthDate: string }) => {
      return updateInsemination.mutateAsync({
        id: inseminationId,
        is_pregnant: false,
        actual_birth_date: actualBirthDate,
      });
    },
  });

  return {
    reminders,
    isLoading,
    getDueReminders,
    getUpcomingReminders,
    getMonthWarnings,
    getPregnancyMonth,
    createReminder,
    markReminderSent,
    markBirthCompleted,
  };
}
