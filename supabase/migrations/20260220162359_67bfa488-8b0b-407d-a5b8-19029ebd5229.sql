
-- Create reset_logs table
CREATE TABLE public.reset_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  executed_at timestamptz NOT NULL DEFAULT now(),
  mode text NOT NULL DEFAULT 'soft_reset',
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.reset_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reset logs"
  ON public.reset_logs FOR ALL
  USING (is_admin(auth.uid()));

-- Ensure env_mode setting exists
INSERT INTO public.site_settings (key, value)
VALUES ('env_mode', '{"mode": "sandbox"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
