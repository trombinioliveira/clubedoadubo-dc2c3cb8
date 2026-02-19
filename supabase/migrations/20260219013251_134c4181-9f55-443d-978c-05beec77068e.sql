-- Migrate financial_entries to support Mercado Pago
-- Add new columns for MP integration
ALTER TABLE public.financial_entries
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'confirmed',
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'mercado_pago',
  ADD COLUMN IF NOT EXISTS provider_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS external_reference TEXT,
  ADD COLUMN IF NOT EXISTS product_key TEXT,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Unique constraint on provider_payment_id to ensure idempotency
CREATE UNIQUE INDEX IF NOT EXISTS financial_entries_provider_payment_id_idx
  ON public.financial_entries (provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

-- Index for user lookups
CREATE INDEX IF NOT EXISTS financial_entries_user_id_idx
  ON public.financial_entries (user_id)
  WHERE user_id IS NOT NULL;

-- Update existing entries to mark them as legacy Nexano data
UPDATE public.financial_entries
  SET provider = 'legacy'
  WHERE description ILIKE '%nexano%' OR description ILIKE '%TX:%';

-- Update the public_financial_entries view to include new fields
DROP VIEW IF EXISTS public.public_financial_entries;
CREATE OR REPLACE VIEW public.public_financial_entries AS
SELECT
  id,
  received_at,
  amount,
  currency,
  status,
  provider,
  product_key,
  description,
  is_distributed,
  pros_paid,
  distributed_at
FROM public.financial_entries;

-- Grant access to anon and authenticated roles
GRANT SELECT ON public.public_financial_entries TO anon, authenticated;
