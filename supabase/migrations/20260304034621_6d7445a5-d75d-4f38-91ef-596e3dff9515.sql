-- Add attribution JSONB column to financial_entries for tracking purchase origin (collection point, referral, etc.)
ALTER TABLE public.financial_entries 
ADD COLUMN IF NOT EXISTS attribution jsonb DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.financial_entries.attribution IS 'Tracks purchase origin: { source: "collection_point"|"referral"|"direct", slug: "...", name: "..." }';
