-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'client');

-- Create enum for PRO status
CREATE TYPE public.pro_status AS ENUM ('processing', 'ready', 'sold', 'paid');

-- Create enum for batch status
CREATE TYPE public.batch_status AS ENUM ('processing', 'ready', 'partial_sold', 'sold');

-- Create enum for batch type
CREATE TYPE public.batch_type AS ENUM ('composting', 'vermicomposting');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collection_points table
CREATE TABLE public.collection_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'SP',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create batches table
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  batch_type batch_type NOT NULL DEFAULT 'composting',
  status batch_status NOT NULL DEFAULT 'processing',
  total_weight_grams INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ready_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pros table
CREATE TABLE public.pros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  batch_id UUID REFERENCES public.batches(id),
  collection_point_id UUID REFERENCES public.collection_points(id),
  status pro_status NOT NULL DEFAULT 'processing',
  weight_grams INTEGER NOT NULL DEFAULT 100,
  fifo_position INTEGER NOT NULL,
  dream_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  sold_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create dreams table
CREATE TABLE public.dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key for dream_id in pros after dreams table is created
ALTER TABLE public.pros ADD CONSTRAINT pros_dream_id_fkey FOREIGN KEY (dream_id) REFERENCES public.dreams(id) ON DELETE SET NULL;

-- Create weighings table (for collection point weighings)
CREATE TABLE public.weighings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_point_id UUID REFERENCES public.collection_points(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  weight_grams INTEGER NOT NULL,
  weighed_by UUID REFERENCES auth.users(id) NOT NULL,
  weighed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create global_fifo_queue view for public visibility
CREATE TABLE public.fifo_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID REFERENCES public.pros(id) ON DELETE CASCADE NOT NULL UNIQUE,
  position INTEGER NOT NULL UNIQUE,
  status pro_status NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weighings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fifo_queue ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Create function to check if user is staff
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'staff')
$$;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
BEGIN
  LOOP
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code);
  END LOOP;
  RETURN new_code;
END;
$$;

-- Function to generate PRO code
CREATE OR REPLACE FUNCTION public.generate_pro_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  year_str TEXT;
  seq_num INTEGER;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 10 FOR 4) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.pros
  WHERE code LIKE 'PRO-' || year_str || '-%';
  new_code := 'PRO-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_code;
END;
$$;

-- Function to get next FIFO position
CREATE OR REPLACE FUNCTION public.get_next_fifo_position()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_pos INTEGER;
BEGIN
  SELECT COALESCE(MAX(position), 0) + 1 INTO next_pos FROM public.fifo_queue;
  RETURN next_pos;
END;
$$;

-- Trigger to create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    public.generate_referral_code()
  );
  
  -- Assign default client role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collection_points_updated_at BEFORE UPDATE ON public.collection_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dreams_updated_at BEFORE UPDATE ON public.dreams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated users can view profiles for referrals" ON public.profiles FOR SELECT TO authenticated USING (true);

-- RLS Policies for collection_points
CREATE POLICY "Anyone authenticated can view collection points" ON public.collection_points FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage collection points" ON public.collection_points FOR ALL USING (public.is_staff(auth.uid()) OR public.is_admin(auth.uid()));

-- RLS Policies for batches
CREATE POLICY "Admins can manage batches" ON public.batches FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated users can view batches" ON public.batches FOR SELECT TO authenticated USING (true);

-- RLS Policies for pros
CREATE POLICY "Users can view their own PROs" ON public.pros FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own PROs" ON public.pros FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own PROs" ON public.pros FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all PROs" ON public.pros FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view all PROs" ON public.pros FOR SELECT USING (public.is_staff(auth.uid()));

-- RLS Policies for dreams
CREATE POLICY "Users can view their own dreams" ON public.dreams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own dreams" ON public.dreams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dreams" ON public.dreams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dreams" ON public.dreams FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all dreams" ON public.dreams FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for weighings
CREATE POLICY "Users can view their own weighings" ON public.weighings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can manage weighings" ON public.weighings FOR ALL USING (public.is_staff(auth.uid()) OR public.is_admin(auth.uid()));

-- RLS Policies for fifo_queue (globally visible)
CREATE POLICY "Anyone authenticated can view FIFO queue" ON public.fifo_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage FIFO queue" ON public.fifo_queue FOR ALL USING (public.is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_pros_user_id ON public.pros(user_id);
CREATE INDEX idx_pros_batch_id ON public.pros(batch_id);
CREATE INDEX idx_pros_status ON public.pros(status);
CREATE INDEX idx_pros_fifo_position ON public.pros(fifo_position);
CREATE INDEX idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX idx_weighings_collection_point ON public.weighings(collection_point_id);
CREATE INDEX idx_weighings_user ON public.weighings(user_id);
CREATE INDEX idx_fifo_queue_position ON public.fifo_queue(position);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);