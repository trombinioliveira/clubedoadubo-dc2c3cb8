ALTER TABLE public.pros DROP CONSTRAINT pros_pro_type_check;
ALTER TABLE public.pros ADD CONSTRAINT pros_pro_type_check
  CHECK (pro_type = ANY (ARRAY['standard','direct','recurring','global','courtesy']));