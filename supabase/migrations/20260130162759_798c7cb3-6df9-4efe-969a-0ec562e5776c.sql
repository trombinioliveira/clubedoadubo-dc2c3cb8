-- Clean all operational data (keep users/profiles)
DELETE FROM public.financial_entries;
DELETE FROM public.distributions;
DELETE FROM public.fifo_queue;
DELETE FROM public.weighings;
DELETE FROM public.pros;
DELETE FROM public.batches;