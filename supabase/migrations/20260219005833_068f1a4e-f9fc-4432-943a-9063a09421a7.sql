
-- Fix security definer view — usar security_invoker para respeitar RLS do usuário
ALTER VIEW public.public_sale_distributions SET (security_invoker = true);
