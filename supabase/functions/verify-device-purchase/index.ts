import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyDeviceToken } from "../_shared/device-verification.ts";

// Allowed origins for CORS
const allowedOrigins = [
  'https://budgetcard.lovable.app',
  'https://id-preview--2b913f8a-e008-4a13-b688-581953b1b4f7.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { deviceToken } = await req.json();

    if (!deviceToken) {
      return new Response(
        JSON.stringify({ error: 'Missing device token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the signed device token
    const signingSecret = Deno.env.get('DEVICE_SIGNING_SECRET') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const { valid, deviceId } = await verifyDeviceToken(deviceToken, signingSecret);

    if (!valid || !deviceId) {
      return new Response(
        JSON.stringify({ error: 'Invalid device token', isAdFree: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query purchase status using service role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('ad_free_purchases')
      .select('id, expires_at, purchased_at')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (error) {
      console.error('Database query error');
      return new Response(
        JSON.stringify({ error: 'Failed to check purchase status', isAdFree: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ isAdFree: false, purchase: null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    const isActive = expiresAt > now;

    return new Response(
      JSON.stringify({ 
        isAdFree: isActive, 
        purchase: {
          id: data.id,
          expires_at: data.expires_at,
          purchased_at: data.purchased_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verification error');
    return new Response(
      JSON.stringify({ error: 'Internal server error', isAdFree: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
