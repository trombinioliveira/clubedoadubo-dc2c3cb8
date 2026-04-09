
-- 1. Enable RLS on system_ledger
ALTER TABLE public.system_ledger ENABLE ROW LEVEL SECURITY;

-- Admin full access to system_ledger
CREATE POLICY "Admins can manage system ledger"
  ON public.system_ledger FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Users can view only their own ledger entries
CREATE POLICY "Users can view their own ledger entries"
  ON public.system_ledger FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Fix pros table public exposure
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Public can view pros for queue" ON public.pros;

-- Recreate the public_fifo_queue view with security_invoker off (acts as definer)
CREATE OR REPLACE VIEW public.public_fifo_queue 
WITH (security_invoker = off) AS
SELECT
  fq.id AS queue_id,
  fq.position,
  fq.status,
  fq.created_at,
  fq.paid_at,
  p.code AS pro_code,
  p.weight_grams
FROM public.fifo_queue fq
JOIN public.pros p ON fq.pro_id = p.id;

GRANT SELECT ON public.public_fifo_queue TO anon, authenticated;
