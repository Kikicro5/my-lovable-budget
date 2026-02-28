import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyDeviceToken } from "../_shared/device-verification.ts";

const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
});

const PAYPAL_API_URL = Deno.env.get('PAYPAL_MODE') === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const secret = Deno.env.get('PAYPAL_SECRET');
  if (!clientId || !secret) throw new Error('PayPal credentials not configured');

  const auth = btoa(`${clientId}:${secret}`);
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal auth error:', errorText);
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function capturePayPalOrder(orderId: string, accessToken: string) {
  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal capture error:', errorText);
    throw new Error('Failed to capture PayPal order');
  }

  return await response.json();
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, deviceToken, tierId } = await req.json();

    if (!orderId || typeof orderId !== 'string' || orderId.length < 10 || orderId.length > 100 || !/^[A-Z0-9-]+$/i.test(orderId)) {
      return new Response(JSON.stringify({ error: 'Invalid order ID format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const signingSecret = Deno.env.get('DEVICE_SIGNING_SECRET') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const { valid, deviceId } = await verifyDeviceToken(deviceToken, signingSecret);

    if (!valid || !deviceId) {
      return new Response(JSON.stringify({ error: 'Invalid device token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up tier duration from premium_settings
    let durationDays = 365; // default fallback
    if (tierId) {
      const { data: tier } = await supabase
        .from('premium_settings')
        .select('duration_days, price')
        .eq('id', tierId)
        .single();

      if (tier) {
        durationDays = tier.duration_days;
      }
    }

    console.log('Processing payment verification, tier:', tierId, 'duration:', durationDays);

    const accessToken = await getPayPalAccessToken();
    const captureResult = await capturePayPalOrder(orderId, accessToken);

    if (captureResult.status !== 'COMPLETED') {
      return new Response(JSON.stringify({ error: 'Payment not completed', status: captureResult.status }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    const amount = parseFloat(capture?.amount?.value || '0');
    const currency = capture?.amount?.currency_code || 'EUR';

    // Calculate expiration based on tier duration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const { data, error } = await supabase
      .from('ad_free_purchases')
      .upsert({
        device_id: deviceId,
        paypal_order_id: orderId,
        amount,
        currency,
        purchased_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'device_id' })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ error: 'Failed to save purchase' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Purchase saved successfully, expires:', expiresAt.toISOString());

    return new Response(JSON.stringify({ success: true, purchase: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
