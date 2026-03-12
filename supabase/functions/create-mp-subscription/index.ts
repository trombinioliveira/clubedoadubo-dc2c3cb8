import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLANS: Record<string, { reason: string; amount: number; pros_per_cycle: number }> = {
  plano_semente: { reason: "Clube do Adubo - Plano Semente", amount: 25, pros_per_cycle: 10 },
  plano_muda:    { reason: "Clube do Adubo - Plano Muda",    amount: 50, pros_per_cycle: 25 },
  plano_arvore:  { reason: "Clube do Adubo - Plano Árvore",  amount: 90, pros_per_cycle: 50 },
};

const RequestSchema = z.object({
  plan_key: z.enum(["plano_semente", "plano_muda", "plano_arvore"]),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    if (!userEmail) {
      return new Response(JSON.stringify({ error: "User email not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = RequestSchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parsed.error.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { plan_key } = parsed.data;
    const plan = PLANS[plan_key];

    // ── Mercado Pago preapproval ────────────────────────────────────────────
    const mpEnv = Deno.env.get("MP_ENV") || "sandbox";
    const mpToken = mpEnv === "production"
      ? Deno.env.get("MP_ACCESS_TOKEN_PROD") || Deno.env.get("MP_ACCESS_TOKEN")
      : Deno.env.get("MP_ACCESS_TOKEN");

    if (!mpToken) {
      console.error(`[create-mp-subscription] MP_ACCESS_TOKEN not configured (env=${mpEnv})`);
      return new Response(JSON.stringify({ error: "Payment service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[create-mp-subscription] env=${mpEnv}, plan=${plan_key}, user=${userId}`);

    const baseUrl = Deno.env.get("APP_BASE_URL") || "https://clubedoadubo.lovable.app";

    const preapprovalPayload = {
      reason: plan.reason,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plan.amount,
        currency_id: "BRL",
      },
      back_url: `${baseUrl}/assinatura/sucesso`,
      payer_email: userEmail,
      external_reference: `sub_${userId}_${plan_key}_${Date.now()}`,
    };

    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpToken}`,
      },
      body: JSON.stringify(preapprovalPayload),
    });

    if (!mpResponse.ok) {
      const errBody = await mpResponse.text();
      console.error("MP preapproval error:", mpResponse.status, errBody);
      return new Response(
        JSON.stringify({ error: "Failed to create subscription", details: errBody }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mpData = await mpResponse.json();

    // ── Save subscription in DB ─────────────────────────────────────────────
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: dbError } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          plan_key,
          plan_type: "monthly",
          status: "active",
          mp_preapproval_id: mpData.id,
          pros_per_cycle: plan.pros_per_cycle,
          started_at: new Date().toISOString(),
          current_cycle: 1,
        },
        { onConflict: "user_id" }
      );

    if (dbError) {
      console.error("DB insert error:", dbError);
      // Non-blocking — the MP subscription was already created
    }

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        preapproval_id: mpData.id,
        plan_key,
        status: mpData.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-mp-subscription error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
