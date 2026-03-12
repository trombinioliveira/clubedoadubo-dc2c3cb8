import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Product catalog ──────────────────────────────────────────────────────────
const PRODUCTS: Record<
  string,
  { title: string; unit_price: number; max_quantity: number }
> = {
  pro_avulso: {
    title: "PRO — Processamento de Resíduo Orgânico (avulso)",
    unit_price: 1.0,
    max_quantity: 5000,
  },
  adubo_granulado: {
    title: "Adubo Granulado 0,5 kg",
    unit_price: 15.0,
    max_quantity: 100,
  },
  adubo_liquido: {
    title: "Adubo Líquido Concentrado 600 ml",
    unit_price: 15.0,
    max_quantity: 100,
  },
  plano_semente: {
    title: "Plano Semente — 10 PROs + 1 Adubo / mês",
    unit_price: 25.0,
    max_quantity: 1,
  },
  plano_muda: {
    title: "Plano Muda — 25 PROs + 2 Adubos / mês",
    unit_price: 50.0,
    max_quantity: 1,
  },
  plano_arvore: {
    title: "Plano Árvore — 50 PROs + 3 Adubos / mês",
    unit_price: 90.0,
    max_quantity: 1,
  },
  assinatura_pros_semente: {
    title: "Assinatura PROs — Plano Semente (10 PROs / mês)",
    unit_price: 10.0,
    max_quantity: 1,
  },
  assinatura_pros_muda: {
    title: "Assinatura PROs — Plano Muda (25 PROs / mês)",
    unit_price: 25.0,
    max_quantity: 1,
  },
  assinatura_pros_arvore: {
    title: "Assinatura PROs — Plano Árvore (50 PROs / mês)",
    unit_price: 50.0,
    max_quantity: 1,
  },
  assinatura_granulado: {
    title: "Assinatura Adubo Granulado 0,5 kg / mês",
    unit_price: 15.0,
    max_quantity: 1,
  },
  assinatura_liquido: {
    title: "Assinatura Adubo Líquido 600 ml / mês",
    unit_price: 15.0,
    max_quantity: 1,
  },
  assinatura_combo: {
    title: "Assinatura Granulado + Líquido / mês",
    unit_price: 28.0,
    max_quantity: 1,
  },
  kit_iniciante: {
    title: "Kit Iniciante — 2 Granulados + 1 Líquido + 10 PROs",
    unit_price: 50.0,
    max_quantity: 10,
  },
  kit_jardim: {
    title: "Kit Jardim Completo — 5 Granulados + 3 Líquidos + 25 PROs",
    unit_price: 100.0,
    max_quantity: 10,
  },
  anual_semente: {
    title: "Plano Semente Anual — 10 PROs + 1 Adubo / mês por 12 meses",
    unit_price: 270.0,
    max_quantity: 1,
  },
  anual_muda: {
    title: "Plano Muda Anual — 25 PROs + 2 Adubos / mês por 12 meses",
    unit_price: 540.0,
    max_quantity: 1,
  },
  anual_arvore: {
    title: "Plano Árvore Anual — 50 PROs + 3 Adubos / mês por 12 meses",
    unit_price: 972.0,
    max_quantity: 1,
  },
};

// ── Request schema ───────────────────────────────────────────────────────────
const RequestSchema = z.object({
  product_key: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(50000),
  user_id: z.string().uuid().optional().nullable(),
  referral_code: z.string().max(20).optional().nullable(),
  collection_point_slug: z.string().max(100).optional().nullable(),
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
    // ── Parse & validate body ──────────────────────────────────────────────
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

    const { product_key, quantity, user_id, referral_code, collection_point_slug } = parsed.data;

    // ── Validate product ───────────────────────────────────────────────────
    const product = PRODUCTS[product_key];
    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (quantity > product.max_quantity) {
      return new Response(
        JSON.stringify({
          error: `Quantity exceeds limit. Max: ${product.max_quantity}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Server-side address validation for fertilizer plans ─────────────────
    const REQUIRES_ADDRESS = [
      'plano_semente', 'plano_muda', 'plano_arvore',
      'anual_semente', 'anual_muda', 'anual_arvore',
      'assinatura_granulado', 'assinatura_liquido', 'assinatura_combo',
      'adubo_granulado', 'adubo_liquido',
    ];

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    if (user_id && REQUIRES_ADDRESS.includes(product_key)) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("address_street, address_number, address_neighborhood, address_zipcode, city, address_state")
        .eq("user_id", user_id)
        .single();

      const p = profile as Record<string, string | null> | null;
      const addressComplete = p?.address_street && p?.address_number && p?.address_neighborhood && p?.address_zipcode && p?.city && p?.address_state;

      if (!addressComplete) {
        return new Response(
          JSON.stringify({ error: "ADDRESS_INCOMPLETE" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Build attribution metadata ─────────────────────────────────────────
    let attribution: Record<string, unknown> | null = null;

    if (collection_point_slug) {
      // Look up collection point name for richer attribution
      const { data: cpData } = await supabaseAdmin
        .from("collection_points")
        .select("name, slug, id")
        .eq("slug", collection_point_slug)
        .eq("is_active", true)
        .single();

      attribution = {
        source: "collection_point",
        slug: collection_point_slug,
        collection_point_id: cpData?.id ?? null,
        name: cpData?.name ?? collection_point_slug,
      };
    } else if (referral_code) {
      attribution = {
        source: "referral",
        referral_code,
      };
    }

    // ── Generate external reference (idempotency key) ──────────────────────
    const external_reference = crypto.randomUUID();
    const baseUrl = Deno.env.get("APP_BASE_URL") || req.headers.get("origin") || "https://clubedoadubo.lovable.app";

    // ── Mercado Pago API ───────────────────────────────────────────────────
    const mpEnv = Deno.env.get("MP_ENV") || "sandbox";
    const mpToken = mpEnv === "production"
      ? Deno.env.get("MP_ACCESS_TOKEN_PROD") || Deno.env.get("MP_ACCESS_TOKEN")
      : Deno.env.get("MP_ACCESS_TOKEN");

    if (!mpToken) {
      console.error(`[create-mp-preference] MP_ACCESS_TOKEN not configured (env=${mpEnv})`);
      return new Response(JSON.stringify({ error: "Payment service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[create-mp-preference] env=${mpEnv}, product=${product_key}, qty=${quantity}`);

    const webhookUrl = `${supabaseUrl}/functions/v1/mp-webhook`;

    const preferencePayload = {
      items: [
        {
          id: product_key,
          title: product.title,
          quantity,
          unit_price: product.unit_price,
          currency_id: "BRL",
        },
      ],
      external_reference,
      notification_url: webhookUrl,
      back_urls: {
        success: `${baseUrl}/compra/sucesso?external_reference=${external_reference}`,
        pending: `${baseUrl}/compra/pendente?external_reference=${external_reference}`,
        failure: `${baseUrl}/compra/erro?external_reference=${external_reference}`,
      },
      auto_return: "approved",
      metadata: {
        product_key,
        user_id: user_id ?? null,
        referral_code: referral_code ?? null,
        collection_point_slug: collection_point_slug ?? null,
        cda_version: "2.0",
      },
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
      },
      statement_descriptor: "Clube do Adubo",
    };

    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mpToken}`,
        },
        body: JSON.stringify(preferencePayload),
      }
    );

    if (!mpResponse.ok) {
      const errBody = await mpResponse.text();
      console.error("MP API error:", mpResponse.status, errBody);
      return new Response(
        JSON.stringify({ error: "Failed to create payment preference" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mpData = await mpResponse.json();

    // ── Pre-register a pending financial entry for traceability ────────────
    try {
      await supabaseAdmin.from("financial_entries").insert({
        amount: product.unit_price * quantity,
        currency: "BRL",
        status: "pending",
        provider: "mercado_pago",
        provider_payment_id: null,
        external_reference,
        product_key,
        user_id: user_id ?? null,
        referral_code: referral_code ?? null,
        description: `${product.title} × ${quantity}`,
        is_distributed: false,
        received_at: new Date().toISOString(),
        attribution: attribution,
      });
    } catch (dbErr) {
      // Non-critical — webhook will upsert on confirmation
      console.warn("Pre-registration skipped:", dbErr);
    }

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        preference_id: mpData.id,
        external_reference,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-mp-preference error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
