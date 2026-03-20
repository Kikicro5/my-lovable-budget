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
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !user) {
      return json({ error: 'Invalid token' }, 401);
    }

    const userId = user.id;

    // Delete user data from all tables
    await adminClient.from('user_data').delete().eq('user_id', userId);
    await adminClient.from('activations').delete().eq('user_id', userId);
    await adminClient.from('google_play_subscriptions').delete().eq('user_id', userId);
    await adminClient.from('user_roles').delete().eq('user_id', userId);

    // Remove from groups
    const { data: memberships } = await adminClient
      .from('group_members')
      .select('group_id, role')
      .eq('user_id', userId);

    if (memberships) {
      for (const m of memberships) {
        await adminClient.from('group_members').delete().eq('user_id', userId).eq('group_id', m.group_id);
        
        // If user was owner, delete entire group
        if (m.role === 'owner') {
          await adminClient.from('group_data').delete().eq('group_id', m.group_id);
          await adminClient.from('group_members').delete().eq('group_id', m.group_id);
          await adminClient.from('shared_groups').delete().eq('id', m.group_id);
        }
      }
    }

    // Delete auth user (cascades foreign keys)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Delete user error:', deleteError);
      return json({ error: 'Failed to delete account' }, 500);
    }

    return json({ success: true });
  } catch (error) {
    console.error('delete-account error:', error);
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
});
