-- Create health_records table for vet visits and treatments
CREATE TABLE public.health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL, -- 'vet_visit', 'treatment', 'illness', 'injury'
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  vet_name TEXT,
  cost DECIMAL(10,2),
  medications TEXT[],
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health records"
ON public.health_records
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health records"
ON public.health_records
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health records"
ON public.health_records
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health records"
ON public.health_records
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_health_records_user_id ON public.health_records(user_id);
CREATE INDEX idx_health_records_animal_id ON public.health_records(animal_id);
CREATE INDEX idx_health_records_date ON public.health_records(date);

-- Create milk_productions table for daily milk tracking
CREATE TABLE public.milk_productions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  morning_amount DECIMAL(6,2) DEFAULT 0,
  evening_amount DECIMAL(6,2) DEFAULT 0,
  total_amount DECIMAL(6,2) GENERATED ALWAYS AS (morning_amount + evening_amount) STORED,
  quality TEXT, -- 'iyi', 'orta', 'zayıf'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(animal_id, date)
);

ALTER TABLE public.milk_productions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own milk productions"
ON public.milk_productions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milk productions"
ON public.milk_productions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milk productions"
ON public.milk_productions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milk productions"
ON public.milk_productions
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_milk_productions_user_id ON public.milk_productions(user_id);
CREATE INDEX idx_milk_productions_animal_id ON public.milk_productions(animal_id);
CREATE INDEX idx_milk_productions_date ON public.milk_productions(date);