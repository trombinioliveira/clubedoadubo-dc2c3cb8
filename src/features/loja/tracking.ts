import { supabase } from "@/integrations/supabase/client";
import { getUtm } from "./utm";

/**
 * Helpers de captação de interesses (leads) e medição de cliques na loja.
 * Usa o Supabase client com a anon key + RLS que permite somente INSERT.
 * Nunca lê dados — apenas registra.
 */

type UtmFields = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
};

function buildUtmFields(): UtmFields {
  const utm = getUtm();
  return {
    utm_source: utm.utm_source ?? null,
    utm_medium: utm.utm_medium ?? null,
    utm_campaign: utm.utm_campaign ?? null,
    utm_content: utm.utm_content ?? null,
    utm_term: utm.utm_term ?? null,
    landing_page: typeof window !== "undefined" ? window.location.href : null,
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
  };
}

export type InterestLeadInput = {
  interest_type: string;
  source_page: string;
  first_name: string;
  whatsapp: string;
  email?: string | null;
  instagram?: string | null;
  place_type?: string | null;
  city_neighborhood?: string | null;
  region?: string | null;
  notes?: string | null;
  consent_contact?: boolean;
  consent_privacy?: boolean;
  status?: string;
};

/**
 * Salva um interesse/lead. Retorna o id quando possível, ou null em caso de erro.
 */
export async function saveInterestLead(
  input: InterestLeadInput
): Promise<{ ok: boolean; id: string | null }> {
  try {
    const { data, error } = await (supabase as any)
      .from("clube_interest_leads")
      .insert({
        ...input,
        status: input.status ?? "novo",
        ...buildUtmFields(),
      })
      .select("id")
      .single();

    if (error) return { ok: false, id: null };
    return { ok: true, id: (data as { id?: string } | null)?.id ?? null };
  } catch {
    return { ok: false, id: null };
  }
}

export type LinkClickInput = {
  link_key: string;
  source_page: string;
  target_url: string;
  interest_type?: string | null;
  lead_id?: string | null;
  metadata?: Record<string, unknown> | null;
};

/**
 * Registra um clique de link. Nunca lança erro — apenas retorna se deu certo.
 */
export async function recordLinkClick(
  input: LinkClickInput
): Promise<{ ok: boolean }> {
  try {
    const { error } = await supabase.from("clube_link_clicks").insert({
      ...input,
      ...buildUtmFields(),
    });
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}
