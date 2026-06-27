/**
 * Camada de rastreamento para Google Tag Manager.
 *
 * Nenhum dado é salvo no Supabase — apenas eventos são empurrados para o
 * dataLayer do GTM, que cuida do envio para Google Ads / Analytics / Meta.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type WhatsappOffer = "unidade" | "kit_3" | "assinatura" | "cta_final";

const PRODUCT = "adubo_liquido_500ml";
const SOURCE_PAGE = "/loja/produto/adubo-liquido";

/** Dispara o evento `whatsapp_click` no dataLayer do GTM. */
export function pushWhatsappClick(offer: WhatsappOffer): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "whatsapp_click",
    product: PRODUCT,
    offer,
    source_page: SOURCE_PAGE,
  });
}
