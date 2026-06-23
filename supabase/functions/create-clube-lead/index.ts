import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendClubeLeadNotification } from "../_shared/clube-notify.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_LEAD_TYPES = [
  "customer",
  "community",
  "connector",
  "establishment",
  "reseller",
  "plant_parent",
  "general",
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));

    const first_name = String(body.first_name ?? "").trim();
    const whatsapp = String(body.whatsapp ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const instagramRaw = String(body.instagram ?? "").trim();
    const instagram = instagramRaw ? instagramRaw.replace(/^@+/, "") : null;
    const lead_type = VALID_LEAD_TYPES.includes(body.lead_type) ? body.lead_type : "general";
    const source_page = String(body.source_page ?? "").trim();
    const origin = body.origin ? String(body.origin).slice(0, 2000) : null;
    const region = body.region ? String(body.region).trim() : null;
    const consent_contact = body.consent_contact === true;
    const consent_privacy = body.consent_privacy === true;
    const privacy_policy_version = body.privacy_policy_version
      ? String(body.privacy_policy_version)
      : null;
    const notes = body.notes ? String(body.notes).slice(0, 2000) : null;

    // Server-side validation
    if (first_name.length < 2) return json({ error: "Nome inválido." }, 400);
    if (whatsapp.replace(/\D/g, "").length < 10) return json({ error: "WhatsApp inválido." }, 400);
    if (!isValidEmail(email)) return json({ error: "E-mail inválido." }, 400);
    if (!source_page) return json({ error: "Origem ausente." }, 400);
    if (!consent_contact) return json({ error: "Consentimento de contato obrigatório." }, 400);
    if (!consent_privacy) return json({ error: "Consentimento de privacidade obrigatório." }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const nowIso = new Date().toISOString();
    const { data: lead, error } = await supabase
      .from("clube_leads")
      .insert({
        first_name,
        whatsapp,
        email,
        instagram,
        lead_type,
        source_page,
        origin,
        region,
        status: "novo",
        consent_contact,
        consent_privacy,
        privacy_policy_version,
        notes,
        entry_status: "cadastro_salvo",
        entry_link_unlocked_at: nowIso,
      })
      .select("id, public_access_token, created_at, status, entry_status")
      .single();

    if (error || !lead) {
      console.error("[create-clube-lead] DB error:", error?.message);
      return json({ error: "Não foi possível salvar seu cadastro agora." }, 500);
    }

    // Send notification email — failure must NOT break the lead.
    let emailResult;
    try {
      emailResult = await sendClubeLeadNotification({
        first_name,
        whatsapp,
        email,
        instagram,
        lead_type,
        source_page,
        origin,
        region,
        status: lead.status,
        entry_status: lead.entry_status,
        consent_contact,
        consent_privacy,
        notes,
        created_at: lead.created_at,
      });
    } catch (e) {
      emailResult = { status: "failed", error: e instanceof Error ? e.message : "send failed" };
    }

    await supabase
      .from("clube_leads")
      .update({
        notification_email_status: emailResult.status,
        notification_email_sent_at:
          emailResult.status === "sent" ? (emailResult as { sentAt: string }).sentAt : null,
        notification_email_error:
          "error" in emailResult ? (emailResult as { error?: string }).error ?? null : null,
      })
      .eq("id", lead.id);

    return json({ success: true, lead_id: lead.id, public_access_token: lead.public_access_token });
  } catch (err) {
    console.error("[create-clube-lead] Unexpected:", err);
    return json({ error: "Erro inesperado." }, 500);
  }
});
