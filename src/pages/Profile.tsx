import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Bell, MessageSquare, Loader2, Save, Mail } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  farm_name: string | null;
  phone: string | null;
  notification_email: string | null;
  whatsapp_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  notification_preferences: {
    vaccination_reminders: boolean;
    birth_reminders: boolean;
    overdue_alerts: boolean;
    daily_summary: boolean;
  };
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      const notificationPrefs = typeof data.notification_preferences === 'object' && data.notification_preferences !== null
        ? data.notification_preferences as { vaccination_reminders: boolean; birth_reminders: boolean; overdue_alerts: boolean; daily_summary: boolean }
        : { vaccination_reminders: true, birth_reminders: true, overdue_alerts: true, daily_summary: true };
      
      setProfile({
        ...data,
        notification_email: data.notification_email || user?.email || null,
        whatsapp_notifications_enabled: data.whatsapp_notifications_enabled ?? false,
        email_notifications_enabled: data.email_notifications_enabled ?? false,
        notification_preferences: notificationPrefs,
      } as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          farm_name: profile.farm_name,
          phone: profile.phone,
          notification_email: profile.notification_email,
          whatsapp_notifications_enabled: profile.whatsapp_notifications_enabled,
          email_notifications_enabled: profile.email_notifications_enabled,
          notification_preferences: profile.notification_preferences,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profil güncellendi! ✅',
        description: 'Bilgileriniz başarıyla kaydedildi.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Hata',
        description: 'Profil kaydedilirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Profile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const updateNotificationPref = (key: string, value: boolean) => {
    if (!profile) return;
    setProfile({
      ...profile,
      notification_preferences: {
        ...profile.notification_preferences,
        [key]: value,
      },
    });
  };

  const testWhatsAppNotification = async () => {
    if (!profile?.phone || !user) {
      toast({
        title: 'Telefon numarası gerekli',
        description: 'Lütfen önce telefon numaranızı kaydedin.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          user_id: user.id,
          notification_type: 'vaccination_reminder',
          message: '🐄 Çiftlik Yönetim Sistemi\n\nTest bildirimi başarıyla gönderildi! WhatsApp entegrasyonunuz çalışıyor.',
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
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Gönderim hatası',
        description: error.message || 'WhatsApp mesajı gönderilemedi.',
        variant: 'destructive',
      });
    }
  };

  const testEmailNotification = async () => {
    if (!profile?.notification_email || !user) {
      toast({
        title: 'E-posta adresi gerekli',
        description: 'Lütfen önce bildirim e-posta adresinizi kaydedin.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          user_id: user.id,
          notification_type: 'test',
          message: '🐄 Merhaba!\n\nBu bir test bildirimidir. E-posta entegrasyonunuz başarıyla çalışıyor.\n\nÇiftlikTakip ekibi olarak size daha iyi hizmet verebilmek için çalışıyoruz.',
          email: profile.notification_email,
          subject: '✅ Test Bildirimi - ÇiftlikTakip',
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Test e-postası gönderildi! 📧',
          description: 'E-posta kutunuzu kontrol edin.',
        });
      } else {
        throw new Error(data.message || data.error || 'Bilinmeyen hata');
      }
    } catch (error: any) {
      console.error('Error sending test email:', error);
      const errorMsg = error.message || 'E-posta gönderilemedi.';
      const isResendError = errorMsg.includes('Resend') || errorMsg.includes('domain');
      toast({
        title: 'Gönderim hatası',
        description: isResendError 
          ? 'Resend ücretsiz planında sadece kendi e-postanıza gönderim yapabilirsiniz. Domain doğrulaması için resend.com/domains adresini ziyaret edin.'
          : errorMsg,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
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
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profil Ayarları</h1>
          <p className="text-muted-foreground mt-1">
            Hesap bilgilerinizi ve bildirim tercihlerinizi yönetin
          </p>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Kişisel Bilgiler
            </CardTitle>
            <CardDescription>
              Temel hesap bilgileriniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input
                  id="fullName"
                  value={profile?.full_name || ''}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farmName">Çiftlik Adı</Label>
                <Input
                  id="farmName"
                  value={profile?.farm_name || ''}
                  onChange={(e) => updateField('farm_name', e.target.value)}
                  placeholder="Çiftliğinizin adı"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Phone & WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Telefon & WhatsApp
            </CardTitle>
            <CardDescription>
              WhatsApp bildirimleri için telefon numaranızı ekleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon Numarası</Label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  +90
                </span>
                <Input
                  id="phone"
                  value={profile?.phone?.replace(/^\+90/, '') || ''}
                  onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                  placeholder="5XX XXX XX XX"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                WhatsApp bildirimleri bu numaraya gönderilecek
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Bildirim Ayarları
            </CardTitle>
            <CardDescription>
              Hangi bildirimleri almak istediğinizi seçin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  E-posta Bildirimleri
                </Label>
                <p className="text-sm text-muted-foreground">
                  Günlük özet ve hatırlatmaları e-posta ile al
                </p>
              </div>
              <Switch
                checked={profile?.email_notifications_enabled || false}
                onCheckedChange={(checked) => updateField('email_notifications_enabled', checked)}
              />
            </div>

            {profile?.email_notifications_enabled && (
              <div className="pl-6 space-y-4 border-l-2 border-blue-200">
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Bildirim E-postası</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={profile?.notification_email || ''}
                    onChange={(e) => updateField('notification_email', e.target.value)}
                    placeholder="ornek@email.com"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Günlük Özet</Label>
                    <p className="text-sm text-muted-foreground">
                      Her sabah aşı ve doğum hatırlatmaları
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences.daily_summary}
                    onCheckedChange={(checked) => updateNotificationPref('daily_summary', checked)}
                  />
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={testEmailNotification}
                  disabled={!profile.notification_email}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Test E-postası Gönder
                </Button>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    WhatsApp Bildirimleri
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Anlık bildirimleri WhatsApp üzerinden al
                  </p>
                </div>
                <Switch
                  checked={profile?.whatsapp_notifications_enabled || false}
                  onCheckedChange={(checked) => updateField('whatsapp_notifications_enabled', checked)}
                />
              </div>
            </div>

            {profile?.whatsapp_notifications_enabled && (
              <div className="pl-6 space-y-4 border-l-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aşı Hatırlatmaları</Label>
                    <p className="text-sm text-muted-foreground">
                      Yaklaşan ve geciken aşılar için bildirim
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences.vaccination_reminders}
                    onCheckedChange={(checked) => updateNotificationPref('vaccination_reminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Doğum Hatırlatmaları</Label>
                    <p className="text-sm text-muted-foreground">
                      Yaklaşan doğumlar için bildirim
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences.birth_reminders}
                    onCheckedChange={(checked) => updateNotificationPref('birth_reminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Gecikme Uyarıları</Label>
                    <p className="text-sm text-muted-foreground">
                      Gecikmiş işlemler için acil bildirim
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences.overdue_alerts}
                    onCheckedChange={(checked) => updateNotificationPref('overdue_alerts', checked)}
                  />
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={testWhatsAppNotification}
                  disabled={!profile.phone}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Test Mesajı Gönder
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Kaydet
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
