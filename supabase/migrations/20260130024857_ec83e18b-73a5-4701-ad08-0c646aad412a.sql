-- =============================================
-- FIX 1: PROFILES - Create secure view for referral lookups
-- =============================================

-- Create a public view that ONLY exposes referral_code for lookups
CREATE VIEW public.profiles_referral_lookup
WITH (security_invoker = on) AS
SELECT 
  id,
  referral_code
FROM public.profiles
WHERE referral_code IS NOT NULL;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles for referrals" ON public.profiles;

-- =============================================
-- FIX 2: PROS - Restrict to own PROs only for clients
-- =============================================

-- Drop the overly permissive policy that exposes all PROs
DROP POLICY IF EXISTS "All authenticated users can view PROs in queue" ON public.pros;

-- =============================================
-- FIX 3: FIFO_QUEUE - Restrict to staff/admin only
-- =============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone authenticated can view FIFO queue" ON public.fifo_queue;

-- Create restricted policy - only staff and admin can view the full queue
CREATE POLICY "Staff and admins can view FIFO queue"
ON public.fifo_queue
FOR SELECT
USING (is_staff(auth.uid()) OR is_admin(auth.uid()));

-- =============================================
-- FIX 4: BATCHES - Hide created_by for non-staff
-- =============================================

-- Create a public view that hides created_by
CREATE VIEW public.batches_public
WITH (security_invoker = on) AS
SELECT 
  id,
  code,
  batch_type,
  status,
  total_weight_grams,
  start_date,
  ready_date,
  created_at,
  updated_at
FROM public.batches;

-- =============================================
-- FIX 5: COLLECTION_POINTS - Hide created_by for non-staff
-- =============================================

-- Create a public view that hides created_by
CREATE VIEW public.collection_points_public
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  address,
  city,
  state,
  is_active,
  created_at,
  updated_at
FROM public.collection_points;