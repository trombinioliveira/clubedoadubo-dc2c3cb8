-- Add new columns to profiles table for auth tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS whatsapp_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.auth_provider IS 'Authentication provider: email, google, or apple';
COMMENT ON COLUMN public.profiles.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN public.profiles.whatsapp_connected IS 'Whether user has connected WhatsApp for notifications';
COMMENT ON COLUMN public.profiles.account_status IS 'Account status: active, inactive, or blocked';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON public.profiles(auth_provider);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_connected ON public.profiles(whatsapp_connected);

-- Update handle_new_user function to capture auth provider
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, referral_code, auth_provider, last_login_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    public.generate_referral_code(),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    now()
  );
  
  -- Assign default client role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;