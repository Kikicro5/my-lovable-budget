import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// Get Google access token using service account
async function getGoogleAccessToken(): Promise<string> {
  const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
  if (!serviceAccountJson) throw new Error('Google Play service account not configured');

  const sa = JSON.parse(serviceAccountJson);
  
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(String.fromCharCode(...encoder.encode(JSON.stringify(header))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payloadB64 = btoa(String.fromCharCode(...encoder.encode(JSON.stringify(payload))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const signInput = `${headerB64}.${payloadB64}`;

  const pemContents = sa.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const jwt = `${signInput}.${signatureB64}`;

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

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }
    const { action } = body;

    // ── verify-purchase ──
    if (action === 'verify-purchase') {
      const { purchaseToken, productId, deviceId } = body as Record<string, string>;
      if (!purchaseToken || !productId) {
        return json({ error: 'Missing purchaseToken or productId' }, 400);
      }

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

      const packageName = 'app.lovable.budgetcard.twa';
      const subscriptionId = productId;

      try {
        const accessToken = await getGoogleAccessToken();
        
        // Try subscription endpoint first
        let verifyUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;
        let verifyRes = await fetch(verifyUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        let purchaseData: any;
        let isSubscription = true;

        if (!verifyRes.ok) {
          // Try one-time product endpoint
          isSubscription = false;
          verifyUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${subscriptionId}/tokens/${purchaseToken}`;
          verifyRes = await fetch(verifyUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });

          if (!verifyRes.ok) {
            const err = await verifyRes.text();
            console.error('Google Play verify error:', err);
            return json({ error: 'Purchase verification failed', valid: false }, 400);
          }
        }

        purchaseData = await verifyRes.json();
        console.log('Google Play purchase data:', JSON.stringify(purchaseData));

        let validUntil: Date;

        if (isSubscription) {
          const isActive = purchaseData.paymentState === 1 || purchaseData.paymentState === 2;
          const expiryTimeMillis = parseInt(purchaseData.expiryTimeMillis || '0');

          if (!isActive && !purchaseData.autoRenewing) {
            return json({ error: 'Subscription not active', valid: false }, 400);
          }
          validUntil = new Date(expiryTimeMillis);
        } else {
          // One-time purchase: grant 365 days
          if (purchaseData.purchaseState !== 0) {
            return json({ error: 'Purchase not completed', valid: false }, 400);
          }
          validUntil = new Date();
          validUntil.setDate(validUntil.getDate() + 365);
        }

        // Create activation code for tracking
        const code = `GP_${Date.now().toString(36).toUpperCase()}`;
        const codeExpiresAt = new Date();
        codeExpiresAt.setFullYear(codeExpiresAt.getFullYear() + 2);

        const { data: codeData, error: codeErr } = await adminClient
          .from('activation_codes')
          .insert({
            code,
            max_uses: 1,
            current_uses: 1,
            expires_at: codeExpiresAt.toISOString(),
            note: `Google Play: ${productId} | Token: ${purchaseToken.substring(0, 20)}...`,
          })
          .select()
          .single();

        if (codeErr || !codeData) {
          console.error('Code generation error:', codeErr);
          return json({ error: 'Verification succeeded but activation failed' }, 500);
        }

        const { error: activationErr } = await adminClient
          .from('activations')
          .insert({
            code_id: codeData.id,
            user_id: userId || '00000000-0000-0000-0000-000000000000',
            email: email || `device:${deviceId || 'unknown'}`,
            device_id: deviceId || 'android',
            valid_until: validUntil.toISOString(),
          });

        if (activationErr) {
          console.error('Activation error:', activationErr);
          return json({ error: 'Verification succeeded but activation save failed' }, 500);
        }

        return json({
          valid: true,
          success: true,
          expiresAt: validUntil.toISOString(),
          autoRenewing: isSubscription ? (purchaseData.autoRenewing || false) : false,
        });

      } catch (err) {
        console.error('Google Play verification error:', err);
        return json({ error: 'Verification failed', valid: false }, 500);
      }
    }

    // ── check-subscription ──
    if (action === 'check-subscription') {
      const { deviceId } = body as Record<string, string>;
      if (!deviceId) return json({ error: 'Missing deviceId' }, 400);

      const { data: activations } = await adminClient
        .from('activations')
        .select('id, valid_until, device_id, created_at')
        .eq('device_id', deviceId)
        .order('valid_until', { ascending: false });

      const now = new Date();
      const active = activations?.find(a => new Date(a.valid_until) > now);

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
