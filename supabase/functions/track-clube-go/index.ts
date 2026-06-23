import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WHATSAPP_NUMBER = "5512996682454";
const STORE_URL = "https://www.clubedoadubo.com.br/loja";

// Map of tracking targets -> final destination URLs.
const TARGETS: Record<string, string> = {
  "clube-adubo-digital": `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Olá! Quero entender como funciona o Adubo Digital para participar de qualquer lugar do Brasil.",
  )}`,
  "clube-whatsapp": `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Olá! Quero falar com o Clube do Adubo.",
  )}`,
  "clube-produtos": `${STORE_URL}`,
  "clube-comunidade": `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Olá! Quero fazer parte da comunidade do Clube do Adubo.",
  )}`,
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const url = new URL(req.url);
    const token = String(body.token ?? url.searchParams.get("t") ?? "").trim();
    const target = String(body.target ?? url.searchParams.get("target") ?? "clube-adubo-digital").trim();

    const finalUrl = TARGETS[target] || STORE_URL;

    // Token optional for resilience — never block the redirect.
    if (token && /^[0-9a-f-]{36}$/i.test(token)) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          { auth: { autoRefreshToken: false, persistSession: false } },
        );

        const { data: lead } = await supabase
          .from("clube_leads")
          .select("id, entry_link_click_count")
          .eq("public_access_token", token)
          .maybeSingle();

        if (lead) {
          await supabase
            .from("clube_leads")
            .update({
              entry_link_clicked_at: new Date().toISOString(),
              entry_link_click_count: (lead.entry_link_click_count ?? 0) + 1,
              entry_target: target,
              entry_status: "link_clicado",
            })
            .eq("id", lead.id);
        }
      } catch (e) {
        console.error("[track-clube-go] tracking error (ignored):", e);
      }
    }

    return json({ success: true, finalUrl });
  } catch (err) {
    console.error("[track-clube-go] Unexpected:", err);
    return json({ success: false, finalUrl: STORE_URL }, 200);
  }
});
