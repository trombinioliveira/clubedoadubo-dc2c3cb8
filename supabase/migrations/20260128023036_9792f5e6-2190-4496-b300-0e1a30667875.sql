-- Insert existing PROs that are not in the fifo_queue
INSERT INTO public.fifo_queue (pro_id, position, status)
SELECT p.id, p.fifo_position, p.status
FROM public.pros p
LEFT JOIN public.fifo_queue fq ON fq.pro_id = p.id
WHERE fq.id IS NULL;