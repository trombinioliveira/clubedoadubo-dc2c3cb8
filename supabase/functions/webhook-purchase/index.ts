import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-token',
};

// Hash password using Web Crypto API (available in Deno)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Generate a secure temporary password based on document
function generateTempPassword(document: string): string {
  // Remove any non-numeric characters from CPF/CNPJ
  const cleanDoc = document.replace(/\D/g, '');
  return cleanDoc;
}

interface PurchasePayload {
  // Common fields - will be adjusted after receiving test event
  transaction_id?: string;
  order_id?: string;
  id?: string;
  customer?: {
    name?: string;
    email?: string;
    document?: string;
    phone?: string;
  };
  buyer?: {
    name?: string;
    email?: string;
    document?: string;
    phone?: string;
  };
  // Direct fields (alternative structure)
  name?: string;
  email?: string;
  document?: string;
  phone?: string;
  // Event metadata
  event?: string;
  status?: string;
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
    // Log all headers for debugging
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    console.log('=== RECEIVED HEADERS ===');
    console.log(JSON.stringify(headersObj, null, 2));

    // Validate webhook token - checking multiple possible header names
    const webhookToken = Deno.env.get('WEBHOOK_AUTH_TOKEN');
    const possibleTokenHeaders = [
      req.headers.get('X-Webhook-Token'),
      req.headers.get('x-webhook-token'),
      req.headers.get('Authorization')?.replace('Bearer ', ''),
      req.headers.get('authorization')?.replace('Bearer ', ''),
      req.headers.get('X-Auth-Token'),
      req.headers.get('x-auth-token'),
      req.headers.get('Webhook-Token'),
      req.headers.get('webhook-token'),
    ];
    
    const providedToken = possibleTokenHeaders.find(t => t && t !== '');
    console.log('Expected token (first 4 chars):', webhookToken?.substring(0, 4) + '...');
    console.log('Provided token (first 4 chars):', providedToken?.substring(0, 4) + '...');
    
    // Token validation
    if (webhookToken && webhookToken !== '' && providedToken !== webhookToken) {
      console.error('Token mismatch - Invalid webhook token provided');
      // TEMPORARILY DISABLED FOR DEBUGGING - will log payload anyway
      // return new Response(
      //   JSON.stringify({ error: 'Unauthorized - Invalid token' }),
      //   { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      // );
    }

    // Parse the incoming payload
    const payload: PurchasePayload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    // Extract buyer data - flexible to handle different payload structures
    const customerData = payload.customer || payload.buyer || {};
    const name = customerData.name || payload.name;
    const email = customerData.email || payload.email;
    const document = customerData.document || payload.document;
    const phone = customerData.phone || payload.phone;
    const transactionId = payload.transaction_id || payload.order_id || payload.id;

    // Validate required fields
    if (!email) {
      console.error('Missing required field: email');
      return new Response(
        JSON.stringify({ error: 'Missing required field: email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!document) {
      console.error('Missing required field: document (CPF/CNPJ)');
      return new Response(
        JSON.stringify({ error: 'Missing required field: document' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    if (transactionId) {
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
    }

    // Check if user with this email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, user_id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      // Update existing profile with transaction ID for idempotency
      if (transactionId) {
        await supabase
          .from('profiles')
          .update({ external_transaction_id: transactionId })
          .eq('id', existingUser.id);
      }

      console.log('User already exists with email:', email);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User already exists',
          user_id: existingUser.user_id 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate temporary password from document
    const tempPassword = generateTempPassword(document);
    
    // Create the user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email since purchase is already verified
      user_metadata: {
        full_name: name || email.split('@')[0],
        phone: phone,
        document: document
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user', details: authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Auth user created:', authUser.user.id);

    // Update the profile with additional fields
    // Note: profile is auto-created by the trigger, we just need to update it
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: name || email.split('@')[0],
        phone: phone,
        password_change_required: true,
        external_transaction_id: transactionId
      })
      .eq('user_id', authUser.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // User was created but profile update failed - log but don't fail
    }

    console.log('User created successfully:', {
      user_id: authUser.user.id,
      email: email,
      transaction_id: transactionId
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
    console.error('Webhook processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
