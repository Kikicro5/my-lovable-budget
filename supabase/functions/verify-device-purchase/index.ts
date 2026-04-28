import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyDeviceToken } from "../_shared/device-verification.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({ isAdFree: true, purchase: null, purchases: [], billingDisabled: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { deviceToken } = body;

    if (!deviceToken) {
      return new Response(
        JSON.stringify({ error: 'Missing device token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const signingSecret = Deno.env.get('DEVICE_SIGNING_SECRET') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const { valid, deviceId } = await verifyDeviceToken(deviceToken, signingSecret);

    if (!valid || !deviceId) {
      return new Response(
        JSON.stringify({ error: 'Invalid device token', isAdFree: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('ad_free_purchases')
      .select('id, expires_at, purchased_at, amount, currency, paypal_order_id')
      .eq('device_id', deviceId)
      .order('purchased_at', { ascending: false });

    if (error) {
      console.error('Database query error:', error.message);
      return new Response(
        JSON.stringify({ error: 'Failed to check purchase status', isAdFree: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ isAdFree: false, purchase: null, purchases: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const activePurchase = data.find(p => new Date(p.expires_at) > now);
    const isActive = !!activePurchase;

    return new Response(
      JSON.stringify({ 
        isAdFree: isActive, 
        purchase: activePurchase || null,
        purchases: data
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Verification error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', isAdFree: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
