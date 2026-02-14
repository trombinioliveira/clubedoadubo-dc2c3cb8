INSERT INTO public.site_settings (key, value)
VALUES ('collective_impact_enabled', '{"enabled": true}')
ON CONFLICT (key) DO NOTHING;