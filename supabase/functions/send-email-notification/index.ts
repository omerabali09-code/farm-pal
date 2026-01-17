import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// @ts-ignore
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  user_id: string;
  notification_type: 'vaccination_reminder' | 'birth_reminder' | 'overdue_alert' | 'daily_summary' | 'test';
  message: string;
  email?: string;
  subject?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resend = new Resend(resendApiKey);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, notification_type, message, email, subject } = await req.json() as NotificationRequest;

    // Get user profile if email not provided
    let targetEmail = email;
    if (!targetEmail) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('notification_email, email_notifications_enabled, notification_preferences')
        .eq('user_id', user_id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found');
      }

      if (!profile.email_notifications_enabled) {
        return new Response(
          JSON.stringify({ success: false, message: 'Email notifications disabled for this user' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check notification preferences
      const prefs = profile.notification_preferences as Record<string, boolean> | null;
      const prefKey = notification_type === 'vaccination_reminder' ? 'vaccination_reminders' 
        : notification_type === 'birth_reminder' ? 'birth_reminders' 
        : notification_type === 'daily_summary' ? 'daily_summary'
        : 'overdue_alerts';
      
      if (prefs && notification_type !== 'test' && !prefs[prefKey]) {
        return new Response(
          JSON.stringify({ success: false, message: `${notification_type} notifications disabled` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      targetEmail = profile.notification_email;
    }

    if (!targetEmail) {
      throw new Error('No email address available');
    }

    // Build email subject
    const emailSubject = subject || getDefaultSubject(notification_type);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "ÇiftlikTakip <onboarding@resend.dev>",
      to: [targetEmail],
      subject: emailSubject,
      html: buildEmailHtml(notification_type, message),
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the notification
    const { error: logError } = await supabase
      .from('notification_logs')
      .insert({
        user_id,
        notification_type,
        message,
        phone_number: targetEmail,
        channel: 'email',
        status: emailResponse.error ? 'failed' : 'sent',
        sent_at: !emailResponse.error ? new Date().toISOString() : null,
        error_message: emailResponse.error ? JSON.stringify(emailResponse.error) : null,
      });

    if (logError) {
      console.error('Failed to log notification:', logError);
    }

    if (emailResponse.error) {
      throw new Error(`Resend error: ${JSON.stringify(emailResponse.error)}`);
    }

    return new Response(
      JSON.stringify({ success: true, email_id: emailResponse.data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error sending email notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getDefaultSubject(type: string): string {
  switch (type) {
    case 'vaccination_reminder':
      return '🩺 Aşı Hatırlatması - ÇiftlikTakip';
    case 'birth_reminder':
      return '🐄 Doğum Hatırlatması - ÇiftlikTakip';
    case 'overdue_alert':
      return '⚠️ Gecikmiş İşlem Uyarısı - ÇiftlikTakip';
    case 'daily_summary':
      return '📊 Günlük Özet - ÇiftlikTakip';
    case 'test':
      return '✅ Test Bildirimi - ÇiftlikTakip';
    default:
      return '📬 Bildirim - ÇiftlikTakip';
  }
}

function buildEmailHtml(type: string, message: string): string {
  const iconMap: Record<string, string> = {
    vaccination_reminder: '💉',
    birth_reminder: '🐄',
    overdue_alert: '⚠️',
    daily_summary: '📊',
    test: '✅',
  };
  
  const icon = iconMap[type] || '📬';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
          <h1 style="color: white; margin: 0; font-size: 24px;">ÇiftlikTakip</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Akıllı Çiftlik Yönetim Sistemi</p>
        </div>
        
        <div style="background: white; border-radius: 0 0 16px 16px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="white-space: pre-line; line-height: 1.6; color: #374151; font-size: 16px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || '#'}" 
               style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Uygulamayı Aç
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">Bu e-posta ÇiftlikTakip uygulaması tarafından gönderilmiştir.</p>
          <p style="margin: 5px 0 0 0;">Bildirimleri kapatmak için uygulama ayarlarını ziyaret edin.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
