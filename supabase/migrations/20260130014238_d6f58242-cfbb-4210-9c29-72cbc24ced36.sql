-- Add column to track if user needs to change password on first login
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_change_required boolean NOT NULL DEFAULT false;

-- Add column to store the external transaction ID for idempotency
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS external_transaction_id text UNIQUE;

-- Add index for faster lookup by external transaction ID
CREATE INDEX IF NOT EXISTS idx_profiles_external_transaction_id ON public.profiles(external_transaction_id) WHERE external_transaction_id IS NOT NULL;