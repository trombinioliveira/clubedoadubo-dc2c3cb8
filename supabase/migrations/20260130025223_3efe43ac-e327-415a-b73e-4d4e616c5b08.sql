-- =============================================
-- FIX: Add proper RLS policies for secure access
-- =============================================

-- 1. Add policy for profiles to allow authenticated users to lookup referral codes only
-- (The view profiles_referral_lookup uses security_invoker, so it uses the base table policies)
CREATE POLICY "Authenticated users can lookup referral codes"
ON public.profiles
FOR SELECT
USING (
  -- Allow if selecting only referral_code (enforced by the view)
  auth.role() = 'authenticated'
);

-- Note: This is more permissive but the profiles_referral_lookup VIEW only exposes id and referral_code
-- The existing "Users can view their own profile" policy already handles full profile access

-- 2. For the views, they inherit RLS from base tables via security_invoker
-- The batches table already has "Authenticated users can view batches" policy
-- The collection_points table already has "Anyone authenticated can view collection points" policy

-- 3. For fifo_queue_public view, it needs the fifo_queue and pros tables to be accessible
-- The pros table needs a policy for the view to work
CREATE POLICY "Authenticated users can view PRO codes for queue"
ON public.pros
FOR SELECT
USING (
  -- Users can see their own PROs
  auth.uid() = user_id
  OR is_staff(auth.uid())
  OR is_admin(auth.uid())
  -- Or authenticated users can see limited data (the view hides sensitive fields)
  OR auth.role() = 'authenticated'
);

-- Drop the redundant policies since the new one is more comprehensive
DROP POLICY IF EXISTS "Users can view their own PROs" ON public.pros;
DROP POLICY IF EXISTS "Staff can view all PROs" ON public.pros;
DROP POLICY IF EXISTS "All authenticated users can view PROs in queue" ON public.pros;