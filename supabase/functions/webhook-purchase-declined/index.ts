import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-token",
};

interface PurchaseDeclinedPayload {
  // Common fields that may be present in the payload
  transaction_id?: string;
  email?: string;
  cpf?: string;
  cnpj?: string;
  external_id?: string;
  customer_id?: string;
  reason?: string;
  // Nested customer object (common in payment gateways)
  customer?: {
    email?: string;
    cpf?: string;
    cnpj?: string;
    document?: string;
    id?: string;
  };
  // Alternative structure
  buyer?: {
    email?: string;
    cpf?: string;
    cnpj?: string;
    document?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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
    // 1. Validate webhook token
    const webhookToken = req.headers.get("x-webhook-token");
    const expectedToken = Deno.env.get("WEBHOOK_AUTH_TOKEN");

    if (!expectedToken) {
      console.error("[webhook-purchase-declined] WEBHOOK_AUTH_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!webhookToken || webhookToken !== expectedToken) {
      console.warn("[webhook-purchase-declined] Invalid or missing webhook token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Parse payload
    const payload: PurchaseDeclinedPayload = await req.json();
    console.log("[webhook-purchase-declined] Received payload:", JSON.stringify(payload, null, 2));

    // 3. Extract identifier fields from payload
    const transactionId = payload.transaction_id || payload.external_id || null;
    const email = payload.email || payload.customer?.email || payload.buyer?.email || null;
    const cpf = sanitizeCpf(
      payload.cpf || 
      payload.customer?.cpf || 
      payload.customer?.document || 
      payload.buyer?.cpf || 
      payload.buyer?.document || 
      null
    );
    const reason = payload.reason || "Compra recusada pelo gateway de pagamento";

    console.log("[webhook-purchase-declined] Extracted identifiers:", { 
      transactionId, 
      email, 
      cpf: cpf ? "***" + cpf.slice(-4) : null,
      reason 
    });

    // Must have at least one identifier
    if (!email && !cpf && !transactionId) {
      console.warn("[webhook-purchase-declined] No valid identifier found in payload");
      // Return success to avoid retries - log the event
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Event logged but no identifier found",
          action: "none" 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 5. Find user by identifiers (priority: email > cpf > transaction_id)
    let profile = null;
    let searchMethod = "";

    // Try email first
    if (email) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, email, is_blocked, external_transaction_id")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();

      if (!error && data) {
        profile = data;
        searchMethod = "email";
      }
    }

    // Try external_transaction_id if no profile found
    if (!profile && transactionId) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, email, is_blocked, external_transaction_id")
        .eq("external_transaction_id", transactionId)
        .maybeSingle();

      if (!error && data) {
        profile = data;
        searchMethod = "transaction_id";
      }
    }

    // 6. If no user found, log and return success
    if (!profile) {
      console.log("[webhook-purchase-declined] User not found for identifiers:", { 
        email, 
        cpf: cpf ? "***" + cpf.slice(-4) : null,
        transactionId 
      });
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Event logged - user not found",
          action: "none" 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[webhook-purchase-declined] Found user via", searchMethod, ":", { 
      profileId: profile.id, 
      userId: profile.user_id,
      email: profile.email,
      alreadyBlocked: profile.is_blocked 
    });

    // 7. Idempotency check - if already blocked, return success
    if (profile.is_blocked) {
      console.log("[webhook-purchase-declined] User already blocked, skipping");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User already blocked",
          action: "none",
          user_id: profile.user_id 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 8. Block the user in profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        is_blocked: true,
        blocked_at: new Date().toISOString(),
        blocked_reason: reason
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("[webhook-purchase-declined] Failed to block user:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to block user", details: updateError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 9. Invalidate user sessions by signing them out via Supabase Auth Admin API
    try {
      const { error: signOutError } = await supabase.auth.admin.signOut(
        profile.user_id,
        "global" // Sign out from all devices
      );

      if (signOutError) {
        console.warn("[webhook-purchase-declined] Failed to invalidate sessions:", signOutError);
        // Don't fail the request - user is blocked, sessions will be invalidated on next auth check
      } else {
        console.log("[webhook-purchase-declined] Successfully invalidated all sessions for user");
      }
    } catch (sessionError) {
      console.warn("[webhook-purchase-declined] Session invalidation error:", sessionError);
      // Continue - blocking is more important
    }

    console.log("[webhook-purchase-declined] Successfully blocked user:", profile.user_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User blocked successfully",
        action: "blocked",
        user_id: profile.user_id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[webhook-purchase-declined] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper to sanitize CPF/CNPJ (remove non-numeric characters)
function sanitizeCpf(value: string | null): string | null {
  if (!value) return null;
  return value.replace(/\D/g, "");
}
