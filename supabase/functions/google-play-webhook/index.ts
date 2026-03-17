import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const PACKAGE_NAME = 'app.lovable.budgetcard.twa';

// ── Google OAuth helpers (reused from verify-google-purchase) ──

async function getGoogleAccessToken(): Promise<string> {
  const raw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not configured');

  const sa = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);

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

  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const keyData = Uint8Array.from(atob(pemBody), (c: string) => c.charCodeAt(0));

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

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Google token exchange failed: ${resp.status} ${text}`);
  }

  return (await resp.json()).access_token;
}

async function getSubscriptionDetails(subscriptionId: string, purchaseToken: string) {
  const accessToken = await getGoogleAccessToken();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Google Play API error ${resp.status}: ${text}`);
  }

  return resp.json();
}

// ── Notification type mapping ──
// https://developer.android.com/google/play/billing/rtdn-reference

const NOTIFICATION_TYPES: Record<number, string> = {
  1: 'SUBSCRIPTION_RECOVERED',
  2: 'SUBSCRIPTION_RENEWED',
  3: 'SUBSCRIPTION_CANCELED',
  4: 'SUBSCRIPTION_PURCHASED',
  5: 'SUBSCRIPTION_ON_HOLD',
  6: 'SUBSCRIPTION_IN_GRACE_PERIOD',
  7: 'SUBSCRIPTION_RESTARTED',
  8: 'SUBSCRIPTION_PRICE_CHANGE_CONFIRMED',
  9: 'SUBSCRIPTION_DEFERRED',
  10: 'SUBSCRIPTION_PAUSED',
  11: 'SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED',
  12: 'SUBSCRIPTION_REVOKED',
  13: 'SUBSCRIPTION_EXPIRED',
};

// ── Main handler ──

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
    // Google sends RTDN as a Pub/Sub push message
    const body = await req.json();
    console.log('RTDN webhook received:', JSON.stringify(body));

    // Pub/Sub wraps the data in message.data as base64
    const messageData = body?.message?.data;
    if (!messageData) {
      console.log('No message.data in payload, ignoring');
      return json({ ok: true });
    }

    const decoded = JSON.parse(atob(messageData));
    console.log('Decoded RTDN:', JSON.stringify(decoded));

    const notification = decoded.subscriptionNotification;
    if (!notification) {
      console.log('No subscriptionNotification, might be a test or voided purchase notification');
      return json({ ok: true });
    }

    const { notificationType, purchaseToken, subscriptionId } = notification;
    const typeName = NOTIFICATION_TYPES[notificationType] || `UNKNOWN_${notificationType}`;
    console.log(`Processing ${typeName} for subscription ${subscriptionId}`);

    // Look up existing purchase by token
    const { data: existingPurchases } = await adminClient
      .from('google_play_purchases')
      .select('*')
      .eq('purchase_token', purchaseToken)
      .limit(1);

    const existing = existingPurchases?.[0];

    // Handle based on notification type
    switch (notificationType) {
      // ── Active/renewed states ──
      case 1:  // RECOVERED
      case 2:  // RENEWED
      case 4:  // PURCHASED
      case 7: { // RESTARTED
        // Fetch latest subscription details from Google
        let subDetails;
        try {
          subDetails = await getSubscriptionDetails(subscriptionId, purchaseToken);
          console.log('Subscription details:', JSON.stringify(subDetails));
        } catch (err) {
          console.error('Failed to fetch subscription details:', err);
          return json({ ok: true }); // Acknowledge to avoid retries
        }

        const expiryMs = Number(subDetails.expiryTimeMillis || 0);
        const validUntil = expiryMs ? new Date(expiryMs).toISOString() : new Date(Date.now() + 365 * 86400000).toISOString();

        if (existing) {
          // Update existing record
          await adminClient
            .from('google_play_purchases')
            .update({
              valid_until: validUntil,
              is_active: true,
            })
            .eq('id', existing.id);

          console.log(`Updated purchase ${existing.id}: valid_until=${validUntil}, is_active=true`);

          // Also update activation record
          await adminClient
            .from('activations')
            .update({ valid_until: validUntil })
            .eq('device_id', existing.device_id)
            .gte('valid_until', new Date(Date.now() - 90 * 86400000).toISOString());
        } else if (notificationType === 4) {
          // New purchase - create record (should rarely happen if client already called verify-purchase)
          console.log('New purchase via webhook, creating record');
          await adminClient
            .from('google_play_purchases')
            .insert({
              user_id: '00000000-0000-0000-0000-000000000000',
              device_id: 'webhook',
              product_id: subscriptionId,
              purchase_token: purchaseToken,
              valid_until: validUntil,
              is_active: true,
            });
        }
        break;
      }

      // ── Canceled / expired / revoked ──
      case 3:   // CANCELED
      case 12:  // REVOKED
      case 13: { // EXPIRED
        if (existing) {
          const isActive = notificationType === 3; // Canceled keeps access until expiry
          await adminClient
            .from('google_play_purchases')
            .update({ is_active: isActive })
            .eq('id', existing.id);

          console.log(`${typeName}: purchase ${existing.id}, is_active=${isActive}`);
        }
        break;
      }

      // ── Hold / grace / paused ──
      case 5:  // ON_HOLD
      case 10: { // PAUSED
        if (existing) {
          await adminClient
            .from('google_play_purchases')
            .update({ is_active: false })
            .eq('id', existing.id);

          console.log(`${typeName}: purchase ${existing.id} set inactive`);
        }
        break;
      }

      case 6: { // IN_GRACE_PERIOD - still active
        console.log(`Grace period for token ${purchaseToken}, keeping active`);
        break;
      }

      default:
        console.log(`Unhandled notification type ${notificationType} (${typeName})`);
    }

    // Always return 200 to acknowledge the Pub/Sub message
    return json({ ok: true, type: typeName });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 even on error to prevent Pub/Sub retries for malformed messages
    return json({ ok: true, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});
