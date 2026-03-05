
-- Enable RLS on pro_activations and pro_credits
ALTER TABLE public.pro_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_credits ENABLE ROW LEVEL SECURITY;

-- Pro activations: service role inserts via triggers, users can view own
CREATE POLICY "Users can view own activations" ON public.pro_activations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service role full access activations" ON public.pro_activations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Pro credits: users can view own
CREATE POLICY "Users can view own credits" ON public.pro_credits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage credits" ON public.pro_credits
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Service role full access credits" ON public.pro_credits
  FOR ALL TO service_role USING (true) WITH CHECK (true);
