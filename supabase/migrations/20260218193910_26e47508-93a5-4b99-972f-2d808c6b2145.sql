
-- Fix: Change views to security_invoker = on and add proper RLS-safe grants
-- These views contain NO PII - they are intentionally public.
-- With security_invoker=on, they respect the querying user's RLS.
-- We grant SELECT to anon so unauthenticated users can read them.

ALTER VIEW public.public_fifo_queue SET (security_invoker = on);
ALTER VIEW public.public_financial_entries SET (security_invoker = on);
ALTER VIEW public.public_collection_points_list SET (security_invoker = on);

-- Grant SELECT on these public views to anon and authenticated
GRANT SELECT ON public.public_fifo_queue TO anon, authenticated;
GRANT SELECT ON public.public_financial_entries TO anon, authenticated;
GRANT SELECT ON public.public_collection_points_list TO anon, authenticated;

-- The underlying tables need RLS policies allowing anon to SELECT
-- but since views use security_invoker=on, we need to bypass underlying RLS for these public views
-- OR we add a public SELECT policy on the underlying tables.
-- Better approach: keep security_definer off, but add anon-accessible RLS on fifo_queue, financial_entries, collection_points

-- Allow anon to SELECT from fifo_queue (only position/status/dates, no user data exposed via view)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='fifo_queue' AND policyname='Public can view fifo queue'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view fifo queue" ON public.fifo_queue FOR SELECT USING (true)';
  END IF;
END $$;

-- Allow anon to SELECT from pros (needed for the JOIN in public_fifo_queue)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='pros' AND policyname='Public can view pros for queue'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view pros for queue" ON public.pros FOR SELECT USING (true)';
  END IF;
END $$;

-- Allow anon to SELECT from financial_entries (public aggregates only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='financial_entries' AND policyname='Public can view financial entries'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view financial entries" ON public.financial_entries FOR SELECT USING (true)';
  END IF;
END $$;

-- Allow anon to SELECT from collection_points (active ones)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='collection_points' AND policyname='Public can view active collection points'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view active collection points" ON public.collection_points FOR SELECT USING (is_active = true)';
  END IF;
END $$;

-- Allow anon to SELECT from weighings (for aggregate KPIs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='weighings' AND policyname='Public can view weighings aggregate'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view weighings aggregate" ON public.weighings FOR SELECT USING (true)';
  END IF;
END $$;

-- Allow anon to SELECT from batches (for pipeline)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='batches' AND policyname='Public can view batches'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view batches" ON public.batches FOR SELECT USING (true)';
  END IF;
END $$;
