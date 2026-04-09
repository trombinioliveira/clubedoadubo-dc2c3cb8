
CREATE TABLE public.feedbacks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url text NOT NULL,
  rating text NOT NULL CHECK (rating IN ('claro', 'mais_ou_menos', 'confuso')),
  comment text,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback"
ON public.feedbacks FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can manage all feedback"
ON public.feedbacks FOR ALL
TO public
USING (is_admin(auth.uid()));

CREATE POLICY "Staff can view feedback"
ON public.feedbacks FOR SELECT
TO public
USING (is_staff(auth.uid()));
