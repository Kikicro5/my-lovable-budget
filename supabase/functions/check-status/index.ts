import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
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

    // Use service role to check activations
    const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Check global billing flag — if billing is disabled, everyone is premium
    const { data: billingSetting } = await adminClient
      .from('app_settings')
      .select('value')
      .eq('key', 'premium_billing_enabled')
      .maybeSingle();
    const billingEnabled = billingSetting?.value !== false;
    if (!billingEnabled) {
      return new Response(JSON.stringify({
        isPremium: true,
        expiresAt: null,
        activations: [],
        billingDisabled: true,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check activations for this user
    const { data: activations } = await adminClient
      .from('activations')
      .select('id, valid_until, code_id, device_id, created_at')
      .or(`user_id.eq.${userId},email.eq.${email}`)
      .order('valid_until', { ascending: false });

    const now = new Date();
    const activeActivation = activations?.find(a => new Date(a.valid_until) > now);

    // Also check ad_free_purchases by device_id from body
    const body = await req.json().catch(() => ({}));
    let activePurchase = null;
    if (body.deviceId) {
      const { data: purchases } = await adminClient
        .from('ad_free_purchases')
        .select('id, expires_at, purchased_at, amount, currency')
        .eq('device_id', body.deviceId)
        .order('expires_at', { ascending: false });
      activePurchase = purchases?.find(p => new Date(p.expires_at) > now);
    }

    const isPremium = !!activeActivation || !!activePurchase;
    const expiresAt = activeActivation?.valid_until || activePurchase?.expires_at || null;

    return new Response(JSON.stringify({
      isPremium,
      expiresAt,
      activations: activations || [],
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Check status error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
