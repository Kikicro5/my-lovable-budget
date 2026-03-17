import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// ── Google Play Developer API helpers ──

async function getGoogleAccessToken(): Promise<string> {
  const raw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not configured');

  const sa = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);

  // Build JWT header + claims
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const enc = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const unsignedToken = `${enc(header)}.${enc(claims)}`;

  // Import the RSA private key and sign
  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const keyData = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken),
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${unsignedToken}.${sig}`;

  // Exchange JWT for access token
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Google token exchange failed: ${resp.status} ${text}`);
  }

  const tokenData = await resp.json();
  return tokenData.access_token;
}

interface SubscriptionPurchase {
  expiryTimeMillis?: string;
  paymentState?: number;
  cancelReason?: number;
  orderId?: string;
}

async function verifySubscription(
  packageName: string,
  subscriptionId: string,
  purchaseToken: string,
): Promise<SubscriptionPurchase> {
  const accessToken = await getGoogleAccessToken();

  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Google Play API error ${resp.status}: ${text}`);
  }

  return resp.json();
}

// ── Main handler ──

const PACKAGE_NAME = 'app.lovable.budgetcard.twa';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const body = await req.json();
    const { action } = body;

    // ── verify-purchase: verify with Google then save ──
    if (action === 'verify-purchase') {
      const { purchaseToken, productId, deviceId } = body;
      if (!purchaseToken || !productId) {
        return json({ error: 'Missing purchaseToken or productId' }, 400);
      }

      // Get authenticated user if available
      let userId: string | null = null;
      let email: string | null = null;
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await adminClient.auth.getUser(token);
        if (user) {
          userId = user.id;
          email = user.email || null;
        }
      }

      // ── Verify purchase with Google Play Developer API ──
      console.log('Verifying purchase with Google Play API:', { productId, deviceId });
      let subscriptionData: SubscriptionPurchase;
      try {
        subscriptionData = await verifySubscription(PACKAGE_NAME, productId, purchaseToken);
        console.log('Google Play API response:', JSON.stringify(subscriptionData));
      } catch (apiErr) {
        console.error('Google Play API verification failed:', apiErr);
        return json({
          error: 'Purchase verification failed',
          detail: apiErr instanceof Error ? apiErr.message : String(apiErr),
        }, 400);
      }

      // Check that the subscription is valid
      const expiryMs = Number(subscriptionData.expiryTimeMillis || 0);
      if (!expiryMs || expiryMs < Date.now()) {
        return json({ error: 'Subscription expired or invalid', expiryMs }, 400);
      }

      const validUntil = new Date(expiryMs);

      // Save to google_play_purchases
      const { error: insertErr } = await adminClient
        .from('google_play_purchases')
        .insert({
          user_id: userId || '00000000-0000-0000-0000-000000000000',
          device_id: deviceId || 'android',
          product_id: productId,
          purchase_token: purchaseToken,
          valid_until: validUntil.toISOString(),
          is_active: true,
        });

      if (insertErr) {
        console.error('Failed to save purchase:', insertErr);
        return json({ error: 'Failed to save purchase' }, 500);
      }

      // Also create activation record for backward compatibility
      const code = `GP_${Date.now().toString(36).toUpperCase()}`;
      const codeExpiresAt = new Date(expiryMs);
      codeExpiresAt.setFullYear(codeExpiresAt.getFullYear() + 1);

      const { data: codeData } = await adminClient
        .from('activation_codes')
        .insert({
          code,
          max_uses: 1,
          current_uses: 1,
          expires_at: codeExpiresAt.toISOString(),
          note: `Google Play: ${productId} | Order: ${subscriptionData.orderId || 'N/A'}`,
        })
        .select()
        .single();

      if (codeData) {
        await adminClient.from('activations').insert({
          code_id: codeData.id,
          user_id: userId || '00000000-0000-0000-0000-000000000000',
          email: email || `device:${deviceId || 'unknown'}`,
          device_id: deviceId || 'android',
          valid_until: validUntil.toISOString(),
        });
      }

      console.log('Purchase verified and saved:', {
        productId, deviceId, userId,
        validUntil: validUntil.toISOString(),
        orderId: subscriptionData.orderId,
      });

      return json({
        success: true,
        valid: true,
        expiresAt: validUntil.toISOString(),
        activationCode: code,
        orderId: subscriptionData.orderId,
      });
    }

    // ── check-subscription: check if device has active purchase ──
    if (action === 'check-subscription') {
      const { deviceId } = body;
      if (!deviceId) return json({ error: 'Missing deviceId' }, 400);

      // Check google_play_purchases first
      const { data: purchases } = await adminClient
        .from('google_play_purchases')
        .select('valid_until, is_active')
        .eq('device_id', deviceId)
        .eq('is_active', true)
        .order('valid_until', { ascending: false })
        .limit(1);

      if (purchases?.length && new Date(purchases[0].valid_until) > new Date()) {
        return json({
          isPremium: true,
          expiresAt: purchases[0].valid_until,
        });
      }

      // Fallback: check activations table
      const { data: activations } = await adminClient
        .from('activations')
        .select('valid_until')
        .eq('device_id', deviceId)
        .order('valid_until', { ascending: false })
        .limit(1);

      const active = activations?.find(a => new Date(a.valid_until) > new Date());

      return json({
        isPremium: !!active,
        expiresAt: active?.valid_until || null,
      });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('verify-google-purchase error:', error);
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
});
