import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
    const body: DeleteRequest = await req.json()
    const { userId, firstPosition, lastPosition } = body

    if (!userId || typeof userId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'userId inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (
      typeof firstPosition !== 'number' || typeof lastPosition !== 'number' ||
      firstPosition <= 0 || lastPosition < firstPosition ||
      (lastPosition - firstPosition) > 200000
    ) {
      return new Response(
        JSON.stringify({ error: 'Posições inválidas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Admin ${callerUserId} deleting PROs for user ${userId}, positions ${firstPosition} to ${lastPosition}`)

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
