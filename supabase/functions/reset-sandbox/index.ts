import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate caller is admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: isAdmin } = await adminClient.rpc("is_admin", { _user_id: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate env_mode is sandbox
    const { data: envSetting } = await adminClient
      .from("site_settings")
      .select("value")
      .eq("key", "env_mode")
      .single();

    const envMode = (envSetting?.value as any)?.mode || "production";
    if (envMode === "production") {
      return new Response(
        JSON.stringify({ error: "Reset bloqueado em modo produção. Altere env_mode para sandbox primeiro." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse body
    const body = await req.json().catch(() => ({}));
    const { idempotency_key, confirmation } = body;

    if (confirmation !== "RESET") {
      return new Response(JSON.stringify({ error: "Confirmação inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: check last reset was > 5 min ago
    const { data: lastReset } = await adminClient
      .from("reset_logs")
      .select("executed_at")
      .order("executed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastReset) {
      const lastTime = new Date(lastReset.executed_at).getTime();
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      if (lastTime > fiveMinAgo) {
        return new Response(
          JSON.stringify({ error: "Aguarde 5 minutos entre resets." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Count rows before truncation
    const tablesToClean = [
      "pro_payouts",
      "notification_events",
      "export_logs",
      "referral_logs",
      "referral_stats",
      "terms_acceptance",
      "otp_codes",
      "dreams",
      "subscriptions",
      "sale_distributions",
      "fifo_queue",
      "pros",
      "financial_entries",
      "distributions",
      "weighings",
      "batches",
      "notification_preferences",
      "impact_missions",
      "collection_points",
      "sales_points",
    ];

    const counts: Record<string, { before: number; after: number }> = {};

    for (const table of tablesToClean) {
      const { count } = await adminClient
        .from(table)
        .select("*", { count: "exact", head: true });
      counts[table] = { before: count || 0, after: 0 };
    }

    // Execute truncation in dependency order using raw SQL via service role
    // We use individual deletes since Supabase JS doesn't support TRUNCATE
    // Order: dependents first

    // 1. pro_payouts (depends on pros, sale_distributions)
    await adminClient.from("pro_payouts").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 2. notification_events
    await adminClient.from("notification_events").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 3. export_logs
    await adminClient.from("export_logs").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 4. referral_logs
    await adminClient.from("referral_logs").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 5. referral_stats
    await adminClient.from("referral_stats").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 6. terms_acceptance
    await adminClient.from("terms_acceptance").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 7. otp_codes
    await adminClient.from("otp_codes").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 8. dreams
    await adminClient.from("dreams").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 9. subscriptions
    await adminClient.from("subscriptions").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 10. sale_distributions (depends on financial_entries)
    await adminClient.from("sale_distributions").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 11. fifo_queue (depends on pros)
    await adminClient.from("fifo_queue").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 12. pros (depends on batches, collection_points, dreams)
    await adminClient.from("pros").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 13. financial_entries
    await adminClient.from("financial_entries").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 14. distributions (depends on sales_points)
    await adminClient.from("distributions").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 15. weighings (depends on collection_points)
    await adminClient.from("weighings").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 16. batches
    await adminClient.from("batches").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 17. notification_preferences
    await adminClient.from("notification_preferences").delete().gte("user_id", "00000000-0000-0000-0000-000000000000");
    // 18. impact_missions
    await adminClient.from("impact_missions").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 19. collection_points
    await adminClient.from("collection_points").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 20. sales_points
    await adminClient.from("sales_points").delete().gte("id", "00000000-0000-0000-0000-000000000000");

    // Re-insert seeds
    const seeds: string[] = [];

    // Seed: commission_levels (clear and re-insert)
    await adminClient.from("commission_levels").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    const { error: clErr } = await adminClient.from("commission_levels").insert([
      { level_number: 1, label: "Iniciante", min_referrals: 0, max_referrals: 2, rate_percent: 5, is_active: true },
      { level_number: 2, label: "Ativo", min_referrals: 3, max_referrals: 9, rate_percent: 10, is_active: true },
      { level_number: 3, label: "Embaixador", min_referrals: 10, max_referrals: 24, rate_percent: 15, is_active: true },
      { level_number: 4, label: "Líder", min_referrals: 25, max_referrals: null, rate_percent: 20, is_active: true },
    ]);
    if (!clErr) seeds.push("commission_levels (4 níveis)");

    // Seed: 1 collection_point
    const { error: cpErr } = await adminClient.from("collection_points").insert({
      name: "Ponto de Coleta Teste",
      address: "Rua Teste, 123",
      city: "São Paulo",
      state: "SP",
      is_active: true,
      has_public_page: true,
      slug: "ponto-teste",
      description: "Ponto de coleta para testes",
    });
    if (!cpErr) seeds.push("collection_points (1 ponto teste)");

    // Seed: 1 sales_point
    const { error: spErr } = await adminClient.from("sales_points").insert({
      name: "Ponto de Venda Teste",
      address: "Av. Teste, 456",
      is_active: true,
      contact_name: "Contato Teste",
    });
    if (!spErr) seeds.push("sales_points (1 ponto teste)");

    // Ensure site_settings seeds
    const settingsSeeds = [
      { key: "missions_enabled", value: { enabled: true } },
      { key: "collective_impact_enabled", value: { enabled: true } },
      { key: "public_transparency_enabled", value: { enabled: true } },
      { key: "public_fifo_enabled", value: { enabled: true } },
      { key: "public_sales_enabled", value: { enabled: true } },
      { key: "public_collection_points_enabled", value: { enabled: true } },
      { key: "public_kpis_enabled", value: { enabled: true } },
      { key: "env_mode", value: { mode: "sandbox" } },
    ];

    for (const s of settingsSeeds) {
      await adminClient
        .from("site_settings")
        .upsert({ key: s.key, value: s.value }, { onConflict: "key" });
    }
    seeds.push("site_settings (toggles resetados)");

    // Re-initialize notification_preferences and referral_stats for existing profiles
    const { data: profiles } = await adminClient.from("profiles").select("user_id");
    if (profiles && profiles.length > 0) {
      const npInserts = profiles.map((p) => ({ user_id: p.user_id }));
      await adminClient.from("notification_preferences").insert(npInserts).select();
      await adminClient.from("referral_stats").insert(npInserts).select();
      seeds.push(`notification_preferences (${profiles.length} perfis)`);
      seeds.push(`referral_stats (${profiles.length} perfis)`);
    }

    // Log the reset
    const details = { counts, seeds, idempotency_key };
    await adminClient.from("reset_logs").insert({
      admin_user_id: user.id,
      mode: "soft_reset",
      details,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reset sandbox concluído com sucesso",
        counts,
        seeds,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Reset error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno no reset", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
