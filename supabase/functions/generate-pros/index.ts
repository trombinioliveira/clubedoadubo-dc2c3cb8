import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { amount, userId }: GenerateRequest = await req.json()
    
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valor inválido' }),
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

    console.log(`Starting generation of ${prosCount} PROs in ${totalBatches} batches`)

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchAmount = Math.min(BATCH_SIZE, prosCount - (batchIndex * BATCH_SIZE))
      
      console.log(`Processing batch ${batchIndex + 1}/${totalBatches}: ${batchAmount} PROs`)
      
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
        
        // Collect sample codes from first batch only
        if (batchIndex === 0 && result.sample_codes) {
          allSampleCodes = result.sample_codes
        }
      }
      
      console.log(`Batch ${batchIndex + 1} complete. Total so far: ${totalGenerated}`)
    }

    console.log(`Generation complete. Total: ${totalGenerated} PROs`)

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
