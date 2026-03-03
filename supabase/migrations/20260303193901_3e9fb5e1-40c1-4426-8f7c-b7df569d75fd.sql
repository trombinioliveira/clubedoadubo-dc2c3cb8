INSERT INTO public.subscriptions (user_id, plan_key, status, started_at)
VALUES (
  'b22080a1-ca50-4770-974d-57c9d198a5dd',
  'plano_muda',
  'active',
  now()
)
ON CONFLICT (user_id) DO NOTHING;