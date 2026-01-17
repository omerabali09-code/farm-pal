import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// @ts-ignore
import { Resend } from "https://esm.sh/resend@2.0.0";
// @ts-ignore
import { differenceInDays } from "https://esm.sh/date-fns@3.6.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with email notifications enabled
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, notification_email, notification_preferences')
      .eq('email_notifications_enabled', true)
      .not('notification_email', 'is', null);

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No users with email notifications enabled', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const today = new Date();
    let sentCount = 0;
    const results: { user_id: string; status: string; error?: string }[] = [];

    for (const profile of profiles) {
      try {
        // Check if daily_summary is enabled in preferences
        const prefs = profile.notification_preferences as Record<string, boolean> | null;
        if (prefs && prefs.daily_summary === false) {
          results.push({ user_id: profile.user_id, status: 'skipped', error: 'daily_summary disabled' });
          continue;
        }

        // Get user's animals
        const { data: animals, error: animalsError } = await supabase
          .from('animals')
          .select('id, ear_tag, type')
          .eq('user_id', profile.user_id)
          .eq('status', 'aktif');

        if (animalsError || !animals || animals.length === 0) {
          results.push({ user_id: profile.user_id, status: 'skipped', error: 'no animals' });
          continue;
        }

        const animalIds = animals.map(a => a.id);

        // Get upcoming vaccinations (next 7 days)
        const { data: vaccinations } = await supabase
          .from('vaccinations')
          .select('*, animal:animal_id(ear_tag)')
          .in('animal_id', animalIds)
          .not('next_date', 'is', null);

        const upcomingVaccinations = (vaccinations || []).filter(v => {
          const days = differenceInDays(new Date(v.next_date!), today);
          return days >= 0 && days <= 7;
        });

        const overdueVaccinations = (vaccinations || []).filter(v => {
          return differenceInDays(new Date(v.next_date!), today) < 0;
        });

        // Get upcoming births (next 14 days)
        const { data: inseminations } = await supabase
          .from('inseminations')
          .select('*, animal:animal_id(ear_tag)')
          .in('animal_id', animalIds)
          .eq('is_pregnant', true);

        const upcomingBirths = (inseminations || []).filter(i => {
          const days = differenceInDays(new Date(i.expected_birth_date), today);
          return days >= 0 && days <= 14;
        });

        // Skip if nothing to report
        if (upcomingVaccinations.length === 0 && overdueVaccinations.length === 0 && upcomingBirths.length === 0) {
          results.push({ user_id: profile.user_id, status: 'skipped', error: 'nothing to report' });
          continue;
        }

        // Build message
        let message = `🌅 Günaydın! İşte bugünkü çiftlik özeti:\n\n`;
        message += `📊 Aktif Hayvan Sayısı: ${animals.length}\n\n`;

        if (upcomingBirths.length > 0) {
          message += `🐄 YAKIN DOĞUMLAR (${upcomingBirths.length}):\n`;
          upcomingBirths.forEach(i => {
            const days = differenceInDays(new Date(i.expected_birth_date), today);
            const animal = i.animal as { ear_tag: string } | null;
            message += `  • ${animal?.ear_tag || 'Bilinmiyor'}: ${days} gün içinde doğum bekleniyor\n`;
          });
          message += '\n';
        }

        if (overdueVaccinations.length > 0) {
          message += `⚠️ GECİKMİŞ AŞILAR (${overdueVaccinations.length}):\n`;
          overdueVaccinations.slice(0, 5).forEach(v => {
            const days = Math.abs(differenceInDays(new Date(v.next_date!), today));
            const animal = v.animal as { ear_tag: string } | null;
            message += `  • ${animal?.ear_tag || 'Bilinmiyor'}: ${v.name} - ${days} gün gecikti!\n`;
          });
          if (overdueVaccinations.length > 5) {
            message += `  ... ve ${overdueVaccinations.length - 5} tane daha\n`;
          }
          message += '\n';
        }

        if (upcomingVaccinations.length > 0) {
          message += `💉 YAKIN AŞILAR (${upcomingVaccinations.length}):\n`;
          upcomingVaccinations.slice(0, 5).forEach(v => {
            const days = differenceInDays(new Date(v.next_date!), today);
            const animal = v.animal as { ear_tag: string } | null;
            message += `  • ${animal?.ear_tag || 'Bilinmiyor'}: ${v.name} - ${days} gün içinde\n`;
          });
          if (upcomingVaccinations.length > 5) {
            message += `  ... ve ${upcomingVaccinations.length - 5} tane daha\n`;
          }
        }

        message += `\nDetaylar için ÇiftlikTakip uygulamasını açın. 🚜`;

        // Send email if Resend is configured
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          
          const emailResponse = await resend.emails.send({
            from: "ÇiftlikTakip <onboarding@resend.dev>",
            to: [profile.notification_email],
            subject: "📊 Günlük Çiftlik Özeti - ÇiftlikTakip",
            html: buildEmailHtml(message),
          });

          if (emailResponse.error) {
            results.push({ user_id: profile.user_id, status: 'failed', error: JSON.stringify(emailResponse.error) });
            continue;
          }

          // Log notification
          await supabase.from('notification_logs').insert({
            user_id: profile.user_id,
            notification_type: 'daily_summary',
            message: message,
            phone_number: profile.notification_email,
            channel: 'email',
            status: 'sent',
            sent_at: new Date().toISOString(),
          });

          sentCount++;
          results.push({ user_id: profile.user_id, status: 'sent' });
        } else {
          results.push({ user_id: profile.user_id, status: 'skipped', error: 'RESEND_API_KEY not configured' });
        }

      } catch (userError) {
        const errorMsg = userError instanceof Error ? userError.message : 'Unknown error';
        results.push({ user_id: profile.user_id, status: 'failed', error: errorMsg });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        total_users: profiles.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in daily notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildEmailHtml(message: string): string {
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
          <div style="font-size: 48px; margin-bottom: 10px;">📊</div>
          <h1 style="color: white; margin: 0; font-size: 24px;">Günlük Çiftlik Özeti</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">ÇiftlikTakip - ${new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div style="background: white; border-radius: 0 0 16px 16px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="white-space: pre-line; line-height: 1.8; color: #374151; font-size: 15px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <a href="#" 
               style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Uygulamayı Aç
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">Bu e-posta ÇiftlikTakip tarafından her sabah otomatik gönderilir.</p>
          <p style="margin: 5px 0 0 0;">Bildirimleri kapatmak için uygulama ayarlarını ziyaret edin.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
