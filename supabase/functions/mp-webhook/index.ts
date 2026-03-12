import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Mercado Pago payment fetcher ──────────────────────────────────────────────
async function fetchMPPayment(paymentId: string, token: string) {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MP API error ${res.status}: ${body}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  // Always consume body to prevent resource leaks
  if (req.method === "OPTIONS") {
    await req.text().catch(() => {});
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    await req.text().catch(() => {});
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let rawBody = "";
  try {
    rawBody = await req.text();
  } catch {
    return new Response(JSON.stringify({ error: "Cannot read body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Respond immediately with 200 (MP requires fast ACK) ──────────────────
  // We process asynchronously
  const processWebhook = async () => {
    const mpEnv = Deno.env.get("MP_ENV") || "sandbox";
    const mpToken = mpEnv === "production"
      ? Deno.env.get("MP_ACCESS_TOKEN_PROD") || Deno.env.get("MP_ACCESS_TOKEN")
      : Deno.env.get("MP_ACCESS_TOKEN");

    if (!mpToken) {
      console.error(`[mp-webhook] MP_ACCESS_TOKEN not configured (env=${mpEnv})`);
      return;
    }

    console.log(`[mp-webhook] env=${mpEnv}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ── Parse notification body ──────────────────────────────────────────
    let notification: Record<string, unknown>;
    try {
      notification = JSON.parse(rawBody);
    } catch {
      console.error("[mp-webhook] Invalid JSON body");
      return;
    }

    const topic = (notification.type as string) || (notification.topic as string);
    console.log("[mp-webhook] Received notification:", { topic, notification });

    // Only handle payment notifications
    if (topic !== "payment") {
      console.log("[mp-webhook] Ignoring topic:", topic);
      return;
    }

    // Extract payment_id from different notification formats
    let paymentId: string | null = null;

    // Format 1: { type: "payment", data: { id: "..." } }
    const dataObj = notification.data as Record<string, unknown> | undefined;
    if (dataObj?.id) {
      paymentId = String(dataObj.id);
    }

    // Format 2: Query string ?id=...&topic=payment
    if (!paymentId) {
      try {
        const url = new URL(req.url);
        const qId = url.searchParams.get("id");
        if (qId) paymentId = qId;
      } catch {}
    }

    if (!paymentId) {
      console.error("[mp-webhook] No payment_id found in notification");
      return;
    }

    console.log("[mp-webhook] Processing payment_id:", paymentId);

    // ── Fetch payment details from MP API ───────────────────────────────
    let payment: Record<string, unknown>;
    try {
      payment = await fetchMPPayment(paymentId, mpToken);
    } catch (err) {
      console.error("[mp-webhook] Failed to fetch payment:", err);
      return;
    }

    const status = String(payment.status || "");
    const external_reference = String(payment.external_reference || "");
    const amount = Number(payment.transaction_amount || 0);
    const currency = String(payment.currency_id || "BRL");
    const paidAt = (payment.date_approved as string) || new Date().toISOString();

    const metadata = (payment.metadata as Record<string, unknown>) || {};
    const product_key = (metadata.product_key as string) || null;
    const user_id = (metadata.user_id as string) || null;
    const referral_code = (metadata.referral_code as string) || null;

    console.log("[mp-webhook] Payment status:", status, "| amount:", amount);

    // ── Idempotency check ────────────────────────────────────────────────
    const { data: existing } = await supabase
      .from("financial_entries")
      .select("id, status, is_distributed")
      .eq("provider_payment_id", paymentId)
      .maybeSingle();

    if (existing && existing.status === "confirmed" && existing.is_distributed) {
      console.log(`[mp-webhook] env=${mpEnv} | Already processed (idempotent), skipping: ${paymentId}`);
      return;
    }

    // ── Map MP status to internal status ─────────────────────────────────
    const internalStatus =
      status === "approved"
        ? "confirmed"
        : status === "pending" || status === "in_process"
        ? "pending"
        : "declined";

    // ── Upsert financial_entry ────────────────────────────────────────────
    let financialEntryId: string | null = null;

    if (existing) {
      // Update existing pending entry
      const { data: updated, error: updErr } = await supabase
        .from("financial_entries")
        .update({
          status: internalStatus,
          provider_payment_id: paymentId,
          amount,
          received_at: paidAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("id")
        .single();

      if (updErr) {
        console.error("[mp-webhook] Failed to update financial entry:", updErr.message);
        return;
      }
      financialEntryId = updated?.id ?? null;
    } else {
      // Insert new entry (no pre-registration existed)
      const { data: inserted, error: insErr } = await supabase
        .from("financial_entries")
        .insert({
          amount,
          currency,
          status: internalStatus,
          provider: "mercado_pago",
          provider_payment_id: paymentId,
          external_reference,
          product_key,
          user_id,
          referral_code,
          description: `Pagamento MP ${paymentId}${product_key ? ` — ${product_key}` : ""}`,
          is_distributed: false,
          received_at: paidAt,
        })
        .select("id")
        .single();

      if (insErr) {
        console.error("[mp-webhook] Failed to insert financial entry:", insErr.message);
        return;
      }
      financialEntryId = inserted?.id ?? null;
    }

    if (!financialEntryId) {
      console.error("[mp-webhook] No financial entry ID after upsert");
      return;
    }

    // ── Trigger distribution only if approved ────────────────────────────
    if (internalStatus === "confirmed") {
      console.log("[mp-webhook] Triggering distribution for:", financialEntryId);
      const { data: distResult, error: distErr } = await supabase.rpc(
        "process_sale_distribution",
        { p_financial_entry_id: financialEntryId }
      );

      if (distErr) {
        console.error("[mp-webhook] Distribution error:", distErr.message);
      } else {
        console.log("[mp-webhook] Distribution result:", distResult);
      }

      // ── Enqueue purchase_confirmed notification ───────────────────────
      if (user_id) {
        try {
          await supabase.functions.invoke("enqueue-notification", {
            body: {
              user_id,
              template: "purchase_confirmed",
              payload: { amount, product_key, product_name: product_key },
              idempotency_key: `purchase_confirmed:${paymentId}`,
            },
          });
        } catch (notifErr) {
          console.warn("[mp-webhook] Notification enqueue error:", notifErr);
        }
      }

      // ── Enqueue pro_paid notifications for affected users ─────────────
      if (distResult && typeof distResult === "object") {
        const dr = distResult as Record<string, unknown>;
        if (dr.success && dr.sale_distribution_id) {
          try {
            const { data: payouts } = await supabase
              .from("pro_payouts")
              .select("pro_id, pros!inner(user_id)")
              .eq("sale_distribution_id", dr.sale_distribution_id as string);

            if (payouts) {
              const userIds = [...new Set(payouts.map((p: any) => p.pros?.user_id).filter(Boolean))];
              for (const uid of userIds) {
                await supabase.functions.invoke("enqueue-notification", {
                  body: {
                    user_id: uid,
                    template: "pro_paid",
                    payload: { pros_paid: dr.pros_paid, amount: dr.amount_used },
                    idempotency_key: `pro_paid:${dr.sale_distribution_id}:${uid}`,
                  },
                });
              }
            }
          } catch (notifErr) {
            console.warn("[mp-webhook] Pro paid notification error:", notifErr);
          }

          // ── Enqueue fifo_moved for users with active PROs ─────────────
          try {
            const today = new Date().toISOString().slice(0, 10);
            const { data: activeUsers } = await supabase
              .from("fifo_queue")
              .select("pros!inner(user_id)")
              .in("status", ["pending", "processing", "ready", "sold"])
              .limit(200);

            if (activeUsers) {
              const uniqueUsers = [...new Set(activeUsers.map((a: any) => a.pros?.user_id).filter(Boolean))];
              for (const uid of uniqueUsers) {
                await supabase.functions.invoke("enqueue-notification", {
                  body: {
                    user_id: uid,
                    template: "fifo_moved",
                    payload: {},
                    idempotency_key: `fifo_moved:${today}:${uid}`,
                  },
                }).catch(() => {}); // anti-spam handled by enqueue
              }
            }
          } catch (notifErr) {
            console.warn("[mp-webhook] FIFO notification error:", notifErr);
          }
        }
      }

      // ── Create / link user account if user_id provided ─────────────────
      if (user_id) {
        try {
          await supabase
            .from("profiles")
            .update({ account_status: "active" })
            .eq("user_id", user_id);
          console.log("[mp-webhook] Profile activated for user:", user_id);
        } catch (profileErr) {
          console.warn("[mp-webhook] Profile update error:", profileErr);
        }

        // ── Upsert subscription for plan/subscription products ────────────
        const SUBSCRIPTION_PREFIXES = ["plano_", "assinatura_", "anual_"];
        const isSubscriptionProduct = product_key && SUBSCRIPTION_PREFIXES.some(
          (prefix) => product_key.startsWith(prefix)
        );

        if (isSubscriptionProduct && financialEntryId) {
          try {
            const { error: subErr } = await supabase
              .from("subscriptions")
              .upsert(
                {
                  user_id,
                  plan_key: product_key,
                  status: "active",
                  last_payment_id: financialEntryId,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
              );
            if (subErr) {
              console.error("[mp-webhook] Subscription upsert error:", subErr.message);
            } else {
              console.log("[mp-webhook] Subscription upserted for user:", user_id, "plan:", product_key);
            }
          } catch (subCatchErr) {
            console.warn("[mp-webhook] Subscription upsert catch:", subCatchErr);
          }
        }
      }

      // ── Process send queue immediately ─────────────────────────────────
      try {
        await supabase.functions.invoke("send-notifications", { method: "POST" });
      } catch (sendErr) {
        console.warn("[mp-webhook] Send notifications error:", sendErr);
      }
    }

    // ── Handle declined payments ─────────────────────────────────────────
    if (internalStatus === "declined" && user_id) {
      console.log("[mp-webhook] Payment declined for user:", user_id);
      // Optional: block account if required by business rules
      // For now, just log — do NOT auto-block on MP declines (user can retry)
    }

    console.log("[mp-webhook] Done processing payment:", paymentId, "status:", internalStatus);
  };

  // Fire and forget — respond immediately to MP
  processWebhook().catch((err) =>
    console.error("[mp-webhook] Async processing error:", err)
  );

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
