import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface GenerateRequest {
  amount: number;
  userId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // --- Authentication & Authorization ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify the JWT using anon client
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const callerUserId = claimsData.claims.sub

    // Use service role client for admin check and data operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user is admin
    const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin', { _user_id: callerUserId })
    if (roleError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- Input Validation ---
    const { amount, userId }: GenerateRequest = await req.json()
    
    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 100000) {
      return new Response(
        JSON.stringify({ error: 'Valor inválido. Máximo: 100.000 PROs por requisição.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!userId || typeof userId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'userId inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prosCount = Math.floor(amount)
    
    // Process in batches of 10,000 to avoid timeout
    const BATCH_SIZE = 10000
    const totalBatches = Math.ceil(prosCount / BATCH_SIZE)
    
    let firstPosition: number | null = null
    let lastPosition: number | null = null
    let allSampleCodes: string[] = []
    let totalGenerated = 0

    console.log(`Admin ${callerUserId} generating ${prosCount} PROs for user ${userId} in ${totalBatches} batches`)

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchAmount = Math.min(BATCH_SIZE, prosCount - (batchIndex * BATCH_SIZE))
      
      const { data, error } = await supabase.rpc('generate_pros_batch', {
        p_amount: batchAmount,
        p_user_id: userId
      })

      if (error) {
        console.error(`Error in batch ${batchIndex + 1}:`, error)
        throw error
      }

      if (data && data.length > 0) {
        const result = data[0]
        totalGenerated += result.total_generated
        
        if (firstPosition === null) {
          firstPosition = result.first_position
        }
        lastPosition = result.last_position
        
        if (batchIndex === 0 && result.sample_codes) {
          allSampleCodes = result.sample_codes
        }
      }
    }

    console.log(`Generation complete. Total: ${totalGenerated} PROs`)

    // Enqueue pro_credited notification
    try {
      await supabase.functions.invoke("enqueue-notification", {
        body: {
          user_id: userId,
          template: "pro_credited",
          payload: { quantity: totalGenerated, count: totalGenerated },
          idempotency_key: `pro_credited:${firstPosition}:${lastPosition}:${userId}`,
        },
      });
      // Trigger send immediately
      await supabase.functions.invoke("send-notifications", { method: "POST" });
    } catch (notifErr) {
      console.warn("[generate-pros] Notification error:", notifErr);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: totalGenerated,
        firstPosition,
        lastPosition,
        sampleCodes: allSampleCodes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error generating PROs:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
