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

    // ========================================================
    // TABELAS A LIMPAR (ordem respeita FKs: dependentes primeiro)
    // ========================================================
    // PRESERVADAS: profiles, user_roles, commission_levels,
    //   collection_points, sales_points, impact_missions,
    //   site_settings (estrutural), reset_logs
    // ========================================================

    const tablesToClean = [
      // Dependentes de pros/sale_distributions
      "pro_payouts",
      // Logs e auditoria operacional
      "pro_generation_logs",
      "subscription_logs",
      "notification_events",
      "export_logs",
      "referral_logs",
      "audit_issues",
      "audit_reviews",
      // Stats e estados derivados
      "referral_stats",
      // Jornada do usuário
      "terms_acceptance",
      "otp_codes",
      "dreams",
      // Assinaturas (após subscription_logs)
      "subscriptions",
      // Créditos e ativações
      "pro_credits",
      "pro_activations",
      // Distribuições (após pro_payouts)
      "sale_distributions",
      // FIFO e PROs (após dependentes)
      "fifo_queue",
      "pros",
      // Financeiro
      "financial_entries",
      // Operacional de produção/campo
      "distributions",
      "weighings",
      "batches",
      // Preferências (re-inseridas depois)
      "notification_preferences",
      // Auditoria econômica
      "system_ledger",
    ];

    const counts: Record<string, { before: number }> = {};

    // Count rows before deletion
    for (const table of tablesToClean) {
      const { count } = await adminClient
        .from(table)
        .select("*", { count: "exact", head: true });
      counts[table] = { before: count || 0 };
    }

    // ========================================================
    // EXECUTAR LIMPEZA EM ORDEM SEGURA
    // ========================================================

    // 1. pro_payouts (FK → pros, sale_distributions)
    await adminClient.from("pro_payouts").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 2. pro_generation_logs
    await adminClient.from("pro_generation_logs").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 3. subscription_logs (FK → subscriptions)
    await adminClient.from("subscription_logs").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 4. notification_events
    await adminClient.from("notification_events").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 5. export_logs
    await adminClient.from("export_logs").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 6. referral_logs
    await adminClient.from("referral_logs").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 7. audit_issues
    await adminClient.from("audit_issues").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 8. audit_reviews
    await adminClient.from("audit_reviews").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 9. referral_stats
    await adminClient.from("referral_stats").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 10. terms_acceptance
    await adminClient.from("terms_acceptance").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 11. otp_codes
    await adminClient.from("otp_codes").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 12. dreams
    await adminClient.from("dreams").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 13. subscriptions
    await adminClient.from("subscriptions").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 14. pro_credits
    await adminClient.from("pro_credits").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 15. pro_activations
    await adminClient.from("pro_activations").delete().gte("external_reference", "00000000-0000-0000-0000-000000000000");
    // 16. sale_distributions
    await adminClient.from("sale_distributions").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 17. fifo_queue
    await adminClient.from("fifo_queue").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 18. pros
    await adminClient.from("pros").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 19. financial_entries
    await adminClient.from("financial_entries").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 20. distributions
    await adminClient.from("distributions").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 21. weighings
    await adminClient.from("weighings").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 22. batches
    await adminClient.from("batches").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    // 23. notification_preferences
    await adminClient.from("notification_preferences").delete().gte("user_id", "00000000-0000-0000-0000-000000000000");
    // 24. system_ledger
    await adminClient.from("system_ledger").delete().gte("id", "00000000-0000-0000-0000-000000000000");

    // ========================================================
    // RESETAR CAMPOS OPERACIONAIS NOS PROFILES
    // Zera saldos, créditos, contadores — preserva identidade
    // ========================================================
    const { error: profileResetErr } = await adminClient
      .from("profiles")
      .update({
        internal_balance: 0,
        fertilizer_credits: 0,
        has_viewed_fifo: false,
        commission_preference: "pro",
        external_transaction_id: null,
        profile_completed_at: null,
        profile_deadline: null,
      })
      .gte("id", "00000000-0000-0000-0000-000000000000");

    // ========================================================
    // DESLIGAR AUTOMAÇÃO DE PROS (auto_gen_config → inativo)
    // ========================================================
    await adminClient
      .from("site_settings")
      .upsert(
        {
          key: "auto_gen_config",
          value: {
            status: "inactive",
            quantity_per_cycle: 0,
            interval_minutes: 0,
            activated_by: null,
            activated_at: null,
            total_generated: 0,
            last_execution: null,
            last_error: null,
          },
          updated_by: user.id,
        },
        { onConflict: "key" }
      );

    // ========================================================
    // GARANTIR SITE SETTINGS ESTRUTURAIS (sem recriar env_mode)
    // ========================================================
    const structuralSettings = [
      { key: "missions_enabled", value: { enabled: true } },
      { key: "collective_impact_enabled", value: { enabled: true } },
      { key: "public_transparency_enabled", value: { enabled: true } },
      { key: "public_fifo_enabled", value: { enabled: true } },
      { key: "public_sales_enabled", value: { enabled: true } },
      { key: "public_collection_points_enabled", value: { enabled: true } },
      { key: "public_kpis_enabled", value: { enabled: true } },
      // env_mode NÃO é resetado — operador controla manualmente
    ];

    for (const s of structuralSettings) {
      await adminClient
        .from("site_settings")
        .upsert({ key: s.key, value: s.value }, { onConflict: "key" });
    }

    // ========================================================
    // REINICIALIZAR DADOS DERIVADOS DE PROFILES EXISTENTES
    // ========================================================
    const seeds: string[] = [];

    const { data: profiles } = await adminClient.from("profiles").select("user_id");
    if (profiles && profiles.length > 0) {
      const npInserts = profiles.map((p) => ({ user_id: p.user_id }));
      await adminClient.from("notification_preferences").insert(npInserts).select();
      await adminClient.from("referral_stats").insert(npInserts).select();
      seeds.push(`notification_preferences reinicializado (${profiles.length} perfis)`);
      seeds.push(`referral_stats zerado (${profiles.length} perfis)`);
    }

    seeds.push("auto_gen_config → inativo");
    seeds.push("site_settings estruturais preservados");
    seeds.push("profiles: saldos/créditos/contadores zerados");
    if (!profileResetErr) {
      seeds.push(`profiles operacionais resetados (${profiles?.length || 0} perfis)`);
    }

    // ========================================================
    // REGISTRO DO RESET
    // ========================================================
    const preserved = [
      "profiles (identidade + acesso)",
      "user_roles (papéis)",
      "commission_levels (regras de comissão)",
      "collection_points (cadastro estrutural)",
      "sales_points (cadastro estrutural)",
      "impact_missions (configuração)",
      "site_settings (configuração do site)",
      "reset_logs (histórico de resets)",
    ];

    const details = {
      counts,
      seeds,
      preserved,
      idempotency_key,
      automation_disabled: true,
      profile_fields_reset: [
        "internal_balance → 0",
        "fertilizer_credits → 0",
        "has_viewed_fifo → false",
        "commission_preference → pro",
        "external_transaction_id → null",
        "profile_completed_at → null",
        "profile_deadline → null",
      ],
    };

    await adminClient.from("reset_logs").insert({
      admin_user_id: user.id,
      mode: "pre_go_live",
      details,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reset pré-go-live concluído. Ambiente operacional limpo, usuários preservados, automação desligada.",
        counts,
        seeds,
        preserved,
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
