import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  user_id: string;
  notification_type: 'vaccination_reminder' | 'birth_reminder' | 'overdue_alert';
  message: string;
  phone_number?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppFrom = Deno.env.get('TWILIO_WHATSAPP_FROM');

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppFrom) {
      throw new Error('Twilio credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, notification_type, message, phone_number } = await req.json() as NotificationRequest;

    // Get user profile if phone not provided
    let targetPhone = phone_number;
    if (!targetPhone) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('phone, whatsapp_notifications_enabled, notification_preferences')
        .eq('user_id', user_id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found');
      }

      if (!profile.whatsapp_notifications_enabled) {
        return new Response(
          JSON.stringify({ success: false, message: 'WhatsApp notifications disabled for this user' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check notification preferences
      const prefs = profile.notification_preferences as Record<string, boolean>;
      const prefKey = notification_type === 'vaccination_reminder' ? 'vaccination_reminders' 
        : notification_type === 'birth_reminder' ? 'birth_reminders' 
        : 'overdue_alerts';
      
      if (prefs && !prefs[prefKey]) {
        return new Response(
          JSON.stringify({ success: false, message: `${notification_type} notifications disabled` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      targetPhone = profile.phone;
    }

    if (!targetPhone) {
      throw new Error('No phone number available');
    }

    // Format phone number for WhatsApp (ensure it starts with country code)
    const formattedPhone = targetPhone.startsWith('+') ? targetPhone : `+90${targetPhone.replace(/^0/, '')}`;

    // Send WhatsApp message via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', `whatsapp:${formattedPhone}`);
    formData.append('From', `whatsapp:${twilioWhatsAppFrom}`);
    formData.append('Body', message);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const twilioResult = await twilioResponse.json();

    // Log the notification
    const { error: logError } = await supabase
      .from('notification_logs')
      .insert({
        user_id,
        notification_type,
        message,
        phone_number: formattedPhone,
        status: twilioResponse.ok ? 'sent' : 'failed',
        sent_at: twilioResponse.ok ? new Date().toISOString() : null,
        error_message: !twilioResponse.ok ? JSON.stringify(twilioResult) : null,
      });

    if (logError) {
      console.error('Failed to log notification:', logError);
    }

    if (!twilioResponse.ok) {
      throw new Error(`Twilio error: ${JSON.stringify(twilioResult)}`);
    }

    return new Response(
      JSON.stringify({ success: true, message_sid: twilioResult.sid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error sending WhatsApp notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
