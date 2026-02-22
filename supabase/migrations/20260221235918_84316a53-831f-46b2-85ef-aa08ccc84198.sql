
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_viewed_fifo boolean NOT NULL DEFAULT false;
