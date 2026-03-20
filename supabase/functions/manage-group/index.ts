import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const adminClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getUser(authHeader: string): Promise<{ id: string; email: string } | null> {
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await adminClient.auth.getUser(token);
  if (error || !user) return null;
  return { id: user.id, email: user.email || '' };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const user = await getUser(authHeader);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let body;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, ...params } = body;
    const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    switch (action) {
      case 'create': {
        // Check if user already owns a group
        const { data: existing } = await adminClient
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id)
          .limit(1);

        if (existing && existing.length > 0) {
          return new Response(JSON.stringify({ error: 'Već ste član grupe. Napustite trenutnu grupu prije kreiranja nove.' }), {
            status: 400, headers: jsonHeaders
          });
        }

        const inviteCode = generateInviteCode();
        const groupName = params.name || 'Moja grupa';

        const { data: group, error: groupErr } = await adminClient
          .from('shared_groups')
          .insert({ invite_code: inviteCode, name: groupName, created_by: user.id })
          .select()
          .single();

        if (groupErr) throw groupErr;

        // Add creator as owner
        await adminClient
          .from('group_members')
          .insert({ group_id: group.id, user_id: user.id, role: 'owner' });

        // Create group_data entry
        await adminClient
          .from('group_data')
          .insert({ group_id: group.id, data: {} });

        return new Response(JSON.stringify({ group }), { headers: jsonHeaders });
      }

      case 'join': {
        const { inviteCode } = params;
        if (!inviteCode || inviteCode.length < 4) {
          return new Response(JSON.stringify({ error: 'Neispravan kod' }), {
            status: 400, headers: jsonHeaders
          });
        }

        // Check if user already in a group
        const { data: existingMembership } = await adminClient
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id)
          .limit(1);

        if (existingMembership && existingMembership.length > 0) {
          return new Response(JSON.stringify({ error: 'Već ste član grupe. Napustite trenutnu grupu prije pridruživanja.' }), {
            status: 400, headers: jsonHeaders
          });
        }

        // Find group by invite code
        const { data: group, error: findErr } = await adminClient
          .from('shared_groups')
          .select('*')
          .eq('invite_code', inviteCode.toUpperCase())
          .maybeSingle();

        if (findErr || !group) {
          return new Response(JSON.stringify({ error: 'Grupa nije pronađena' }), {
            status: 404, headers: jsonHeaders
          });
        }

        // Check member count
        const { count } = await adminClient
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);

        if ((count || 0) >= group.max_members) {
          return new Response(JSON.stringify({ error: 'Grupa je puna' }), {
            status: 400, headers: jsonHeaders
          });
        }

        // Add member
        const { error: joinErr } = await adminClient
          .from('group_members')
          .insert({ group_id: group.id, user_id: user.id, role: 'member' });

        if (joinErr) {
          if (joinErr.code === '23505') {
            return new Response(JSON.stringify({ error: 'Već ste član ove grupe' }), {
              status: 400, headers: jsonHeaders
            });
          }
          throw joinErr;
        }

        return new Response(JSON.stringify({ group }), { headers: jsonHeaders });
      }

      case 'leave': {
        // Find user's membership
        const { data: membership } = await adminClient
          .from('group_members')
          .select('id, group_id, role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!membership) {
          return new Response(JSON.stringify({ error: 'Niste član grupe' }), {
            status: 400, headers: jsonHeaders
          });
        }

        if (membership.role === 'owner') {
          // Owner leaving = delete entire group
          await adminClient.from('group_data').delete().eq('group_id', membership.group_id);
          await adminClient.from('group_members').delete().eq('group_id', membership.group_id);
          await adminClient.from('shared_groups').delete().eq('id', membership.group_id);
        } else {
          await adminClient.from('group_members').delete().eq('id', membership.id);
        }

        return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
      }

      case 'info': {
        // Get user's group info with members
        const { data: membership } = await adminClient
          .from('group_members')
          .select('group_id, role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!membership) {
          return new Response(JSON.stringify({ group: null }), { headers: jsonHeaders });
        }

        const { data: group } = await adminClient
          .from('shared_groups')
          .select('*')
          .eq('id', membership.group_id)
          .single();

        // Get all members with their emails
        const { data: members } = await adminClient
          .from('group_members')
          .select('user_id, role, joined_at')
          .eq('group_id', membership.group_id);

        // Fetch emails for members
        const membersWithEmail = [];
        for (const m of (members || [])) {
          const { data: { user: u } } = await adminClient.auth.admin.getUserById(m.user_id);
          membersWithEmail.push({
            ...m,
            email: u?.email || 'Unknown',
          });
        }

        return new Response(JSON.stringify({
          group,
          members: membersWithEmail,
          myRole: membership.role,
        }), { headers: jsonHeaders });
      }

      case 'remove-member': {
        const { memberId } = params;
        
        // Check caller is owner
        const { data: callerMembership } = await adminClient
          .from('group_members')
          .select('group_id, role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!callerMembership || callerMembership.role !== 'owner') {
          return new Response(JSON.stringify({ error: 'Samo vlasnik može ukloniti članove' }), {
            status: 403, headers: jsonHeaders
          });
        }

        await adminClient
          .from('group_members')
          .delete()
          .eq('user_id', memberId)
          .eq('group_id', callerMembership.group_id);

        return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400, headers: jsonHeaders
        });
    }
  } catch (error) {
    console.error('Group error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
