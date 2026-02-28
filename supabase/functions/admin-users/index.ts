import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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
      return json({ error: 'Unauthorized' }, 401);
    }

    const admin = await verifyAdmin(authHeader);
    if (!admin) {
      return json({ error: 'Forbidden' }, 403);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    if (req.method === 'GET') {
      const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      if (usersError) return json({ error: 'Failed to list users' }, 500);

      const { data: activations } = await adminClient
        .from('activations')
        .select('user_id, valid_until')
        .gte('valid_until', new Date().toISOString());

      const { data: prices } = await adminClient
        .from('premium_settings')
        .select('*')
        .order('duration_days', { ascending: true });

      const activeUserIds = new Set((activations || []).map(a => a.user_id));

      const usersList = (users || []).map(u => ({
        id: u.id,
        email: u.email || '',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        isPremium: activeUserIds.has(u.id),
      }));

      return json({ users: usersList, prices: prices || [] });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { action } = body;

      switch (action) {
        case 'delete-user': {
          const { userId } = body;
          if (!userId) return json({ error: 'userId required' }, 400);
          if (userId === admin.userId) return json({ error: 'Cannot delete yourself' }, 400);

          await adminClient.from('activations').delete().eq('user_id', userId);
          await adminClient.from('user_roles').delete().eq('user_id', userId);

          const { error } = await adminClient.auth.admin.deleteUser(userId);
          if (error) return json({ error: 'Failed to delete user' }, 500);

          return json({ success: true });
        }

        case 'deactivate-premium': {
          const { userId } = body;
          if (!userId) return json({ error: 'userId required' }, 400);

          const { error } = await adminClient.from('activations').delete().eq('user_id', userId);
          if (error) return json({ error: 'Failed to deactivate' }, 500);

          return json({ success: true });
        }

        case 'update-prices': {
          const { prices } = body;
          if (!Array.isArray(prices)) return json({ error: 'prices array required' }, 400);

          for (const p of prices) {
            const { error } = await adminClient.from('premium_settings').upsert({
              id: p.id,
              price: parseFloat(p.price),
              duration_days: parseInt(p.duration_days),
              currency: p.currency || 'EUR',
            });
            if (error) {
              console.error('Price update error:', error);
              return json({ error: 'Failed to update prices' }, 500);
            }
          }

          return json({ success: true });
        }

        default:
          return json({ error: 'Unknown action' }, 400);
      }
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Admin users error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
});
