// Shared notification helper for Clube do Adubo store flows.
// Reuses the SAME Resend sending pattern already used by the
// `send-notifications` edge function (single Resend client, no new architecture).
//
// Env vars (same pattern as send-notifications):
//   RESEND_API_KEY   - required to actually send (sanitized like send-notifications)
//   CLUBE_NOTIFY_FROM - optional override; falls back to EMAIL_FROM (already validated)
//   CLUBE_NOTIFY_TO   - optional override; falls back to the official internal address

const DEFAULT_NOTIFY_TO = "adubodigitalsp@gmail.com";

// Robust sanitization identical to send-notifications (strip non-printable / non-ASCII)
function sanitizeSecret(raw: string): string {
  // deno-lint-ignore no-control-regex
  return raw.replace(/[^\x20-\x7E]/g, "").trim();
}

export type EmailResult =
  | { status: "sent"; sentAt: string }
  | { status: "failed"; error: string }
  | { status: "skipped"; error?: string };

function escapeHtml(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function rowsToHtml(rows: Array<[string, unknown]>): string {
  return rows
    .map(
      ([label, value]) =>
        `<p style="margin:0 0 10px;font-size:14px;color:#374151;line-height:1.5">
          <strong style="color:#2d6a4f">${escapeHtml(label)}:</strong><br>${escapeHtml(value).replace(/\n/g, "<br>")}
        </p>`,
    )
    .join("");
}

function wrap(title: string, inner: string): string {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
<tr><td style="background:#2d6a4f;padding:20px 24px;text-align:center">
<span style="font-size:24px">🌱</span>
<h1 style="color:#fff;margin:4px 0 0;font-size:18px;font-weight:700">Clube do Adubo</h1>
</td></tr>
<tr><td style="padding:28px 28px">
<h2 style="color:#2d6a4f;margin:0 0 18px;font-size:18px;font-weight:700">${escapeHtml(title)}</h2>
${inner}
</td></tr>
</table></td></tr></table></body></html>`;
}

async function sendResend(
  subject: string,
  html: string,
): Promise<EmailResult> {
  const resendKey = sanitizeSecret(Deno.env.get("RESEND_API_KEY") || "");
  const from = sanitizeSecret(
    Deno.env.get("CLUBE_NOTIFY_FROM") ||
      Deno.env.get("EMAIL_FROM") ||
      "Clube do Adubo <contato@clubedoadubo.com.br>",
  );
  const to = sanitizeSecret(Deno.env.get("CLUBE_NOTIFY_TO") || DEFAULT_NOTIFY_TO);

  if (!resendKey || !from) {
    console.warn("[clube-notify] RESEND_API_KEY or sender not configured — skipping email");
    return { status: "skipped", error: "RESEND_API_KEY or sender not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) {
      const body = await res.text();
      const error = `Resend ${res.status}: ${body}`.slice(0, 480);
      console.error("[clube-notify]", error);
      return { status: "failed", error };
    }
    return { status: "sent", sentAt: new Date().toISOString() };
  } catch (err) {
    const error = (err instanceof Error ? err.message : "send failed").slice(0, 480);
    console.error("[clube-notify]", error);
    return { status: "failed", error };
  }
}

// ── Lead notification ────────────────────────────────────────────────────────
export async function sendClubeLeadNotification(lead: {
  first_name: string;
  whatsapp: string;
  email: string;
  instagram?: string | null;
  lead_type: string;
  source_page: string;
  origin?: string | null;
  region?: string | null;
  status: string;
  entry_status?: string | null;
  consent_contact: boolean;
  consent_privacy: boolean;
  notes?: string | null;
  created_at: string;
}): Promise<EmailResult> {
  const subject = `[CLUBE LEAD] Novo cadastro Clube do Adubo: ${lead.lead_type} - ${lead.first_name}`;
  const inner =
    `<p style="margin:0 0 16px;font-size:14px;color:#374151">Novo cadastro recebido no Clube do Adubo.</p>` +
    rowsToHtml([
      ["Tipo", lead.lead_type],
      ["Origem", lead.source_page],
      ["Nome", lead.first_name],
      ["WhatsApp", lead.whatsapp],
      ["E-mail", lead.email],
      ["Instagram", lead.instagram || "não informado"],
      ["Região", lead.region || "não informada"],
      ["Origem da visita", lead.origin || "não informada"],
      ["Status", lead.status],
      ["Status do botão/canal", lead.entry_status || "—"],
      ["Data", lead.created_at],
      ["Consentimento de contato", lead.consent_contact ? "sim" : "não"],
      ["Consentimento de privacidade", lead.consent_privacy ? "sim" : "não"],
      ["Observações", lead.notes || "sem observações"],
    ]);
  return await sendResend(subject, wrap("Novo cadastro recebido", inner));
}

// ── Order notification ───────────────────────────────────────────────────────
export async function sendClubeOrderNotification(order: {
  customer_name: string;
  customer_whatsapp: string;
  customer_email: string;
  order_type?: string | null;
  items: unknown;
  quantity_total?: number | null;
  subtotal_amount?: number | null;
  delivery_amount?: number | null;
  discount_amount?: number | null;
  total_amount?: number | null;
  payment_method?: string | null;
  delivery_method?: string | null;
  delivery_address?: string | null;
  status: string;
  external_reference?: string | null;
  preference_id?: string | null;
  source_page?: string | null;
  origin?: string | null;
  region?: string | null;
  notes?: string | null;
  created_at: string;
}): Promise<EmailResult> {
  let subject = `[CLUBE PEDIDO] Novo pedido iniciado - ${order.customer_name}`;
  if (order.order_type === "subscription_request") {
    subject = `[CLUBE PEDIDO] Nova solicitação de assinatura - ${order.customer_name}`;
  } else if (order.order_type === "physical_cart") {
    subject = `[CLUBE PEDIDO] Novo pedido de adubo - ${order.customer_name}`;
  }

  const money = (v: number | null | undefined, fallback = "a combinar") =>
    v === null || v === undefined ? fallback : `R$ ${Number(v).toFixed(2)}`;

  // Human readable items
  let itemsText = "—";
  try {
    const arr = Array.isArray(order.items) ? order.items : JSON.parse(String(order.items));
    if (Array.isArray(arr)) {
      itemsText = arr
        .map((it: Record<string, unknown>) => {
          const qty = it.quantity ?? 1;
          const name = it.name ?? "Item";
          const label = it.label ? ` (${it.label})` : "";
          const price =
            it.price === null || it.price === undefined ? "" : ` — R$ ${Number(it.price).toFixed(2)}`;
          return `• ${qty}x ${name}${label}${price}`;
        })
        .join("\n");
    }
  } catch {
    itemsText = String(order.items ?? "—");
  }

  const inner =
    `<p style="margin:0 0 12px;font-size:14px;color:#374151">Novo pedido iniciado no Clube do Adubo.</p>` +
    `<p style="margin:0 0 16px;font-size:13px;color:#b45309;background:#fffbeb;border-radius:8px;padding:10px 12px">
      <strong>Importante:</strong> este e-mail não confirma pagamento aprovado. Ele informa apenas que o cliente iniciou um pedido, solicitação ou checkout.
    </p>` +
    rowsToHtml([
      ["Nome", order.customer_name],
      ["WhatsApp", order.customer_whatsapp],
      ["E-mail", order.customer_email],
      ["Tipo de pedido", order.order_type || "—"],
      ["Itens", itemsText],
      ["Quantidade total", order.quantity_total ?? "—"],
      ["Subtotal", money(order.subtotal_amount)],
      ["Entrega", money(order.delivery_amount)],
      ["Desconto", money(order.discount_amount, "0")],
      ["Total", money(order.total_amount)],
      ["Forma de pagamento", order.payment_method || "—"],
      ["Forma de entrega", order.delivery_method || "—"],
      ["Endereço", order.delivery_address || "não informado"],
      ["Status", order.status],
      ["External reference", order.external_reference || "—"],
      ["Preference ID", order.preference_id || "não disponível"],
      ["Origem", order.source_page || "—"],
      ["Origem da visita", order.origin || "não informada"],
      ["Região", order.region || "não informada"],
      ["Observações", order.notes || "sem observações"],
      ["Data", order.created_at],
    ]);
  return await sendResend(subject, wrap("Novo pedido iniciado", inner));
}
