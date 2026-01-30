-- Add new profile fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS whatsapp text,
ADD COLUMN IF NOT EXISTS pix_key text,
ADD COLUMN IF NOT EXISTS email_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS whatsapp_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS profile_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS profile_deadline timestamp with time zone;

-- Add unique constraint on CPF
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_cpf_unique UNIQUE (cpf);

-- Create table for OTP codes
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email', 'whatsapp')),
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on otp_codes
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own OTP codes
CREATE POLICY "Users can view their own OTP codes"
ON public.otp_codes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own OTP codes
CREATE POLICY "Users can insert their own OTP codes"
ON public.otp_codes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own OTP codes
CREATE POLICY "Users can update their own OTP codes"
ON public.otp_codes
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to generate 6-digit OTP
CREATE OR REPLACE FUNCTION public.generate_otp_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN lpad(floor(random() * 1000000)::text, 6, '0');
END;
$$;

-- Update existing users to have a deadline (7 days from now)
UPDATE public.profiles
SET profile_deadline = now() + interval '7 days'
WHERE profile_completed_at IS NULL AND profile_deadline IS NULL;