import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
    } = await callerClient.auth.getUser();

    if (!caller) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get target user_id
    const { user_id } = await req.json();
    if (!user_id || typeof user_id !== "string") {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prevent self-deletion
    if (user_id === caller.id) {
      return new Response(
        JSON.stringify({ error: "Cannot delete your own account" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if target is also admin — prevent deleting other admins
    const { data: targetRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user_id)
      .eq("role", "admin")
      .maybeSingle();

    if (targetRole) {
      return new Response(
        JSON.stringify({ error: "Cannot delete another admin user" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Clean up related data in order (respect FK constraints)
    // 1. PRO-related
    const { data: userPros } = await adminClient
      .from("pros")
      .select("id")
      .eq("user_id", user_id);

    const proIds = (userPros || []).map((p) => p.id);

    if (proIds.length > 0) {
      await adminClient.from("pro_payouts").delete().in("pro_id", proIds);
      await adminClient.from("fifo_queue").delete().in("pro_id", proIds);
      await adminClient.from("pros").delete().eq("user_id", user_id);
    }

    // 2. Financial / economic
    await adminClient.from("pro_credits").delete().eq("user_id", user_id);
    await adminClient.from("pro_activations").delete().eq("user_id", user_id);
    await adminClient.from("dreams").delete().eq("user_id", user_id);
    await adminClient.from("system_ledger").delete().eq("user_id", user_id);
    await adminClient.from("referral_logs").delete().eq("user_id", user_id);
    await adminClient.from("referral_stats").delete().eq("user_id", user_id);
    await adminClient.from("notification_events").delete().eq("user_id", user_id);
    await adminClient.from("notification_preferences").delete().eq("user_id", user_id);
    await adminClient.from("terms_acceptance").delete().eq("user_id", user_id);
    await adminClient.from("otp_codes").delete().eq("user_id", user_id);

    // 3. Subscriptions (logs reference subscriptions)
    const { data: userSubs } = await adminClient
      .from("subscriptions")
      .select("id")
      .eq("user_id", user_id);

    const subIds = (userSubs || []).map((s) => s.id);
    if (subIds.length > 0) {
      await adminClient
        .from("subscription_logs")
        .delete()
        .in("subscription_id", subIds);
    }
    await adminClient.from("subscriptions").delete().eq("user_id", user_id);

    // 4. Financial entries
    await adminClient.from("financial_entries").delete().eq("user_id", user_id);

    // 5. Weighings
    await adminClient.from("weighings").delete().eq("user_id", user_id);

    // 6. Clear referred_by references pointing to this profile
    const { data: profileData } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle();

    if (profileData) {
      await adminClient
        .from("profiles")
        .update({ referred_by: null })
        .eq("referred_by", profileData.id);
    }

    // 7. User roles & profile
    await adminClient.from("user_roles").delete().eq("user_id", user_id);
    await adminClient.from("profiles").delete().eq("user_id", user_id);

    // 8. Delete from auth.users via Admin API
    const { error: authError } =
      await adminClient.auth.admin.deleteUser(user_id);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      return new Response(
        JSON.stringify({
          error: "Profile data cleaned but auth deletion failed",
          details: authError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, deleted_user_id: user_id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("delete-user error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
