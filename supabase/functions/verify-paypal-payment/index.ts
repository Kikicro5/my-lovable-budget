import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYPAL_API_URL = Deno.env.get('PAYPAL_MODE') === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const secret = Deno.env.get('PAYPAL_SECRET');
  
  if (!clientId || !secret) {
    throw new Error('PayPal credentials not configured');
  }

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

async function capturePayPalOrder(orderId: string, accessToken: string) {
  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal capture error:', errorText);
    throw new Error('Failed to capture PayPal order');
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, deviceId } = await req.json();

    if (!orderId || !deviceId) {
      return new Response(
        JSON.stringify({ error: 'Missing orderId or deviceId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verifying PayPal order: ${orderId} for device: ${deviceId}`);

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Capture the order
    const captureResult = await capturePayPalOrder(orderId, accessToken);
    
    console.log('PayPal capture result:', JSON.stringify(captureResult));

    if (captureResult.status !== 'COMPLETED') {
      return new Response(
        JSON.stringify({ error: 'Payment not completed', status: captureResult.status }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract payment details
    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    const amount = parseFloat(capture?.amount?.value || '0');
    const currency = capture?.amount?.currency_code || 'EUR';

    // Calculate expiration date (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Save purchase to database using service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      return new Response(
        JSON.stringify({ error: 'Failed to save purchase' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Purchase saved successfully:', data);

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
