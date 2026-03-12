import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const PACKAGE_NAME = 'app.lovable.2b913f8ae0084a13b688581953b1b4f7';

// Duration mapping for subscription product IDs
const PRODUCT_DURATION: Record<string, number> = {
  'premium_yearly': 365,
};

async function getGoogleAccessToken(): Promise<string> {
  const serviceAccountJson = Deno.env.get('GOOGLE_PLAY_SERVICE_ACCOUNT');
  if (!serviceAccountJson) throw new Error('Google Play service account not configured');

  const sa = JSON.parse(serviceAccountJson);
  
  // Create JWT for Google OAuth2
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(String.fromCharCode(...encoder.encode(JSON.stringify(header))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const claimsB64 = btoa(String.fromCharCode(...encoder.encode(JSON.stringify(claims))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const signInput = `${headerB64}.${claimsB64}`;

  // Import RSA private key
  const pemContents = sa.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const jwt = `${signInput}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error('Google OAuth error:', err);
    throw new Error('Failed to get Google access token');
  }

  return (await tokenRes.json()).access_token;
}

async function verifySubscription(purchaseToken: string, productId: string): Promise<any> {
  const accessToken = await getGoogleAccessToken();
  
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${purchaseToken}`;

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Google Play verify error:', err);
    throw new Error('Failed to verify purchase');
  }

  return res.json();
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

    const { purchaseToken, productId, deviceId } = body;
    if (!purchaseToken || !productId) {
      return json({ error: 'Missing purchaseToken or productId' }, 400);
    }

    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // Verify with Google
    const purchaseData = await verifySubscription(purchaseToken, productId);

    // Check subscription is active
    const subState = purchaseData.subscriptionState;
    if (subState !== 'SUBSCRIPTION_STATE_ACTIVE' && subState !== 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD') {
      return json({ error: 'Subscription is not active', state: subState }, 400);
    }

    // Calculate expiry from lineItems
    let expiryTimeMs = Date.now() + (365 * 24 * 60 * 60 * 1000); // default 1 year
    if (purchaseData.lineItems?.[0]?.expiryTime) {
      expiryTimeMs = new Date(purchaseData.lineItems[0].expiryTime).getTime();
    }

    const durationDays = PRODUCT_DURATION[productId] || 365;
    const validUntil = new Date(expiryTimeMs);

    // Check if this purchase was already activated
    const orderId = purchaseData.latestOrderId || purchaseToken.substring(0, 20);
    const { data: existing } = await adminClient
      .from('activation_codes')
      .select('id')
      .eq('note', `Google Play: ${orderId}`)
      .maybeSingle();

    if (existing) {
      // Already activated - just return success
      return json({ success: true, alreadyActivated: true, validUntil: validUntil.toISOString(), durationDays });
    }

    // Generate activation code
    const code = generateRandomCode();
    const codeExpiresAt = new Date();
    codeExpiresAt.setFullYear(codeExpiresAt.getFullYear() + 2);

    const { data: codeData, error: codeErr } = await adminClient
      .from('activation_codes')
      .insert({
        code,
        max_uses: 1,
        current_uses: 1,
        expires_at: codeExpiresAt.toISOString(),
        note: `Google Play: ${orderId}`,
      })
      .select()
      .single();

    if (codeErr || !codeData) {
      console.error('Code generation error:', codeErr);
      return json({ error: 'Verification succeeded but activation failed' }, 500);
    }

    // Create activation
    const { error: activationErr } = await adminClient
      .from('activations')
      .insert({
        code_id: codeData.id,
        user_id: user.id,
        email: user.email || '',
        device_id: deviceId || 'android',
        valid_until: validUntil.toISOString(),
      });

    if (activationErr) {
      console.error('Activation error:', activationErr);
      return json({ error: 'Verification succeeded but activation failed. Contact support.' }, 500);
    }

    console.log('Google Play purchase verified and premium activated');

    return json({
      success: true,
      validUntil: validUntil.toISOString(),
      durationDays,
    });
  } catch (error) {
    console.error('Google Play verification error:', error);
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
});
