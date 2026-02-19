-- Fix: set security_invoker on public_financial_entries view
-- to enforce RLS of the querying user, not the view definer
ALTER VIEW public.public_financial_entries SET (security_invoker = on);
