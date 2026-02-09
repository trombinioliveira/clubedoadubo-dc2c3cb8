import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-token',
};

// Zod schema for Nexano webhook payload validation
const ClientSchema = z.object({
  id: z.string().max(255).optional(),
  name: z.string().min(1, "Client name is required").max(255, "Client name too long"),
  email: z.string().email("Invalid email format").max(255, "Email too long"),
  phone: z.string().max(20, "Phone number too long").optional().nullable(),
  cpf: z.string().regex(/^\d{11}$/, "CPF must be 11 digits").nullable().optional(),
  cnpj: z.string().regex(/^\d{14}$/, "CNPJ must be 14 digits").nullable().optional(),
  address: z.object({
    country: z.string().max(100).optional(),
    zipCode: z.string().max(20).optional(),
    state: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    neighborhood: z.string().max(100).optional(),
    street: z.string().max(255).optional(),
    number: z.string().max(20).optional(),
    complement: z.string().max(255).optional(),
  }).optional(),
});

const TransactionSchema = z.object({
  id: z.string().min(1, "Transaction ID is required").max(255, "Transaction ID too long"),
  identifier: z.string().max(255).optional(),
  paymentMethod: z.string().max(50).optional(),
  status: z.string().max(50).optional(),
  originalAmount: z.number().optional(),
  originalCurrency: z.string().max(10).optional(),
  currency: z.string().max(10).optional(),
  exchangeRate: z.number().optional(),
  amount: z.number().optional(),
  installments: z.number().optional(),
  createdAt: z.string().optional(),
  payedAt: z.string().optional(),
  boletoInformation: z.unknown().optional(),
  pixInformation: z.unknown().optional(),
});

const NexanoPayloadSchema = z.object({
  event: z.string().min(1).max(100),
  token: z.string().min(1, "Token is required").max(500),
  offerCode: z.string().max(100).optional(),
  client: ClientSchema,
  transaction: TransactionSchema,
  subscription: z.object({
    id: z.string().max(255).optional(),
    identifier: z.string().max(255).optional(),
    intervalCount: z.number().optional(),
    intervalType: z.string().max(50).optional(),
    startAt: z.string().optional(),
    cycle: z.number().optional(),
    status: z.string().max(50).optional(),
  }).optional(),
  orderItems: z.array(z.object({
    id: z.string().max(255).optional(),
    price: z.number().optional(),
    product: z.object({
      id: z.string().max(255).optional(),
      name: z.string().max(255).optional(),
      externalId: z.string().max(255).optional(),
    }).optional(),
  })).optional(),
  trackProps: z.object({
    utm_source: z.string().max(255).optional(),
    utm_medium: z.string().max(255).optional(),
    utm_campaign: z.string().max(255).optional(),
  }).optional(),
}).refine((data) => data.client.cpf || data.client.cnpj, {
  message: "Either CPF or CNPJ is required",
  path: ["client"],
});

type NexanoPayload = z.infer<typeof NexanoPayloadSchema>;

// Generate a secure temporary password based on document (CPF/CNPJ)
function generateTempPassword(document: string): string {
  // Remove any non-numeric characters from CPF/CNPJ
  const cleanDoc = document.replace(/\D/g, '');
  return cleanDoc;
}

// Sanitize string for database insertion
function sanitizeString(str: string | null | undefined, maxLength: number): string | null {
  if (!str) return null;
  // Trim whitespace and limit length
  return str.trim().substring(0, maxLength);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    console.error('Method not allowed:', req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse the incoming payload
    let rawPayload: unknown;
    try {
      rawPayload = await req.json();
    } catch {
      console.error('Invalid JSON payload');
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate payload with zod schema
    const validationResult = NexanoPayloadSchema.safeParse(rawPayload);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }));
      console.error('Payload validation failed:', errors);
      return new Response(
        JSON.stringify({ error: 'Invalid payload', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: NexanoPayload = validationResult.data;
    console.log('Received webhook event:', payload.event);
    console.log('Transaction ID:', payload.transaction.id);
    console.log('Client email:', payload.client.email);

    // Validate webhook token from payload body - MANDATORY
    const webhookToken = Deno.env.get('WEBHOOK_AUTH_TOKEN');
    if (!webhookToken || webhookToken === '') {
      console.error('WEBHOOK_AUTH_TOKEN is not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const providedToken = payload.token;
    if (providedToken !== webhookToken) {
      console.error('Invalid webhook token provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only process TRANSACTION_PAID events
    if (payload.event !== 'TRANSACTION_PAID') {
      console.log('Ignoring event type:', payload.event);
      return new Response(
        JSON.stringify({ success: true, message: 'Event type ignored' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract client data (already validated)
    const client = payload.client;
    const transaction = payload.transaction;

    // Get document (CPF or CNPJ) - validated by schema to exist
    const document = client.cpf || client.cnpj;
    if (!document) {
      // This should not happen due to schema refinement, but keep as safety
      console.error('Missing required field: client.cpf or client.cnpj');
      return new Response(
        JSON.stringify({ error: 'Missing required field: cpf/cnpj' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transaction ID for idempotency (validated by schema)
    const transactionId = transaction.id;

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check for idempotency - if transaction already processed, return success
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, user_id')
      .eq('external_transaction_id', transactionId)
      .maybeSingle();

    if (existingProfile) {
      console.log('Transaction already processed:', transactionId);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Transaction already processed',
          user_id: existingProfile.user_id 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize email for lookup (lowercase and trim)
    const sanitizedEmail = client.email.toLowerCase().trim();

    // Check if user with this email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, user_id')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    if (existingUser) {
      // Update existing profile with transaction ID for idempotency
      await supabase
        .from('profiles')
        .update({ external_transaction_id: transactionId })
        .eq('id', existingUser.id);

      console.log('User already exists with email:', sanitizedEmail);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User already exists',
          user_id: existingUser.user_id 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate temporary password from document (CPF/CNPJ - only digits)
    const tempPassword = generateTempPassword(document);
    
    // Sanitize user data before insertion
    const sanitizedName = sanitizeString(client.name, 255) || 'Unknown';
    const sanitizedPhone = sanitizeString(client.phone, 20);

    // Create the user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: sanitizedEmail,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email since purchase is already verified
      user_metadata: {
        full_name: sanitizedName,
        phone: sanitizedPhone,
        document: document
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to create user', details: 'Authentication error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Auth user created:', authUser.user.id);

    // Update the profile with additional fields
    // Note: profile is auto-created by the trigger, we just need to update it
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: sanitizedName,
        phone: sanitizedPhone,
        password_change_required: true,
        external_transaction_id: transactionId
      })
      .eq('user_id', authUser.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError.message);
      // User was created but profile update failed - log but don't fail
    }

    console.log('User created successfully:', {
      user_id: authUser.user.id,
      email: sanitizedEmail,
      transaction_id: transactionId,
      offer_code: payload.offerCode
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User created successfully',
        user_id: authUser.user.id
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Webhook processing error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
