
-- Table for impact missions managed by admin
CREATE TABLE public.impact_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🌱',
  type TEXT NOT NULL CHECK (type IN ('habit', 'impact', 'expansion', 'special')),
  reward_pros INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.impact_missions ENABLE ROW LEVEL SECURITY;

-- Anyone can read active missions
CREATE POLICY "Anyone can view active missions"
  ON public.impact_missions FOR SELECT
  USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage missions"
  ON public.impact_missions FOR ALL
  USING (public.is_admin(auth.uid()));

-- Global settings table for site-wide toggles
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin(auth.uid()));

-- Insert default setting for missions module
INSERT INTO public.site_settings (key, value) VALUES
  ('missions_enabled', '{"enabled": true}'::jsonb);

-- Trigger for updated_at
CREATE TRIGGER update_impact_missions_updated_at
  BEFORE UPDATE ON public.impact_missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default missions
INSERT INTO public.impact_missions (title, description, emoji, type, reward_pros, sort_order) VALUES
  ('Café Consciente', 'Transforme o café do dia em impacto', '☕', 'habit', 1, 1),
  ('Refeição Urbana', 'Cada refeição pode mover o ciclo', '🍽', 'habit', 2, 2),
  ('Compra Local', 'Gaste local, impacte global', '🛒', 'habit', 2, 3),
  ('Mobilidade Sustentável', 'Cada passo fortalece o ciclo', '🚶', 'habit', 1, 4),
  ('Ativar um Resíduo', 'Coloque resíduo no ciclo agora', '🌱', 'impact', 3, 5),
  ('Dia sem Desperdício', 'Comprometa-se com um dia consciente', '♻️', 'impact', 5, 6),
  ('Compartilhar Link', 'Crie ondas de impacto', '🔗', 'expansion', 1, 7),
  ('Avançar no Sonho', 'Adicione PROs ao seu sonho atual', '🎁', 'expansion', 1, 8),
  ('Feche o Ciclo Hoje', 'Ative assinatura ou compre adubo', '♻️', 'special', 3, 9);
