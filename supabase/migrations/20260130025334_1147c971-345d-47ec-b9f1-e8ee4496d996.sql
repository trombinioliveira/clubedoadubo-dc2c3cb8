-- =============================================
-- SECURITY FIX: Restrict policies and use SECURITY DEFINER for controlled access
-- =============================================

-- 1. Remove the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can lookup referral codes" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view PRO codes for queue" ON public.pros;

-- 2. Restore proper restrictive policies for pros table
CREATE POLICY "Users can view their own PROs"
ON public.pros
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all PROs"
ON public.pros
FOR SELECT
USING (is_staff(auth.uid()) OR is_admin(auth.uid()));

-- 3. Add policy for fifo_queue to allow authenticated users to see queue
CREATE POLICY "Authenticated users can view queue positions"
ON public.fifo_queue
FOR SELECT
USING (auth.role() = 'authenticated');

-- 4. Create a SECURITY DEFINER function to get queue data safely
CREATE OR REPLACE FUNCTION public.get_fifo_queue_public()
RETURNS TABLE (
  queue_id uuid,
  queue_position integer,
  queue_status public.pro_status,
  queue_created_at timestamptz,
  queue_paid_at timestamptz,
  pro_id uuid,
  pro_code text,
  pro_weight_grams integer,
  pro_status public.pro_status,
  pro_created_at timestamptz,
  pro_user_id uuid,
  user_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  is_staff_or_admin boolean;
BEGIN
  -- Check if current user is staff or admin
  SELECT (public.is_staff(current_user_id) OR public.is_admin(current_user_id)) INTO is_staff_or_admin;
  
  RETURN QUERY
  SELECT 
    fq.id as queue_id,
    fq.position as queue_position,
    fq.status as queue_status,
    fq.created_at as queue_created_at,
    fq.paid_at as queue_paid_at,
    fq.pro_id,
    p.code as pro_code,
    p.weight_grams as pro_weight_grams,
    p.status as pro_status,
    p.created_at as pro_created_at,
    -- Only expose user_id if it's the current user's PRO or user is staff/admin
    CASE 
      WHEN p.user_id = current_user_id THEN p.user_id
      WHEN is_staff_or_admin THEN p.user_id
      ELSE NULL
    END as pro_user_id,
    -- Only expose names for staff/admin or own PROs
    CASE 
      WHEN p.user_id = current_user_id THEN prof.full_name
      WHEN is_staff_or_admin THEN prof.full_name
      ELSE 'Participante'::text
    END as user_name
  FROM public.fifo_queue fq
  JOIN public.pros p ON fq.pro_id = p.id
  LEFT JOIN public.profiles prof ON p.user_id = prof.user_id
  ORDER BY fq.position ASC;
END;
$$;

-- 5. Create a function to lookup referral code only (not full profile)
CREATE OR REPLACE FUNCTION public.lookup_referral_code(code text)
RETURNS TABLE (
  profile_id uuid,
  referral_code text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id as profile_id, referral_code
  FROM public.profiles
  WHERE referral_code = code
  LIMIT 1;
$$;

-- 6. Drop the problematic views that don't have proper RLS
DROP VIEW IF EXISTS public.fifo_queue_public;
DROP VIEW IF EXISTS public.profiles_referral_lookup;
DROP VIEW IF EXISTS public.batches_public;
DROP VIEW IF EXISTS public.collection_points_public;