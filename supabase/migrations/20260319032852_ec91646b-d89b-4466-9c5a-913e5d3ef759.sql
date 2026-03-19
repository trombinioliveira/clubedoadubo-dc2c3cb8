
-- Table for auto-generation configuration and logs
CREATE TABLE public.pro_generation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_type text NOT NULL DEFAULT 'manual', -- 'manual' or 'automatic'
  quantity_generated integer NOT NULL DEFAULT 0,
  quantity_requested integer NOT NULL DEFAULT 0,
  first_position integer,
  last_position integer,
  config_quantity_per_cycle integer,
  config_interval_minutes integer,
  executed_by uuid,
  status text NOT NULL DEFAULT 'success', -- 'success', 'error', 'skipped'
  error_message text,
  cumulative_total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pro_generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage generation logs"
  ON public.pro_generation_logs
  FOR ALL
  TO public
  USING (is_admin(auth.uid()));

CREATE POLICY "Staff can view generation logs"
  ON public.pro_generation_logs
  FOR SELECT
  TO public
  USING (is_staff(auth.uid()));
