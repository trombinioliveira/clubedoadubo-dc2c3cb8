import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteRequest {
  userId: string;
  firstPosition: number;
  lastPosition: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { userId, firstPosition, lastPosition }: DeleteRequest = await req.json()
    
    console.log(`Deleting PROs for user ${userId}, positions ${firstPosition} to ${lastPosition}`)

    // Delete FIFO entries first (they reference pros)
    const { error: fifoError } = await supabase
      .from('fifo_queue')
      .delete()
      .gte('position', firstPosition)
      .lte('position', lastPosition)

    if (fifoError) {
      console.error('Error deleting FIFO entries:', fifoError)
      throw fifoError
    }

    // Delete PROs
    const { error: prosError } = await supabase
      .from('pros')
      .delete()
      .eq('user_id', userId)
      .gte('fifo_position', firstPosition)
      .lte('fifo_position', lastPosition)

    if (prosError) {
      console.error('Error deleting PROs:', prosError)
      throw prosError
    }

    // Get remaining count
    const { count } = await supabase
      .from('pros')
      .select('*', { count: 'exact', head: true })

    console.log(`Deletion complete. Remaining PROs: ${count}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        deleted: lastPosition - firstPosition + 1,
        remaining: count 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in delete-pros-batch:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
