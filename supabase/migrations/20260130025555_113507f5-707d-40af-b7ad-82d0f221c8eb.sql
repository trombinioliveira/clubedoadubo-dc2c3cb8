-- Remove the conflicting policy - the RPC function handles safe access
DROP POLICY IF EXISTS "Authenticated users can view queue positions" ON public.fifo_queue;

-- The "Staff and admins can view FIFO queue" policy remains for admin/staff direct access
-- Regular users access via the get_fifo_queue_public() SECURITY DEFINER function