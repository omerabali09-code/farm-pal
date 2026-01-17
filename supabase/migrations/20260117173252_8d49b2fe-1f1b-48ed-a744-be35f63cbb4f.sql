-- Add email field to profiles for notifications
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_email text;

-- Update notification_logs to support email channel
ALTER TABLE public.notification_logs 
ADD COLUMN IF NOT EXISTS channel text DEFAULT 'whatsapp';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_notifications 
ON public.profiles(user_id) 
WHERE whatsapp_notifications_enabled = true OR email_notifications_enabled = true;