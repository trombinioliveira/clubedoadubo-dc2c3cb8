import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_RETRIES = 3;
const BATCH_SIZE = 50;

// ── Brand constants ──────────────────────────────────────────────────────────
const BRAND_COLOR = "#2d6a4f";
const BRAND_BG = "#f4f7f6";
const BRAND_NAME = "Clube do Adubo";
const BRAND_TAGLINE = "A cidade produz resíduo. A gente transforma em vida.";
const BRAND_URL = "https://www.clubedoadubo.com.br";

// ── HTML email wrapper ───────────────────────────────────────────────────────
function wrapEmail(title: string, body: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND_BG};font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden">${preheader}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG}">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">

<!-- Header -->
<tr><td style="background:${BRAND_COLOR};padding:24px;text-align:center">
<span style="font-size:28px">🌱</span>
<h1 style="color:#ffffff;margin:4px 0 0;font-size:20px;font-weight:700;letter-spacing:0.3px">${BRAND_NAME}</h1>
</td></tr>

<!-- Body -->
<tr><td style="padding:32px 28px">
<h2 style="color:${BRAND_COLOR};margin:0 0 20px;font-size:22px;font-weight:700;line-height:1.3">${title}</h2>
${body}
</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 28px;background:#f9fafb;text-align:center;border-top:1px solid #e5e7eb">
<p style="margin:0 0 4px;font-size:13px;color:#6b7280;font-weight:600">${BRAND_NAME}</p>
<p style="margin:0 0 8px;font-size:12px;color:#9ca3af;font-style:italic">${BRAND_TAGLINE}</p>
<a href="${BRAND_URL}" style="font-size:12px;color:${BRAND_COLOR};text-decoration:none">${BRAND_URL.replace("https://", "")}</a>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function btn(text: string, url: string): string {
  return `<p style="margin:24px 0 8px;text-align:center">
<a href="${url}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">${text}</a>
</p>`;
}

function auxText(text: string): string {
  return `<p style="margin:16px 0 0;font-size:13px;color:#9ca3af;line-height:1.5">${text}</p>`;
}

function bodyText(text: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6">${text}</p>`;
}

// ── Template Renderer ────────────────────────────────────────────────────────
function renderTemplate(
  template: string,
  payload: Record<string, unknown>,
  baseUrl: string
): { subject: string; html: string } {

  switch (template) {

    // ── EMAIL 1 — Confirmação de cadastro (disparado via Auth SMTP, mas backup aqui) ──
    case "signup_confirmation": {
      return {
        subject: "Confirme seu e-mail no Clube do Adubo",
        html: wrapEmail(
          "Confirme seu e-mail",
          bodyText("Sua conta foi criada com sucesso.") +
          bodyText("Falta só confirmar seu e-mail para continuar com segurança no Clube do Adubo.") +
          bodyText("Depois disso, você poderá conhecer os planos, entrar no ciclo e acompanhar sua jornada com transparência.") +
          btn("Confirmar e-mail", (payload.confirmation_url as string) || `${baseUrl}/auth`) +
          auxText("Se você não criou essa conta, pode ignorar este e-mail."),
          "Falta só um passo para ativar sua conta com segurança."
        ),
      };
    }

    // ── EMAIL 2 — Recuperação de senha ──
    case "password_recovery": {
      return {
        subject: "Recupere seu acesso ao Clube do Adubo",
        html: wrapEmail(
          "Redefina sua senha",
          bodyText("Recebemos um pedido para recuperar seu acesso ao Clube do Adubo.") +
          bodyText("Clique no botão abaixo para criar uma nova senha com segurança.") +
          btn("Redefinir senha", (payload.recovery_url as string) || `${baseUrl}/alterar-senha`) +
          auxText("Se você não fez esse pedido, pode ignorar este e-mail."),
          "Use este link para criar uma nova senha com segurança."
        ),
      };
    }

    // ── EMAIL 3 — Pagamento aprovado ──
    case "purchase_confirmed":
    case "payment_approved": {
      const amount = payload.amount ? `R$ ${Number(payload.amount).toFixed(2)}` : "";
      return {
        subject: "Seu pagamento foi confirmado",
        html: wrapEmail(
          "Seu passo no ciclo foi confirmado",
          bodyText("Recebemos seu pagamento com sucesso.") +
          (amount ? bodyText(`<strong>Valor:</strong> ${amount}`) : "") +
          bodyText("Seu registro será processado e, em instantes, você poderá acompanhar tudo com transparência no Clube do Adubo.") +
          btn("Ver próximos passos", `${BRAND_URL}/compra/sucesso`) +
          auxText("Se este foi seu primeiro passo no ciclo, bem-vindo.<br>Você poderá acompanhar sua jornada diretamente na plataforma."),
          "Seu passo no ciclo foi confirmado com sucesso."
        ),
      };
    }

    // ── EMAIL 4 — Pagamento pendente ──
    case "payment_pending": {
      return {
        subject: "Seu pagamento está em análise",
        html: wrapEmail(
          "Seu pagamento ainda está sendo processado",
          bodyText("Seu pagamento foi recebido e está em análise.") +
          bodyText("Assim que ele for confirmado, sua participação será registrada automaticamente.") +
          btn("Acompanhar status", `${BRAND_URL}/checkout/pendente`) +
          auxText("Você não precisa fazer nada agora.<br>Se houver atualização, ela aparecerá na plataforma."),
          "Seu pagamento foi recebido e ainda está sendo processado."
        ),
      };
    }

    // ── EMAIL 5 — Pagamento não concluído ──
    case "payment_failed": {
      return {
        subject: "Não foi possível concluir seu pagamento",
        html: wrapEmail(
          "Seu pagamento não foi confirmado",
          bodyText("Não foi possível concluir esse passo.") +
          bodyText("Nenhum valor foi cobrado. Você pode tentar novamente quando quiser.") +
          btn("Tentar novamente", `${BRAND_URL}/planos`) +
          auxText("Se precisar de ajuda, fale com a gente pelo contato do site."),
          "Nenhum valor foi cobrado e você pode tentar novamente."
        ),
      };
    }

    // ── EMAIL 6 — Assinatura confirmada ──
    case "subscription_confirmed": {
      const planKey = (payload.plan_key as string) || "";
      return {
        subject: "Sua assinatura do Clube do Adubo está ativa",
        html: wrapEmail(
          "Sua participação mensal começou",
          bodyText("Sua assinatura foi confirmada com sucesso.") +
          (planKey ? bodyText(`<strong>Plano:</strong> ${planKey.replace(/_/g, " ")}`) : "") +
          bodyText("Agora sua participação seguirá mês após mês, e você poderá acompanhar tudo com transparência no Clube do Adubo.") +
          btn("Ver minha jornada", `${BRAND_URL}/jornada`) +
          auxText("Sempre que houver etapas importantes no seu percurso, você poderá acompanhá-las pela plataforma."),
          "Sua participação mensal começou com sucesso."
        ),
      };
    }

    // ── EMAIL 7 — Contato recebido ──
    case "contact_received": {
      return {
        subject: "Recebemos sua mensagem",
        html: wrapEmail(
          "Sua mensagem chegou até nós",
          bodyText("Recebemos seu contato e vamos responder assim que possível.") +
          bodyText("Obrigado por falar com o Clube do Adubo.") +
          btn("Voltar ao site", `${BRAND_URL}/contato`) +
          auxText("Se sua dúvida for sobre pagamento ou acesso, acompanhe também sua área na plataforma."),
          "Sua mensagem chegou até nós."
        ),
      };
    }

    // ── EMAIL 8 — Boas-vindas ao cadastro ──
    case "welcome": {
      return {
        subject: "Bem-vindo ao Clube do Adubo",
        html: wrapEmail(
          "Que bom ter você por aqui",
          bodyText("Sua conta foi criada com sucesso.") +
          bodyText("Agora você pode conhecer os planos, entrar no ciclo e acompanhar sua jornada com transparência.") +
          btn("Conhecer os planos", `${BRAND_URL}/planos`) +
          auxText("Você não precisa entender tudo de uma vez.<br>Basta dar o primeiro passo."),
          "Sua conta foi criada com sucesso."
        ),
      };
    }

    // ── EMAIL 9 — Boas-vindas à primeira entrada no ciclo ──
    case "first_cycle_entry": {
      return {
        subject: "Você entrou no ciclo",
        html: wrapEmail(
          "Seu primeiro passo foi dado",
          bodyText("Seu ingresso no ciclo foi confirmado.") +
          bodyText("A partir de agora, você pode acompanhar sua jornada e ver esse impacto crescer com transparência.") +
          btn("Ver próximos passos", `${BRAND_URL}/checkout/sucesso`) +
          auxText("Se quiser continuar participando todo mês, você também pode conhecer os planos mensais."),
          "Seu primeiro passo foi dado com sucesso."
        ),
      };
    }

    // ── Existing templates (backward compat) ──
    case "pro_credited": {
      const qty = payload.quantity || payload.count || "suas";
      return {
        subject: "Participações creditadas na sua conta",
        html: wrapEmail(
          "Participações creditadas",
          bodyText(`<strong>${qty}</strong> participação(ões) foram creditadas na sua conta.`) +
          bodyText("Elas já entraram no ciclo e estão avançando.") +
          btn("Ver minha jornada", `${baseUrl}/jornada`),
          "Suas participações foram creditadas com sucesso."
        ),
      };
    }

    case "pro_paid": {
      const paidCount = payload.pros_paid || 1;
      const amount = payload.amount ? `R$ ${Number(payload.amount).toFixed(2)}` : "";
      return {
        subject: "O ciclo se completou — valor retornado",
        html: wrapEmail(
          "O ciclo se completou",
          bodyText(`<strong>${paidCount}</strong> participação(ões) completaram o ciclo!`) +
          (amount ? bodyText(`<strong>Valor retornado:</strong> ${amount}`) : "") +
          bodyText("O valor já foi registrado na sua conta. Você pode acompanhar tudo com transparência.") +
          btn("Ver minha participação", `${baseUrl}/fifo`),
          "O ciclo se completou."
        ),
      };
    }

    case "fifo_moved": {
      return {
        subject: "Suas participações avançaram no ciclo",
        html: wrapEmail(
          "O ciclo avançou",
          bodyText("O ciclo avançou! Suas participações estão mais próximas do retorno.") +
          btn("Ver minha participação", `${baseUrl}/fifo`),
          "Suas participações estão mais próximas."
        ),
      };
    }

    case "dream_milestone": {
      const dreamTitle = (payload.dream_title as string) || "Seu sonho";
      const progress = payload.progress ? `${payload.progress}%` : "";
      return {
        subject: `Seu sonho "${dreamTitle}" avançou`,
        html: wrapEmail(
          "Seu sonho avançou",
          bodyText(`<strong>${dreamTitle}</strong> ${progress ? `atingiu <strong>${progress}</strong> do caminho!` : "avançou!"}`)+
          bodyText("Continue acompanhando seus sonhos e veja como sua participação ganha direção.") +
          btn("Ver meus sonhos", `${baseUrl}/dreams`),
          "Seu sonho está avançando."
        ),
      };
    }

    default:
      return {
        subject: "Notificação do Clube do Adubo",
        html: wrapEmail("Notificação", bodyText(JSON.stringify(payload))),
      };
  }
}

// ── Email Sender (Resend) ────────────────────────────────────────────────────
// Audit BCC — every transactional email is copied here for operational oversight
const AUDIT_BCC = "clubedoadubo@gmail.com";

async function sendEmailResend(
  to: string,
  subject: string,
  html: string,
  apiKey: string,
  from: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], bcc: [AUDIT_BCC], subject, html }),
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const resendKey = Deno.env.get("RESEND_API_KEY") || "";
    const emailFrom = Deno.env.get("EMAIL_FROM") || "Clube do Adubo <contato@clubedoadubo.com.br>";
    const baseUrl = Deno.env.get("APP_BASE_URL") || "https://www.clubedoadubo.com.br";

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
        await supabase
          .from("notification_events")
          .update({
            status: "failed",
            error_message: "RESEND_API_KEY not configured",
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
