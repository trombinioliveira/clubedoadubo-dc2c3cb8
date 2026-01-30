-- =============================================
-- FIX: Remove overly permissive policy from fifo_queue
-- Keep only the staff/admin policy for base table access
-- =============================================

-- Drop the permissive policy we added by mistake
DROP POLICY IF EXISTS "Authenticated users can view public queue" ON public.fifo_queue;

-- The "Staff and admins can view FIFO queue" policy remains for direct table access
-- The fifo_queue_public view handles safe access for all users