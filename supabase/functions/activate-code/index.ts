import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const userId = claimsData.claims.sub;
    const email = claimsData.claims.email as string;

    const { code, deviceId } = await req.json();
    if (!code || !deviceId) {
      return new Response(JSON.stringify({ error: 'Missing code or deviceId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Find the code
    const { data: codeData, error: codeError } = await adminClient
      .from('activation_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single();

    if (codeError || !codeData) {
      return new Response(JSON.stringify({ error: 'Nevažeći kod' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check expiry
    if (new Date(codeData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Kod je istekao' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check max uses
    if (codeData.current_uses >= codeData.max_uses) {
      return new Response(JSON.stringify({ error: 'Kod je već iskorišten maksimalan broj puta' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check if user already activated this code
    const { data: existingActivation } = await adminClient
      .from('activations')
      .select('id')
      .eq('code_id', codeData.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingActivation) {
      return new Response(JSON.stringify({ error: 'Već ste aktivirali ovaj kod' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Calculate valid_until (1 year from now)
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    // Create activation
    const { error: insertError } = await adminClient
      .from('activations')
      .insert({
        code_id: codeData.id,
        user_id: userId,
        email,
        device_id: deviceId,
        valid_until: validUntil.toISOString(),
      });

    if (insertError) {
      console.error('Insert activation error:', insertError);
      return new Response(JSON.stringify({ error: 'Greška pri aktivaciji' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Increment current_uses
    await adminClient
      .from('activation_codes')
      .update({ current_uses: codeData.current_uses + 1 })
      .eq('id', codeData.id);

    return new Response(JSON.stringify({
      success: true,
      validUntil: validUntil.toISOString(),
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Activate code error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
