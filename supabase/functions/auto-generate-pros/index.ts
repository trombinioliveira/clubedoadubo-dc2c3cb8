import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

/**
 * Edge Function: auto-generate-pros
 * 
 * Called by pg_cron every minute. Checks site_settings.auto_gen_config:
 * - If active=true and enough time has passed since last_execution, generates PROs
 * - Uses advisory lock to prevent concurrent execution
 * - Logs every execution to pro_generation_logs
 * - Updates auto_gen_config with last_execution timestamp
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // 1. Read auto_gen_config from site_settings
    const { data: configData, error: configError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'auto_gen_config')
      .single()

    if (configError || !configData?.value) {
      return new Response(
        JSON.stringify({ skipped: true, reason: 'no_config' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const config = configData.value as any

    // 2. Check if automation is active
    if (!config.active) {
      return new Response(
        JSON.stringify({ skipped: true, reason: 'inactive' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const quantity = config.quantity_per_cycle || 100
    const intervalMinutes = config.interval_minutes || 10
    const lastExecution = config.last_execution ? new Date(config.last_execution).getTime() : 0
    const now = Date.now()

    // 3. Check if enough time has elapsed since last execution
    const elapsedMinutes = (now - lastExecution) / 60000
    if (elapsedMinutes < intervalMinutes - 0.5) { // 30 second tolerance
      return new Response(
        JSON.stringify({ 
          skipped: true, 
          reason: 'interval_not_reached', 
          elapsed_minutes: Math.round(elapsedMinutes * 10) / 10,
          interval_minutes: intervalMinutes 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Use the pool user ID (system user for pool PROs)
    const poolUserId = 'b22080a1-ca50-4770-974d-57c9d198a5dd'

    // 5. Generate PROs using the existing RPC (has advisory lock built in)
    console.log(`[auto-generate-pros] Generating ${quantity} PROs (interval: ${intervalMinutes}min)`)

    const { data: genData, error: genError } = await supabase.rpc('generate_pros_batch', {
      p_amount: quantity,
      p_user_id: poolUserId,
    })

    if (genError) {
      console.error('[auto-generate-pros] Generation error:', genError)
      
      // Log the error
      await supabase.from('pro_generation_logs').insert({
        execution_type: 'automatic',
        quantity_generated: 0,
        quantity_requested: quantity,
        config_quantity_per_cycle: quantity,
        config_interval_minutes: intervalMinutes,
        executed_by: config.started_by || null,
        status: 'error',
        error_message: genError.message,
        cumulative_total: config.total_generated || 0,
      })

      // Update config with error info but keep active
      await supabase.from('site_settings').update({
        value: {
          ...config,
          last_execution: new Date().toISOString(),
          last_error: genError.message,
        },
      }).eq('key', 'auto_gen_config')

      return new Response(
        JSON.stringify({ error: genError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = genData?.[0]
    const generated = result?.total_generated ?? quantity
    const newTotal = (config.total_generated || 0) + generated

    // 6. Log successful execution
    await supabase.from('pro_generation_logs').insert({
      execution_type: 'automatic',
      quantity_generated: generated,
      quantity_requested: quantity,
      first_position: result?.first_position,
      last_position: result?.last_position,
      config_quantity_per_cycle: quantity,
      config_interval_minutes: intervalMinutes,
      executed_by: config.started_by || null,
      status: 'success',
      cumulative_total: newTotal,
    })

    // 7. Update config with new totals and last execution time
    await supabase.from('site_settings').update({
      value: {
        ...config,
        total_generated: newTotal,
        last_execution: new Date().toISOString(),
        last_error: null,
      },
    }).eq('key', 'auto_gen_config')

    console.log(`[auto-generate-pros] Success: ${generated} PROs generated. Cumulative: ${newTotal}`)

    return new Response(
      JSON.stringify({
        success: true,
        generated,
        cumulative_total: newTotal,
        first_position: result?.first_position,
        last_position: result?.last_position,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[auto-generate-pros] Unhandled error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
