
-- subscription_logs table
CREATE TABLE IF NOT EXISTS public.subscription_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  admin_user_id uuid NOT NULL,
  old_plan_key text,
  new_plan_key text,
  old_status text,
  new_status text,
  reason text,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_logs_subscription_id
  ON public.subscription_logs(subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscription_logs_changed_at
  ON public.subscription_logs(changed_at DESC);

-- Enable RLS
ALTER TABLE public.subscription_logs ENABLE ROW LEVEL SECURITY;

-- Admin: SELECT + INSERT
CREATE POLICY "Admins can manage subscription logs"
  ON public.subscription_logs
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Staff: SELECT only
CREATE POLICY "Staff can view subscription logs"
  ON public.subscription_logs
  FOR SELECT
  USING (public.is_staff(auth.uid()));
