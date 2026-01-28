-- Allow all authenticated users to view all PROs for FIFO queue transparency
CREATE POLICY "All authenticated users can view PROs in queue" 
ON public.pros 
FOR SELECT 
TO authenticated
USING (true);