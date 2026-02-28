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

    // Parse optional deviceId for PayPal check
    let deviceId: string | null = null;
    try {
      const body = await req.json();
      deviceId = body?.deviceId || null;
    } catch {
      // No body is fine
    }

    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    const now = new Date().toISOString();

    // Check code activations
    const { data: activations } = await adminClient
      .from('activations')
      .select('id, valid_until, created_at, email, device_id')
      .eq('user_id', userId)
      .gte('valid_until', now)
      .order('valid_until', { ascending: false })
      .limit(1);

    const hasCodePremium = activations && activations.length > 0;
    const codeActivation = hasCodePremium ? activations[0] : null;

    // Check PayPal purchases (by device_id if provided)
    let hasPaypalPremium = false;
    let paypalPurchase = null;

    if (deviceId) {
      const { data: purchases } = await adminClient
        .from('ad_free_purchases')
        .select('id, expires_at, purchased_at, amount, currency')
        .eq('device_id', deviceId)
        .gte('expires_at', now)
        .order('expires_at', { ascending: false })
        .limit(1);

      if (purchases && purchases.length > 0) {
        hasPaypalPremium = true;
        paypalPurchase = purchases[0];
      }
    }

    const isPremium = hasCodePremium || hasPaypalPremium;

    // Determine the latest expiration
    let validUntil: string | null = null;
    if (codeActivation && paypalPurchase) {
      validUntil = new Date(codeActivation.valid_until) > new Date(paypalPurchase.expires_at)
        ? codeActivation.valid_until
        : paypalPurchase.expires_at;
    } else if (codeActivation) {
      validUntil = codeActivation.valid_until;
    } else if (paypalPurchase) {
      validUntil = paypalPurchase.expires_at;
    }

    return new Response(JSON.stringify({
      isPremium,
      validUntil,
      source: hasCodePremium ? 'code' : hasPaypalPremium ? 'paypal' : null,
      codeActivation,
      paypalPurchase,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Check status error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
