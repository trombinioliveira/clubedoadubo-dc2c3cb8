// Edge function: cria/autentica usuário "checkin" (email sintético, auto-confirmado)
// e registra o check-in no ponto. Retorna tokens de sessão para o cliente.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");
const synthEmail = (wa: string) => `wa${wa}@checkin.clubedoadubo.com.br`;
const synthPassword = (wa: string) => `cda_${wa}_v1_secure`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, whatsapp, point_slug } = await req.json();
    const wa = onlyDigits(whatsapp);
    if (!name?.trim() || wa.length < 10 || !point_slug) {
      return json({ error: "invalid_input" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const email = synthEmail(wa);
    const password = synthPassword(wa);

    // 1. Find or create user (auto-confirmed)
    let userId: string | null = null;
    const { data: existing } = await admin.auth.admin.listUsers({
      page: 1, perPage: 1, // we only filter by email below
    });
    // listUsers doesn't filter — use getUserByEmail via REST: easier to just try create then lookup
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name.trim(), whatsapp: wa, source: "checkin", point_slug },
    });

    if (created?.user) {
      userId = created.user.id;
    } else if (createErr) {
      // User likely exists. Look it up.
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = list?.users?.find((u) => u.email === email);
      if (found) {
        userId = found.id;
        // Ensure confirmed + reset password to known value (idempotent)
        await admin.auth.admin.updateUserById(found.id, {
          password,
          email_confirm: true,
          user_metadata: { ...found.user_metadata, full_name: name.trim(), whatsapp: wa },
        });
      } else {
        console.error("[checkin-auth] create failed and user not found", createErr);
        return json({ error: "create_failed", detail: createErr.message }, 500);
      }
    }

    if (!userId) return json({ error: "no_user" }, 500);

    // 2. Update profile (best effort)
    await admin
      .from("profiles")
      .update({ full_name: name.trim(), whatsapp: wa })
      .eq("user_id", userId);

    // 3. Sign in to get session tokens (now confirmed)
    const userClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const { data: signIn, error: signInErr } = await userClient.auth.signInWithPassword({
      email, password,
    });
    if (signInErr || !signIn.session) {
      console.error("[checkin-auth] sign in failed", signInErr);
      return json({ error: "sign_in_failed", detail: signInErr?.message }, 500);
    }

    // 4. Register checkin AS the user (RLS-safe; uses auth.uid())
    const authedClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${signIn.session.access_token}` } },
    });
    const { data: checkinResult, error: checkinErr } = await authedClient
      .rpc("register_checkin", { p_slug: point_slug });

    if (checkinErr) {
      console.error("[checkin-auth] register_checkin failed", checkinErr);
      return json({ error: "checkin_failed", detail: checkinErr.message }, 500);
    }

    return json({
      session: {
        access_token: signIn.session.access_token,
        refresh_token: signIn.session.refresh_token,
      },
      checkin: checkinResult,
    });
  } catch (e) {
    console.error("[checkin-auth] exception", e);
    return json({ error: "exception", detail: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
