import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EnqueueRequest {
  user_id: string;
  template: string;
  payload: Record<string, unknown>;
  channel?: string;
  idempotency_key: string;
}

const TEMPLATE_PREF_MAP: Record<string, string> = {
  purchase_confirmed: "notify_purchase",
  pro_credited: "notify_pro_credited",
  pro_paid: "notify_pro_paid",
  fifo_moved: "notify_fifo_moved",
  dream_milestone: "notify_dream_milestones",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body: EnqueueRequest = await req.json();
    const { user_id, template, payload, channel = "email", idempotency_key } = body;

    if (!user_id || !template || !idempotency_key) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id, template, idempotency_key" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check idempotency
    const { data: existing } = await supabase
      .from("notification_events")
      .select("id")
      .eq("idempotency_key", idempotency_key)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: "duplicate" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user preferences
    let status = "queued";
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (prefs) {
      const channelEnabled = channel === "email" ? prefs.email_enabled : prefs.whatsapp_enabled;
      const prefKey = TEMPLATE_PREF_MAP[template];
      const templateEnabled = prefKey ? (prefs as Record<string, unknown>)[prefKey] !== false : true;

      if (!channelEnabled || !templateEnabled) {
        status = "skipped";
      }
    }

    // Anti-spam: fifo_moved max 1/day
    if (template === "fifo_moved" && status === "queued") {
      const today = new Date().toISOString().slice(0, 10);
      const { data: todayEvents } = await supabase
        .from("notification_events")
        .select("id")
        .eq("user_id", user_id)
        .eq("template", "fifo_moved")
        .gte("created_at", `${today}T00:00:00Z`)
        .neq("status", "skipped")
        .limit(1);

      if (todayEvents && todayEvents.length > 0) {
        status = "skipped";
      }
    }

    const { error: insertErr } = await supabase
      .from("notification_events")
      .insert({
        user_id,
        channel,
        template,
        status,
        payload: payload || {},
        idempotency_key,
      });

    if (insertErr) {
      console.error("[enqueue-notification] Insert error:", insertErr.message);
      return new Response(
        JSON.stringify({ error: insertErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[enqueue-notification] Error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
