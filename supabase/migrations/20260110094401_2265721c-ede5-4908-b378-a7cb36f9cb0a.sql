-- Profiller tablosu
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  farm_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Hayvanlar tablosu
CREATE TABLE public.animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ear_tag TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inek', 'koyun', 'keçi', 'manda', 'at', 'diğer')),
  breed TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('dişi', 'erkek')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own animals"
ON public.animals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own animals"
ON public.animals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own animals"
ON public.animals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own animals"
ON public.animals FOR DELETE
USING (auth.uid() = user_id);

-- Aşılar tablosu
CREATE TABLE public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  next_date DATE,
  completed BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vaccinations"
ON public.vaccinations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vaccinations"
ON public.vaccinations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaccinations"
ON public.vaccinations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaccinations"
ON public.vaccinations FOR DELETE
USING (auth.uid() = user_id);

-- Tohumlama/Gebelik tablosu
CREATE TABLE public.inseminations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('doğal', 'suni')),
  expected_birth_date DATE NOT NULL,
  actual_birth_date DATE,
  is_pregnant BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inseminations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inseminations"
ON public.inseminations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inseminations"
ON public.inseminations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inseminations"
ON public.inseminations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inseminations"
ON public.inseminations FOR DELETE
USING (auth.uid() = user_id);

-- Profil otomatik oluşturma trigger'ı
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Updated_at trigger'ları
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();