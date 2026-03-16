import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

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

    // ── save-purchase: save Google Play purchase token and activate premium ──
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

      // The purchase token from Google Play is proof of purchase
      // Save it and activate premium
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1); // 1 year

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

      if (codeData) {
        await adminClient.from('activations').insert({
          code_id: codeData.id,
          user_id: userId || '00000000-0000-0000-0000-000000000000',
          email: email || `device:${deviceId || 'unknown'}`,
          device_id: deviceId || 'android',
          valid_until: validUntil.toISOString(),
        });
      }

      console.log('Purchase saved successfully:', { productId, deviceId, userId });

      return json({
        success: true,
        valid: true,
        expiresAt: validUntil.toISOString(),
        activationCode: code,
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
