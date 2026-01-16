import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { NotificationCard } from '@/components/dashboard/NotificationCard';
import { useAnimals } from '@/hooks/useAnimals';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useInseminations } from '@/hooks/useInseminations';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, MessageSquare, Send } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function Notifications() {
  const { animals, isLoading: animalsLoading } = useAnimals();
  const { vaccinations, isLoading: vaccinationsLoading } = useVaccinations();
  const { inseminations, isLoading: inseminationsLoading } = useInseminations();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sendingTest, setSendingTest] = useState(false);

  const isLoading = animalsLoading || vaccinationsLoading || inseminationsLoading;
  const today = new Date();

  // Generate notifications
  const notifications = [
    // Birth notifications
    ...inseminations
      .filter(i => {
        if (!i.is_pregnant) return false;
        const days = differenceInDays(new Date(i.expected_birth_date), today);
        return days >= -7 && days <= 30; // Include slightly overdue
      })
      .map(i => {
        const animal = animals.find(a => a.id === i.animal_id);
        const days = differenceInDays(new Date(i.expected_birth_date), today);
        return {
          id: `birth-${i.id}`,
          type: 'birth' as const,
          animalId: i.animal_id,
          message: days < 0 
            ? `${animal?.ear_tag || 'Hayvan'} - Doğum ${Math.abs(days)} gün gecikti!`
            : `${animal?.ear_tag || 'Hayvan'} - Doğum ${days} gün içinde bekleniyor`,
          date: i.expected_birth_date,
          isRead: days > 14,
          priority: days <= 0 ? 'high' as const : days <= 7 ? 'high' as const : 'medium' as const,
        };
      }),
    // Vaccination notifications
    ...vaccinations
      .filter(v => {
        if (!v.next_date) return false;
        const days = differenceInDays(new Date(v.next_date), today);
        return days >= -30 && days <= 14;
      })
      .map(v => {
        const animal = animals.find(a => a.id === v.animal_id);
        const days = differenceInDays(new Date(v.next_date!), today);
        return {
          id: `vac-${v.id}`,
          type: 'vaccination' as const,
          animalId: v.animal_id,
          message: days < 0 
            ? `${animal?.ear_tag || 'Hayvan'} - ${v.name} aşısı ${Math.abs(days)} gün gecikti`
            : `${animal?.ear_tag || 'Hayvan'} - ${v.name} aşısı ${days} gün içinde yapılmalı`,
          date: v.next_date!,
          isRead: days > 7,
          priority: days < 0 ? 'high' as const : days <= 3 ? 'high' as const : 'medium' as const,
        };
      }),
  ].sort((a, b) => {
    // Sort by priority first, then by date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const testWhatsAppNotification = async () => {
    if (!user) return;
    
    setSendingTest(true);
    try {
      // First get user's profile to check phone number
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, whatsapp_notifications_enabled')
        .eq('user_id', user.id)
        .single();

      if (!profile?.phone) {
        toast({
          title: 'Telefon numarası gerekli',
          description: 'Profil ayarlarından telefon numaranızı ekleyin.',
          variant: 'destructive',
        });
        return;
      }

      if (!profile.whatsapp_notifications_enabled) {
        toast({
          title: 'WhatsApp bildirimleri kapalı',
          description: 'Profil ayarlarından WhatsApp bildirimlerini açın.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          user_id: user.id,
          notification_type: 'test',
          message: '🐄 Çiftlik Yönetim Sistemi\n\n✅ Test bildirimi başarıyla gönderildi!\n\nWhatsApp entegrasyonunuz çalışıyor.',
          phone_number: profile.phone,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Test mesajı gönderildi! 📱',
          description: 'WhatsApp mesajınızı kontrol edin.',
        });
      } else {
        throw new Error(data.message || 'Bilinmeyen hata');
      }
    } catch (error: unknown) {
      console.error('Error sending test notification:', error);
      const errorMessage = error instanceof Error ? error.message : 'WhatsApp mesajı gönderilemedi.';
      toast({
        title: 'Gönderim hatası',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bildirimler</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 
                ? `${unreadCount} önemli bildirim` 
                : 'Tüm işler yolunda'}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={testWhatsAppNotification}
            disabled={sendingTest}
          >
            {sendingTest ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
            )}
            WhatsApp Test
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard 
              key={notification.id} 
              notification={notification}
            />
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12 bg-card rounded-2xl border-2 border-border">
            <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Bildirim yok 🎉
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Tüm hayvanlarınız için işler yolunda
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
