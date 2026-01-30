-- =============================================
-- ADD RLS TO VIEWS
-- =============================================

-- Enable RLS on the referral lookup view
ALTER VIEW public.profiles_referral_lookup SET (security_invoker = on);

-- Enable RLS on batches_public view  
ALTER VIEW public.batches_public SET (security_invoker = on);

-- Enable RLS on collection_points_public view
ALTER VIEW public.collection_points_public SET (security_invoker = on);

-- =============================================
-- CREATE A SAFE VIEW FOR FIFO QUEUE (hides user details for non-staff)
-- =============================================

-- Create a view that shows queue position and status without exposing user details
CREATE VIEW public.fifo_queue_public
WITH (security_invoker = on) AS
SELECT 
  fq.id,
  fq.position,
  fq.status,
  fq.created_at,
  fq.paid_at,
  fq.pro_id,
  p.code as pro_code,
  p.weight_grams,
  p.status as pro_status,
  p.created_at as pro_created_at,
  -- Only show user_id if it's the current user's PRO or user is staff/admin
  CASE 
    WHEN p.user_id = auth.uid() THEN p.user_id
    WHEN public.is_staff(auth.uid()) OR public.is_admin(auth.uid()) THEN p.user_id
    ELSE NULL
  END as pro_user_id,
  -- Only show names for staff/admin or own PROs
  CASE 
    WHEN p.user_id = auth.uid() THEN prof.full_name
    WHEN public.is_staff(auth.uid()) OR public.is_admin(auth.uid()) THEN prof.full_name
    ELSE 'Participante'
  END as user_name
FROM public.fifo_queue fq
JOIN public.pros p ON fq.pro_id = p.id
LEFT JOIN public.profiles prof ON p.user_id = prof.user_id;

-- Grant access to authenticated users to view the public queue
CREATE POLICY "Authenticated users can view public queue"
ON public.fifo_queue
FOR SELECT
USING (true);

-- But the fifo_queue_public view will hide sensitive data automatically