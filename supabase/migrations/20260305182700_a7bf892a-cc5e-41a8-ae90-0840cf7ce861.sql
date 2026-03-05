
-- Audit reviews: track audit status per route
CREATE TABLE public.audit_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL UNIQUE,
  route_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_reviewed',
  notes text DEFAULT '',
  checklist jsonb DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.audit_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage audit reviews"
  ON public.audit_reviews FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Staff can view audit reviews"
  ON public.audit_reviews FOR SELECT
  USING (public.is_staff(auth.uid()));

-- Audit issues: track specific issues per route
CREATE TABLE public.audit_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.audit_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage audit issues"
  ON public.audit_issues FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Staff can view audit issues"
  ON public.audit_issues FOR SELECT
  USING (public.is_staff(auth.uid()));
