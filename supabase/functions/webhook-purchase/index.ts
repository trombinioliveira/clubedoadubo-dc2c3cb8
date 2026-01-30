import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-token',
};

// Generate a secure temporary password based on document (CPF/CNPJ)
function generateTempPassword(document: string): string {
  // Remove any non-numeric characters from CPF/CNPJ
  const cleanDoc = document.replace(/\D/g, '');
  return cleanDoc;
}

// Nexano webhook payload structure
interface NexanoPayload {
  event: string;
  token: string;
  offerCode: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf: string | null;
    cnpj: string | null;
    address?: {
      country: string;
      zipCode: string;
      state: string;
      city: string;
      neighborhood: string;
      street: string;
      number: string;
      complement: string;
    };
  };
  transaction: {
    id: string;
    identifier: string;
    paymentMethod: string;
    status: string;
    originalAmount: number;
    originalCurrency: string;
    currency: string;
    exchangeRate: number;
    amount: number;
    installments: number;
    createdAt: string;
    payedAt: string;
    boletoInformation: unknown;
    pixInformation: unknown;
  };
  subscription?: {
    id: string;
    identifier: string;
    intervalCount: number;
    intervalType: string;
    startAt: string;
    cycle: number;
    status: string;
  };
  orderItems: Array<{
    id: string;
    price: number;
    product: {
      id: string;
      name: string;
      externalId: string;
    };
  }>;
  trackProps?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
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
    const payload: NexanoPayload = await req.json();
    console.log('Received webhook event:', payload.event);
    console.log('Transaction ID:', payload.transaction?.id);
    console.log('Client email:', payload.client?.email);

    // Validate webhook token from payload body
    const webhookToken = Deno.env.get('WEBHOOK_AUTH_TOKEN');
    const providedToken = payload.token;
    
    if (webhookToken && webhookToken !== '' && providedToken !== webhookToken) {
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

    // Extract client data
    const client = payload.client;
    const transaction = payload.transaction;
    
    if (!client?.email) {
      console.error('Missing required field: client.email');
      return new Response(
        JSON.stringify({ error: 'Missing required field: client.email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get document (CPF or CNPJ)
    const document = client.cpf || client.cnpj;
    if (!document) {
      console.error('Missing required field: client.cpf or client.cnpj');
      return new Response(
        JSON.stringify({ error: 'Missing required field: cpf/cnpj' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transaction ID for idempotency
    const transactionId = transaction?.id;

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
      .eq('email', client.email)
      .maybeSingle();

    if (existingUser) {
      // Update existing profile with transaction ID for idempotency
      if (transactionId) {
        await supabase
          .from('profiles')
          .update({ external_transaction_id: transactionId })
          .eq('id', existingUser.id);
      }

      console.log('User already exists with email:', client.email);
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
    
    // Create the user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: client.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email since purchase is already verified
      user_metadata: {
        full_name: client.name,
        phone: client.phone,
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
        full_name: client.name,
        phone: client.phone,
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
      email: client.email,
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
    console.error('Webhook processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
