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
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
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

async function getPayPalSubscription(subscriptionId: string, accessToken: string) {
  const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal subscription fetch error:', errorText);
    throw new Error('Failed to fetch PayPal subscription');
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
    const { subscriptionId, deviceToken } = await req.json();

    // Validate subscriptionId format (PayPal subscription IDs look like I-XXXXXXXXXX)
    if (!subscriptionId || typeof subscriptionId !== 'string' ||
        subscriptionId.length < 5 || subscriptionId.length > 100 ||
        !/^[A-Z0-9-_]+$/i.test(subscriptionId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid subscription ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify device token
    const signingSecret = Deno.env.get('DEVICE_SIGNING_SECRET') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const { valid, deviceId } = await verifyDeviceToken(deviceToken, signingSecret);

    if (!valid || !deviceId) {
      return new Response(
        JSON.stringify({ error: 'Invalid device token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing subscription verification');

    const accessToken = await getPayPalAccessToken();
    const subscription = await getPayPalSubscription(subscriptionId, accessToken);

    console.log('Subscription status:', subscription.status);

    // PayPal subscriptions may not be ACTIVE immediately after approval
    // APPROVED means payment was authorized but not yet captured
    const validStatuses = ['ACTIVE', 'APPROVED'];
    if (!validStatuses.includes(subscription.status)) {
      return new Response(
        JSON.stringify({ error: 'Subscription not active', status: subscription.status }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use next_billing_time as expires_at, or fall back to 1 year from now
    let expiresAt: Date;
    if (subscription.billing_info?.next_billing_time) {
      expiresAt = new Date(subscription.billing_info.next_billing_time);
      // Add a small buffer (1 day) so there's no gap on renewal
      expiresAt.setDate(expiresAt.getDate() + 1);
    } else {
      expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const amount = parseFloat(subscription.billing_info?.last_payment?.amount?.value || '2.99');
    const currency = subscription.billing_info?.last_payment?.amount?.currency_code || 'EUR';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('ad_free_purchases')
      .upsert({
        device_id: deviceId,
        paypal_order_id: subscriptionId,
        amount,
        currency,
        purchased_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'device_id' })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save purchase' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Subscription saved successfully');

    return new Response(
      JSON.stringify({ success: true, purchase: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
