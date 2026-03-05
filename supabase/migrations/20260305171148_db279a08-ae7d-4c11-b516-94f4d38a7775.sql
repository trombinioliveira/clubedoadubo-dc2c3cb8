
-- Re-attach triggers that were partially created (drop if exist first)
DROP TRIGGER IF EXISTS trg_set_sold_at ON public.pros;
DROP TRIGGER IF EXISTS trg_consume_pro_activation ON public.pro_activations;
DROP TRIGGER IF EXISTS trg_create_user_pros_from_confirmed_payment ON public.financial_entries;
DROP TRIGGER IF EXISTS trg_fill_confirmed_attribution ON public.financial_entries;

CREATE TRIGGER trg_set_sold_at
  BEFORE UPDATE ON public.pros
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sold_at_on_sold();

CREATE TRIGGER trg_consume_pro_activation
  AFTER INSERT ON public.pro_activations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_consume_pro_activation();

CREATE TRIGGER trg_create_user_pros_from_confirmed_payment
  AFTER INSERT OR UPDATE ON public.financial_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_pros_from_confirmed_payment();

CREATE TRIGGER trg_fill_confirmed_attribution
  BEFORE INSERT ON public.financial_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.fill_confirmed_attribution_from_pending();
