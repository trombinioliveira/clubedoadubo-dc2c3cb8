-- Update existing PROs that have no batch_id to be 'pending' (not yet collected)
UPDATE public.pros 
SET status = 'pending' 
WHERE batch_id IS NULL AND status = 'processing';

-- Also update the fifo_queue status to match
UPDATE public.fifo_queue fq
SET status = 'pending'
FROM public.pros p
WHERE fq.pro_id = p.id AND p.status = 'pending';