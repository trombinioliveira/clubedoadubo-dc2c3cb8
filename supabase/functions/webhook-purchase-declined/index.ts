import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-token",
};

// Nexano webhook payload structure for declined purchases
interface NexanoDeclinedPayload {
  event: string;
  token: string;
  offerCode?: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    cpf: string | null;
    cnpj: string | null;
  };
  transaction: {
    id: string;
    identifier?: string;
    paymentMethod?: string;
    status: string;
    amount?: number;
    createdAt?: string;
  };
  reason?: string;
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
    // 1. Parse payload first to get the token from body
    const payload: NexanoDeclinedPayload = await req.json();
    console.log("[webhook-purchase-declined] Received event:", payload.event);
    console.log("[webhook-purchase-declined] Transaction ID:", payload.transaction?.id);
    console.log("[webhook-purchase-declined] Client email:", payload.client?.email);

    // 2. Validate webhook token from payload body (same as webhook-purchase)
    const expectedToken = Deno.env.get("WEBHOOK_AUTH_TOKEN");
    const providedToken = payload.token;

    if (expectedToken && expectedToken !== "" && providedToken !== expectedToken) {
      console.warn("[webhook-purchase-declined] Invalid webhook token provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[webhook-purchase-declined] Token validated successfully");

    // 3. Extract identifiers from payload
    const client = payload.client;
    const transaction = payload.transaction;
    const transactionId = transaction?.id || null;
    const email = client?.email || null;
    const reason = payload.reason || `Compra recusada - Status: ${transaction?.status || 'unknown'}`;

    console.log("[webhook-purchase-declined] Extracted identifiers:", { 
      transactionId, 
      email,
      status: transaction?.status,
      reason 
    });

    // Must have at least one identifier
    if (!email && !transactionId) {
      console.warn("[webhook-purchase-declined] No valid identifier found in payload");
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 5. Find user by identifiers (priority: email > transaction_id)
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
