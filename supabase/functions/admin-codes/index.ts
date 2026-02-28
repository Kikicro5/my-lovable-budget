import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function generateCode(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => chars[b % chars.length]).join('');
}

async function verifyAdmin(authHeader: string): Promise<{ userId: string } | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error } = await supabase.auth.getClaims(token);
  if (error || !claimsData?.claims) return null;

  const userId = claimsData.claims.sub as string;

  // Check admin role using service role
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, serviceKey);

  const { data: roleData } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  if (!roleData) return null;
  return { userId };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = await verifyAdmin(authHeader);
    if (!admin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    if (req.method === 'GET') {
      // List all codes with activation counts
      const { data: codes, error } = await adminClient
        .from('activation_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch codes' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Get activations for all codes
      const codeIds = (codes || []).map(c => c.id);
      let activations: any[] = [];
      if (codeIds.length > 0) {
        const { data } = await adminClient
          .from('activations')
          .select('id, code_id, email, device_id, valid_until, created_at')
          .in('code_id', codeIds)
          .order('created_at', { ascending: false });
        activations = data || [];
      }

      // Group activations by code
      const activationsByCode: Record<string, any[]> = {};
      for (const a of activations) {
        if (!activationsByCode[a.code_id]) activationsByCode[a.code_id] = [];
        activationsByCode[a.code_id].push(a);
      }

      const result = (codes || []).map(c => ({
        ...c,
        activations: activationsByCode[c.id] || [],
      }));

      return new Response(JSON.stringify({ codes: result }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { maxUses, expiresAt, note, count } = body;

      if (!maxUses || !expiresAt) {
        return new Response(JSON.stringify({ error: 'Missing maxUses or expiresAt' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const numMaxUses = parseInt(maxUses);
      if (isNaN(numMaxUses) || numMaxUses < 1 || numMaxUses > 10000) {
        return new Response(JSON.stringify({ error: 'maxUses must be between 1 and 10000' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const expDate = new Date(expiresAt);
      if (isNaN(expDate.getTime()) || expDate <= new Date()) {
        return new Response(JSON.stringify({ error: 'expiresAt must be a future date' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const numCodes = Math.min(Math.max(parseInt(count) || 1, 1), 100);
      const newCodes = [];

      for (let i = 0; i < numCodes; i++) {
        const code = generateCode();
        newCodes.push({
          code,
          max_uses: numMaxUses,
          expires_at: expDate.toISOString(),
          created_by: admin.userId,
          note: typeof note === 'string' ? note.slice(0, 200) : null,
        });
      }

      const { data, error } = await adminClient
        .from('activation_codes')
        .insert(newCodes)
        .select();

      if (error) {
        console.error('Insert error:', error);
        return new Response(JSON.stringify({ error: 'Failed to create codes' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ codes: data }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Admin codes error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
