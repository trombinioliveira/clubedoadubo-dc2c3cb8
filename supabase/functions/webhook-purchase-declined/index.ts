import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-token",
};

// Zod schema for Nexano declined webhook payload validation
const ClientSchema = z.object({
  id: z.string().max(255).optional(),
  name: z.string().max(255).optional().default("Unknown"),
  email: z.string().email("Invalid email format").max(255),
  phone: z.string().max(20).optional().nullable(),
  cpf: z.string().regex(/^\d{11}$/, "CPF must be 11 digits").nullable().optional(),
  cnpj: z.string().regex(/^\d{14}$/, "CNPJ must be 14 digits").nullable().optional(),
});

const TransactionSchema = z.object({
  id: z.string().min(1, "Transaction ID is required").max(255, "Transaction ID too long"),
  identifier: z.string().max(255).optional(),
  paymentMethod: z.string().max(50).optional(),
  status: z.string().max(50).optional(),
  amount: z.number().optional(),
  createdAt: z.string().optional(),
});

const NexanoDeclinedPayloadSchema = z.object({
  event: z.string().min(1).max(100),
  token: z.string().min(1, "Token is required").max(500),
  offerCode: z.string().max(100).optional(),
  client: ClientSchema,
  transaction: TransactionSchema,
  reason: z.string().max(500).optional(),
});

type NexanoDeclinedPayload = z.infer<typeof NexanoDeclinedPayloadSchema>;

// Sanitize string for logging/storage
function sanitizeString(str: string | null | undefined, maxLength: number): string | null {
  if (!str) return null;
  return str.trim().substring(0, maxLength);
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
    // 1. Parse payload with error handling
    let rawPayload: unknown;
    try {
      rawPayload = await req.json();
    } catch {
      console.error("[webhook-purchase-declined] Invalid JSON payload");
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate payload with zod schema
    const validationResult = NexanoDeclinedPayloadSchema.safeParse(rawPayload);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }));
      console.error("[webhook-purchase-declined] Payload validation failed:", errors);
      return new Response(
        JSON.stringify({ error: "Invalid payload", details: errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: NexanoDeclinedPayload = validationResult.data;
    console.log("[webhook-purchase-declined] Received event:", payload.event);
    console.log("[webhook-purchase-declined] Transaction ID:", payload.transaction.id);
    console.log("[webhook-purchase-declined] Client email:", payload.client.email);

    // 3. Validate webhook token from payload body
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

    // 4. Extract and sanitize identifiers from payload
    const client = payload.client;
    const transaction = payload.transaction;
    const transactionId = sanitizeString(transaction.id, 255);
    const email = client.email.toLowerCase().trim();
    const reason = sanitizeString(payload.reason, 500) || 
      `Compra recusada - Status: ${sanitizeString(transaction.status, 50) || 'unknown'}`;

    console.log("[webhook-purchase-declined] Extracted identifiers:", { 
      transactionId, 
      email,
      status: transaction.status,
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

    // 5. Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 6. Find user by identifiers (priority: email > transaction_id)
    let profile = null;
    let searchMethod = "";

    // Try email first
    if (email) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, email, is_blocked, external_transaction_id")
        .eq("email", email)
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

    // 7. If no user found, log and return success
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
      alreadyBlocked: profile.is_blocked 
    });

    // 8. Idempotency check - if already blocked, return success
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

    // 9. Block the user in profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        is_blocked: true,
        blocked_at: new Date().toISOString(),
        blocked_reason: reason
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("[webhook-purchase-declined] Failed to block user:", updateError.message);
      return new Response(
        JSON.stringify({ error: "Failed to block user" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 10. Invalidate user sessions by signing them out via Supabase Auth Admin API
    try {
      const { error: signOutError } = await supabase.auth.admin.signOut(
        profile.user_id,
        "global" // Sign out from all devices
      );

      if (signOutError) {
        console.warn("[webhook-purchase-declined] Failed to invalidate sessions:", signOutError.message);
        // Don't fail the request - user is blocked, sessions will be invalidated on next auth check
      } else {
        console.log("[webhook-purchase-declined] Successfully invalidated all sessions for user");
      }
    } catch (sessionError) {
      console.warn("[webhook-purchase-declined] Session invalidation error:", 
        sessionError instanceof Error ? sessionError.message : "Unknown error");
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
    console.error("[webhook-purchase-declined] Unexpected error:", 
      error instanceof Error ? error.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
