
CREATE TABLE public.export_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  dataset_type text NOT NULL,
  filters_applied jsonb NOT NULL DEFAULT '{}',
  rows_exported integer NOT NULL DEFAULT 0,
  exported_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage export logs"
  ON public.export_logs FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_export_logs_admin ON public.export_logs(admin_user_id);
