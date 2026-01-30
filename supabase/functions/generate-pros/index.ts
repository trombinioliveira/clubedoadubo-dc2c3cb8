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
  // Handle CORS preflight requests
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
    
    // Get starting position
    const { data: startPosition, error: posError } = await supabase.rpc('get_next_fifo_position')
    if (posError) throw posError

    // Generate unique codes
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const usedCodes = new Set<string>()
    const generatedCodes: string[] = []

    for (let i = 0; i < prosCount; i++) {
      let code: string
      do {
        code = ''
        for (let j = 0; j < 8; j++) {
          code += chars[Math.floor(Math.random() * chars.length)]
        }
      } while (usedCodes.has(code))
      usedCodes.add(code)
      generatedCodes.push(code)
    }

    // Batch insert PROs
    const BATCH_SIZE = 2000
    const totalBatches = Math.ceil(prosCount / BATCH_SIZE)
    const allInsertedPros: { id: string; code: string; fifo_position: number }[] = []

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE
      const end = Math.min(start + BATCH_SIZE, prosCount)
      
      const prosToInsert = []
      for (let i = start; i < end; i++) {
        prosToInsert.push({
          code: generatedCodes[i],
          user_id: userId,
          weight_grams: 100,
          fifo_position: (startPosition as number) + i,
          status: 'pending'
        })
      }

      const { data: insertedPros, error: prosError } = await supabase
        .from('pros')
        .insert(prosToInsert)
        .select('id, code, fifo_position')

      if (prosError) throw prosError
      if (insertedPros) allInsertedPros.push(...insertedPros)
    }

    // Batch insert FIFO entries
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE
      const end = Math.min(start + BATCH_SIZE, allInsertedPros.length)
      
      const fifoInserts = allInsertedPros.slice(start, end).map(pro => ({
        pro_id: pro.id,
        position: pro.fifo_position,
        status: 'pending'
      }))

      const { error: fifoError } = await supabase
        .from('fifo_queue')
        .insert(fifoInserts)

      if (fifoError) throw fifoError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: prosCount,
        firstPosition: startPosition,
        lastPosition: (startPosition as number) + prosCount - 1,
        sampleCodes: generatedCodes.slice(0, 10)
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
