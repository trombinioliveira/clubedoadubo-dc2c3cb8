import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_RETRIES = 3;
const BATCH_SIZE = 50;

// ── Template Renderer ────────────────────────────────────────────────────────
function renderTemplate(template: string, payload: Record<string, unknown>, baseUrl: string): { subject: string; html: string } {
  const wrap = (title: string, body: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
<div style="background:#2d6a4f;padding:20px 24px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:20px">🌱 Clube do Adubo</h1>
</div>
<div style="padding:24px">
<h2 style="color:#2d6a4f;margin:0 0 16px">${title}</h2>
${body}
</div>
<div style="padding:16px 24px;background:#f9fafb;text-align:center;font-size:12px;color:#888">
Clube do Adubo — Economia Circular • <a href="${baseUrl}" style="color:#2d6a4f">clubedoadubo.com.br</a>
</div>
</div>
</body>
</html>`;

  switch (template) {
    case "purchase_confirmed": {
      const amount = payload.amount ? `R$ ${Number(payload.amount).toFixed(2)}` : "";
      const product = (payload.product_name as string) || (payload.product_key as string) || "Produto";
      return {
        subject: "Compra aprovada — seu impacto foi registrado 🌱",
        html: wrap("Compra Aprovada!", `
          <p>Sua compra foi confirmada com sucesso!</p>
          ${amount ? `<p><strong>Valor:</strong> ${amount}</p>` : ""}
          <p><strong>Produto:</strong> ${product}</p>
          <p style="margin-top:20px">
            <a href="${baseUrl}/dashboard" style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Ver meu Dashboard</a>
          </p>
        `),
      };
    }
    case "pro_credited": {
      const qty = payload.quantity || payload.count || "seus";
      return {
        subject: "PROs creditados — seu ciclo começou ♻️",
        html: wrap("PROs Creditados!", `
          <p><strong>${qty}</strong> PRO(s) foram creditados na sua conta.</p>
          <p>Eles já entraram na fila FIFO e estão avançando rumo ao retorno.</p>
          <p style="margin-top:20px">
            <a href="${baseUrl}/dashboard" style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Acompanhar no Dashboard</a>
          </p>
        `),
      };
    }
    case "pro_paid": {
      const paidCount = payload.pros_paid || 1;
      const amount = payload.amount ? `R$ ${Number(payload.amount).toFixed(2)}` : "";
      return {
        subject: "PRO pago — o ciclo se fechou ✅",
        html: wrap("PRO Pago!", `
          <p><strong>${paidCount}</strong> PRO(s) foram pagos!</p>
          ${amount ? `<p><strong>Valor total:</strong> ${amount}</p>` : ""}
          <p>O ciclo da economia circular se completou.</p>
          <p style="margin-top:20px">
            <a href="${baseUrl}/fifo" style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Ver Fila FIFO</a>
          </p>
        `),
      };
    }
    case "fifo_moved": {
      return {
        subject: "Fila avançou — transparência em movimento 🔄",
        html: wrap("Fila FIFO Avançou!", `
          <p>A fila FIFO avançou! Seus PROs estão mais próximos do pagamento.</p>
          <p style="margin-top:20px">
            <a href="${baseUrl}/fifo" style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Ver minha posição</a>
          </p>
        `),
      };
    }
    case "dream_milestone": {
      const dreamTitle = (payload.dream_title as string) || "Seu sonho";
      const progress = payload.progress ? `${payload.progress}%` : "";
      return {
        subject: "Seu sonho avançou — um passo por vez 🌿",
        html: wrap("Sonho Avançou!", `
          <p><strong>${dreamTitle}</strong> ${progress ? `atingiu ${progress} do objetivo!` : "avançou!"}</p>
          <p style="margin-top:20px">
            <a href="${baseUrl}/sonhos" style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Ver Sonhos</a>
          </p>
        `),
      };
    }
    default:
      return {
        subject: "Notificação do Clube do Adubo",
        html: wrap("Notificação", `<p>${JSON.stringify(payload)}</p>`),
      };
  }
}

// ── Email Sender (Resend) ────────────────────────────────────────────────────
async function sendEmailResend(to: string, subject: string, html: string, apiKey: string, from: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Send failed" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check — only admin can trigger manually
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Allow both admin calls and internal service calls
    let isAuthorized = false;
    if (authHeader?.startsWith("Bearer ")) {
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: claims } = await anonClient.auth.getClaims(token);
      if (claims?.claims?.sub) {
        const { data: admin } = await supabase.rpc("is_admin", { _user_id: claims.claims.sub });
        isAuthorized = !!admin;
      }
    }
    // Also allow internal calls (no auth header — from other edge functions via service key)
    if (!authHeader) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendKey = Deno.env.get("RESEND_API_KEY") || "";
    const emailFrom = Deno.env.get("EMAIL_FROM") || "Clube do Adubo <onboarding@resend.dev>";
    const baseUrl = Deno.env.get("APP_BASE_URL") || "https://clubedoadubo.lovable.app";

    // Fetch queued notifications
    const { data: events, error: fetchErr } = await supabase
      .from("notification_events")
      .select("*")
      .eq("status", "queued")
      .lt("retry_count", MAX_RETRIES)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchErr) {
      console.error("[send-notifications] Fetch error:", fetchErr.message);
      return new Response(
        JSON.stringify({ error: fetchErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, message: "No queued notifications" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    let failed = 0;

    for (const event of events) {
      // Get user email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", event.user_id)
        .maybeSingle();

      if (!profile?.email) {
        await supabase
          .from("notification_events")
          .update({
            status: "failed",
            error_message: "User email not found",
            retry_count: event.retry_count + 1,
          })
          .eq("id", event.id);
        failed++;
        continue;
      }

      const { subject, html } = renderTemplate(event.template, event.payload || {}, baseUrl);

      if (!resendKey) {
        // No provider configured — mark as failed with instruction
        await supabase
          .from("notification_events")
          .update({
            status: "failed",
            error_message: "RESEND_API_KEY not configured. Configure in Supabase secrets.",
            retry_count: event.retry_count + 1,
          })
          .eq("id", event.id);
        failed++;
        continue;
      }

      const result = await sendEmailResend(profile.email, subject, html, resendKey, emailFrom);

      if (result.ok) {
        await supabase
          .from("notification_events")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", event.id);
        sent++;
      } else {
        const newRetry = event.retry_count + 1;
        await supabase
          .from("notification_events")
          .update({
            status: newRetry >= MAX_RETRIES ? "failed" : "queued",
            error_message: result.error || "Unknown send error",
            retry_count: newRetry,
          })
          .eq("id", event.id);
        failed++;
      }
    }

    console.log(`[send-notifications] Processed: ${events.length}, sent: ${sent}, failed: ${failed}`);

    return new Response(
      JSON.stringify({ ok: true, processed: events.length, sent, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[send-notifications] Error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
