
CREATE TABLE public.terms_acceptance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  accepted_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text
);

ALTER TABLE public.terms_acceptance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own acceptance"
ON public.terms_acceptance FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own acceptance"
ON public.terms_acceptance FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all acceptances"
ON public.terms_acceptance FOR ALL
USING (is_admin(auth.uid()));
