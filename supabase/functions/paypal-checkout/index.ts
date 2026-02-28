import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PAYPAL_API_URL = Deno.env.get('PAYPAL_MODE') === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const secret = Deno.env.get('PAYPAL_SECRET');
  if (!clientId || !secret) throw new Error('PayPal credentials not configured');

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${clientId}:${secret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('PayPal auth error:', err);
    throw new Error('Failed to get PayPal access token');
  }
  return (await response.json()).access_token;
}

function generateRandomCode(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid request body' }, 400);
    }
    const { action } = body;

    // ── get-config: return PayPal client ID + prices (no auth needed) ──
    if (action === 'get-config') {
      const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
      const mode = Deno.env.get('PAYPAL_MODE') || 'sandbox';
      const { data: prices } = await adminClient
        .from('premium_settings')
        .select('*')
        .order('duration_days', { ascending: true });

      return json({ clientId, mode, prices: prices || [] });
    }

    // ── All other actions require auth ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await adminClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const userId = claimsData.claims.sub;
    const email = claimsData.claims.email as string;

    // ── create-order ──
    if (action === 'create-order') {
      const { priceId } = body;
      if (!priceId) return json({ error: 'Missing priceId' }, 400);

      const { data: price } = await adminClient
        .from('premium_settings')
        .select('*')
        .eq('id', priceId)
        .single();

      if (!price) return json({ error: 'Invalid price tier' }, 400);

      const accessToken = await getPayPalAccessToken();
      const orderRes = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: price.currency,
              value: price.price.toFixed(2),
            },
            description: `BudgetCard Premium - ${price.duration_days} dana`,
          }],
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.text();
        console.error('PayPal create order error:', err);
        return json({ error: 'Failed to create PayPal order' }, 500);
      }

      const order = await orderRes.json();
      return json({ orderId: order.id });
    }

    // ── capture-order ──
    if (action === 'capture-order') {
      const { orderId, priceId, deviceId } = body;
      if (!orderId || !priceId) return json({ error: 'Missing orderId or priceId' }, 400);

      const { data: price } = await adminClient
        .from('premium_settings')
        .select('*')
        .eq('id', priceId)
        .single();

      if (!price) return json({ error: 'Invalid price tier' }, 400);

      // Capture payment
      const accessToken = await getPayPalAccessToken();
      const captureRes = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!captureRes.ok) {
        const err = await captureRes.text();
        console.error('PayPal capture error:', err);
        return json({ error: 'Failed to capture payment' }, 500);
      }

      const captureData = await captureRes.json();
      if (captureData.status !== 'COMPLETED') {
        return json({ error: 'Payment not completed' }, 400);
      }

      // Generate activation code
      const code = generateRandomCode();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 2); // code expires in 2 years

      const { data: codeData, error: codeErr } = await adminClient
        .from('activation_codes')
        .insert({
          code,
          max_uses: 1,
          current_uses: 1,
          expires_at: expiresAt.toISOString(),
          note: `PayPal kupnja: ${orderId}`,
        })
        .select()
        .single();

      if (codeErr || !codeData) {
        console.error('Code generation error:', codeErr);
        return json({ error: 'Payment captured but code generation failed' }, 500);
      }

      // Create activation
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + price.duration_days);

      const { error: activationErr } = await adminClient
        .from('activations')
        .insert({
          code_id: codeData.id,
          user_id: userId,
          email,
          device_id: deviceId || 'web',
          valid_until: validUntil.toISOString(),
        });

      if (activationErr) {
        console.error('Activation error:', activationErr);
        return json({ error: 'Payment captured but activation failed. Contact support.' }, 500);
      }

      console.log('PayPal purchase completed and premium activated');

      return json({
        success: true,
        code,
        validUntil: validUntil.toISOString(),
        durationDays: price.duration_days,
      });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('PayPal checkout error:', error);
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
});
