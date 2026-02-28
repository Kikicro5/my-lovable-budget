import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    const { code, deviceId } = await req.json();
    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid code' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!deviceId || typeof deviceId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid deviceId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate code format (max 50 chars, alphanumeric + dashes)
    if (code.length > 50 || !/^[A-Za-z0-9\-]+$/.test(code)) {
      return new Response(JSON.stringify({ error: 'Invalid code format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Find the code
    const { data: codeData, error: codeError } = await adminClient
      .from('activation_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single();

    if (codeError || !codeData) {
      return new Response(JSON.stringify({ error: 'Invalid code' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (new Date(codeData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Code expired' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (codeData.current_uses >= codeData.max_uses) {
      return new Response(JSON.stringify({ error: 'Code fully used' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check if already activated
    const { data: existing } = await adminClient
      .from('activations')
      .select('id')
      .eq('code_id', codeData.id)
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: 'Already activated on this device' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get duration from settings
    const { data: settings } = await adminClient
      .from('premium_settings')
      .select('duration_days')
      .eq('id', 'default')
      .single();

    const durationDays = settings?.duration_days || 365;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + durationDays);

    // Create activation
    const { error: insertError } = await adminClient
      .from('activations')
      .insert({
        code_id: codeData.id,
        user_id: userId,
        email: userEmail,
        device_id: deviceId,
        valid_until: validUntil.toISOString(),
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Activation failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Increment uses
    await adminClient
      .from('activation_codes')
      .update({ current_uses: codeData.current_uses + 1 })
      .eq('id', codeData.id);

    return new Response(JSON.stringify({ 
      success: true, 
      valid_until: validUntil.toISOString(),
      duration_days: durationDays,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Activation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
