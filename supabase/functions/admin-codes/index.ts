import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const adminClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

function generateRandomCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function verifyAdmin(authHeader: string): Promise<{ userId: string } | null> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) return null;

  const userId = data.claims.sub;
  
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
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'list-codes': {
        const { data, error } = await adminClient
          .from('activation_codes')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ codes: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'generate-codes': {
        const { count, maxUses, expiresAt } = params;
        const num = Math.min(Math.max(parseInt(count) || 1, 1), 100);
        const codes: any[] = [];
        
        for (let i = 0; i < num; i++) {
          const code = generateRandomCode(10);
          const { data, error } = await adminClient
            .from('activation_codes')
            .insert({
              code,
              max_uses: maxUses || 1,
              expires_at: expiresAt,
              created_by: admin.userId,
              note: null,
            })
            .select()
            .single();
          if (error) throw error;
          codes.push(data);
        }
        
        return new Response(JSON.stringify({ codes }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'create-code': {
        const { code, maxUses, expiresAt, note } = params;
        const { data, error } = await adminClient
          .from('activation_codes')
          .insert({
            code: code.toUpperCase(),
            max_uses: maxUses || 1,
            expires_at: expiresAt,
            created_by: admin.userId,
            note: note || null,
          })
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ code: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'delete-code': {
        const { codeId } = params;
        await adminClient.from('activations').delete().eq('code_id', codeId);
        const { error } = await adminClient.from('activation_codes').delete().eq('id', codeId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'list-users': {
        const { data: { users }, error } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
        if (error) throw error;
        
        const { data: activations } = await adminClient
          .from('activations')
          .select('user_id, valid_until, email')
          .order('valid_until', { ascending: false });

        const { data: roles } = await adminClient
          .from('user_roles')
          .select('user_id, role');

        const now = new Date();
        const usersWithStatus = users.map(u => {
          const userActivations = activations?.filter(a => a.user_id === u.id) || [];
          const activeActivation = userActivations.find(a => new Date(a.valid_until) > now);
          const userRole = roles?.find(r => r.user_id === u.id);
          return {
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at || null,
            isPremium: !!activeActivation,
            premiumUntil: activeActivation?.valid_until || null,
            role: userRole?.role || 'user',
          };
        });

        return new Response(JSON.stringify({ users: usersWithStatus }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'delete-user': {
        const { userId } = params;
        const { error } = await adminClient.auth.admin.deleteUser(userId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'deactivate-premium': {
        const { userId } = params;
        await adminClient
          .from('activations')
          .update({ valid_until: new Date().toISOString() })
          .eq('user_id', userId);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get-prices': {
        const { data, error } = await adminClient
          .from('premium_settings')
          .select('*')
          .order('duration_days', { ascending: true });
        if (error) throw error;
        return new Response(JSON.stringify({ prices: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'update-prices': {
        const { prices } = params;
        for (const p of prices) {
          await adminClient
            .from('premium_settings')
            .upsert({ id: p.id, price: p.price, duration_days: p.duration_days, currency: p.currency || 'EUR' });
        }
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'list-activations': {
        const { data, error } = await adminClient
          .from('activations')
          .select('*, activation_codes(code, note)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ activations: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('Admin error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
