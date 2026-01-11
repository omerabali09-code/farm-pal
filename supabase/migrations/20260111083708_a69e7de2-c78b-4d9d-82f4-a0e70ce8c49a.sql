-- Animals tablosuna yeni alanlar ekle
ALTER TABLE public.animals 
ADD COLUMN IF NOT EXISTS mother_ear_tag TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'aktif',
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS sold_to TEXT,
ADD COLUMN IF NOT EXISTS sold_date DATE,
ADD COLUMN IF NOT EXISTS sold_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS death_date DATE,
ADD COLUMN IF NOT EXISTS death_reason TEXT;

-- Animal photos/gallery table
CREATE TABLE IF NOT EXISTS public.animal_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for animal_photos
ALTER TABLE public.animal_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for animal_photos
CREATE POLICY "Users can view their own animal photos" 
ON public.animal_photos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own animal photos" 
ON public.animal_photos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own animal photos" 
ON public.animal_photos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Income/Expense tracking table (Gelir/Gider)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gelir', 'gider')),
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Pregnancy reminders table (Gebelik Hatırlatmaları)
CREATE TABLE IF NOT EXISTS public.pregnancy_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insemination_id UUID NOT NULL REFERENCES public.inseminations(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for pregnancy_reminders
ALTER TABLE public.pregnancy_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies for pregnancy_reminders
CREATE POLICY "Users can view their own reminders" 
ON public.pregnancy_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders" 
ON public.pregnancy_reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
ON public.pregnancy_reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
ON public.pregnancy_reminders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage bucket for animal photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('animal-photos', 'animal-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for animal photos
CREATE POLICY "Animal photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'animal-photos');

CREATE POLICY "Users can upload animal photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their animal photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their animal photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);