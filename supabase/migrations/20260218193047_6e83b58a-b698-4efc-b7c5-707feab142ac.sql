
-- Fix 1: OTP expiration enforcement at database level
-- Function to clean up expired OTP codes on insert
CREATE OR REPLACE FUNCTION public.enforce_otp_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Automatically mark expired codes as used when a new code is inserted for the same user
  UPDATE public.otp_codes
  SET used_at = now()
  WHERE expires_at < now()
    AND used_at IS NULL
    AND user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Trigger: on OTP insert, clean up expired codes for that user
DROP TRIGGER IF EXISTS enforce_otp_expiration_trigger ON public.otp_codes;
CREATE TRIGGER enforce_otp_expiration_trigger
AFTER INSERT ON public.otp_codes
FOR EACH ROW
EXECUTE FUNCTION public.enforce_otp_expiration();

-- Fix 2: Set security_invoker on the public_profiles view so it respects
-- the RLS of the underlying profiles table (callers must be authenticated).
-- This prevents unauthenticated bulk enumeration of all referral codes.
ALTER VIEW public.public_profiles SET (security_invoker = on);
