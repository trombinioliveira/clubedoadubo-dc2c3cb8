import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendClubeOrderNotification } from "../_shared/clube-notify.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function shortRandom(len = 6): string {
  return Math.random().toString(36).slice(2, 2 + len).toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));

    const customer_name = String(body.customer_name ?? "").trim();
    const customer_whatsapp = String(body.customer_whatsapp ?? "").trim();
    const customer_email = String(body.customer_email ?? "").trim().toLowerCase();
    const order_type = body.order_type ? String(body.order_type) : null;
    const source_page = body.source_page ? String(body.source_page) : null;
    const origin = body.origin ? String(body.origin).slice(0, 2000) : null;
    const region = body.region ? String(body.region).trim() : null;
    const items = body.items ?? [];
    const quantity_total = body.quantity_total ?? null;
    const subtotal_amount = body.subtotal_amount ?? null;
    const delivery_amount = body.delivery_amount ?? null;
    const discount_amount = body.discount_amount ?? 0;
    const total_amount = body.total_amount ?? null;
    const payment_method = body.payment_method ? String(body.payment_method) : null;
    const delivery_method = body.delivery_method ? String(body.delivery_method) : null;
    const delivery_address = body.delivery_address ? String(body.delivery_address) : null;
    const notes = body.notes ? String(body.notes).slice(0, 4000) : null;

    // Validation
    if (customer_name.length < 2) return json({ error: "Nome inválido." }, 400);
    if (customer_whatsapp.replace(/\D/g, "").length < 10) return json({ error: "WhatsApp inválido." }, 400);
    if (!isValidEmail(customer_email)) return json({ error: "E-mail inválido." }, 400);
    if (!items || (Array.isArray(items) && items.length === 0)) {
      return json({ error: "Itens ausentes." }, 400);
    }

    const external_reference = `CLUBE-${Date.now()}-${shortRandom()}`;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: order, error } = await supabase
      .from("clube_orders")
      .insert({
        external_reference,
        status: "created",
        customer_name,
        customer_whatsapp,
        customer_email,
        order_type,
        source_page,
        origin,
        region,
        items,
        quantity_total,
        subtotal_amount,
        delivery_amount,
        discount_amount,
        total_amount,
        payment_method,
        delivery_method,
        delivery_address,
        notes,
      })
      .select("id, external_reference, created_at, status")
      .single();

    if (error || !order) {
      console.error("[create-clube-order] DB error:", error?.message);
      return json({ error: "Não foi possível salvar seu pedido agora." }, 500);
    }

    // Email — must not break the order.
    let emailResult;
    try {
      emailResult = await sendClubeOrderNotification({
        customer_name,
        customer_whatsapp,
        customer_email,
        order_type,
        items,
        quantity_total,
        subtotal_amount,
        delivery_amount,
        discount_amount,
        total_amount,
        payment_method,
        delivery_method,
        delivery_address,
        status: order.status,
        external_reference: order.external_reference,
        preference_id: null,
        source_page,
        origin,
        region,
        notes,
        created_at: order.created_at,
      });
    } catch (e) {
      emailResult = { status: "failed", error: e instanceof Error ? e.message : "send failed" };
    }

    await supabase
      .from("clube_orders")
      .update({
        order_notification_email_status: emailResult.status,
        order_notification_email_sent_at:
          emailResult.status === "sent" ? (emailResult as { sentAt: string }).sentAt : null,
        order_notification_email_error:
          "error" in emailResult ? (emailResult as { error?: string }).error ?? null : null,
      })
      .eq("id", order.id);

    return json({
      success: true,
      order_id: order.id,
      external_reference: order.external_reference,
    });
  } catch (err) {
    console.error("[create-clube-order] Unexpected:", err);
    return json({ error: "Erro inesperado." }, 500);
  }
});
