import { supabase } from "@/integrations/supabase/client";
import { getUtm } from "../utm";

const PRIVACY_POLICY_VERSION = "2026-02";

/** Build an origin string from preserved UTMs + landing/referrer context. */
export function buildOrigin(sourcePage: string): string {
  const utm = getUtm();
  const data: Record<string, string> = { ...utm };
  try {
    data.landing_page = window.location.pathname + window.location.search;
    if (document.referrer) data.referrer = document.referrer;
  } catch {
    // ignore
  }
  data.current_page = sourcePage;
  return JSON.stringify(data);
}

export interface CreateLeadInput {
  first_name: string;
  whatsapp: string;
  email: string;
  instagram?: string;
  lead_type: string;
  source_page: string;
  region?: string;
  consent_contact: boolean;
  consent_privacy: boolean;
  notes?: string;
}

export interface CreateLeadResult {
  success: true;
  lead_id: string;
  public_access_token: string;
}

export async function createClubeLead(input: CreateLeadInput): Promise<CreateLeadResult> {
  const { data, error } = await supabase.functions.invoke("create-clube-lead", {
    body: {
      ...input,
      origin: buildOrigin(input.source_page),
      privacy_policy_version: PRIVACY_POLICY_VERSION,
    },
  });
  if (error) throw new Error(error.message || "Falha ao salvar cadastro.");
  if (!data?.success) throw new Error(data?.error || "Falha ao salvar cadastro.");
  return data as CreateLeadResult;
}

export interface OrderItemInput {
  name: string;
  type?: string;
  quantity: number;
  price: number | null;
  label?: string;
}

export interface CreateOrderInput {
  customer_name: string;
  customer_whatsapp: string;
  customer_email: string;
  items: OrderItemInput[];
  quantity_total?: number | null;
  subtotal_amount?: number | null;
  delivery_amount?: number | null;
  discount_amount?: number | null;
  total_amount?: number | null;
  order_type: string;
  source_page: string;
  region?: string;
  payment_method?: string;
  delivery_method?: string;
  delivery_address?: string;
  notes?: string;
}

export interface CreateOrderResult {
  success: true;
  order_id: string;
  external_reference: string;
}

export async function createClubeOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { data, error } = await supabase.functions.invoke("create-clube-order", {
    body: { ...input, origin: buildOrigin(input.source_page) },
  });
  if (error) throw new Error(error.message || "Falha ao salvar pedido.");
  if (!data?.success) throw new Error(data?.error || "Falha ao salvar pedido.");
  return data as CreateOrderResult;
}

/** Calls the tracking edge function and returns the final destination URL. */
export async function trackClubeGo(target: string, token: string | null): Promise<string> {
  try {
    const { data } = await supabase.functions.invoke("track-clube-go", {
      body: { target, token },
    });
    if (data?.finalUrl) return data.finalUrl as string;
  } catch {
    // ignore — fall back below
  }
  return "https://www.clubedoadubo.com.br/loja";
}
