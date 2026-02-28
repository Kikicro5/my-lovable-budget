import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateCode(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const userId = user.id;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Check admin role
    const { data: adminRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (!adminRole) {
      return json({ error: "Admin access required" }, 403);
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      // empty body is fine
    }

    const action = (body.action as string) || "list";

    // ── CODES ──

    if (action === "list") {
      const { data: codes, error } = await adminClient
        .from("activation_codes")
        .select("*, activations(*)")
        .order("created_at", { ascending: false });

      if (error) return json({ error: error.message }, 500);
      return json({ codes });
    }

    if (action === "create") {
      const { max_uses, expires_at, count = 1, note } = body as {
        max_uses: number;
        expires_at: string;
        count?: number;
        note?: string;
      };

      if (!max_uses || !expires_at) {
        return json({ error: "max_uses and expires_at are required" }, 400);
      }

      const codes = [];
      for (let i = 0; i < Math.min(Number(count) || 1, 100); i++) {
        codes.push({
          code: generateCode(),
          max_uses: Number(max_uses),
          expires_at,
          created_by: userId,
          note: typeof note === "string" ? note.slice(0, 200) : null,
        });
      }

      const { data, error } = await adminClient
        .from("activation_codes")
        .insert(codes)
        .select();

      if (error) return json({ error: error.message }, 500);
      return json({ codes: data });
    }

    if (action === "delete") {
      const { id } = body as { id: string };
      if (!id) return json({ error: "id is required" }, 400);

      const { error } = await adminClient
        .from("activation_codes")
        .delete()
        .eq("id", id);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    // ── PRICES ──

    if (action === "get-prices") {
      const { data: prices } = await adminClient
        .from("premium_settings")
        .select("*")
        .order("duration_days", { ascending: true });
      return json({ prices: prices || [] });
    }

    if (action === "update-prices") {
      const { prices } = body as {
        prices: Array<{
          id: string;
          price: number;
          duration_days: number;
          currency?: string;
        }>;
      };
      if (!Array.isArray(prices))
        return json({ error: "prices array required" }, 400);

      for (const p of prices) {
        const { error } = await adminClient.from("premium_settings").upsert({
          id: p.id,
          price: parseFloat(String(p.price)),
          duration_days: parseInt(String(p.duration_days)),
          currency: p.currency || "EUR",
        });
        if (error) return json({ error: "Failed to update prices" }, 500);
      }
      return json({ success: true });
    }

    // ── USERS ──

    if (action === "list-users") {
      const [usersResult, activationsResult, rolesResult] = await Promise.all([
        adminClient.auth.admin.listUsers({ perPage: 1000 }),
        adminClient.from("activations").select("*"),
        adminClient.from("user_roles").select("*"),
      ]);

      if (usersResult.error)
        return json({ error: usersResult.error.message }, 500);

      const roleMap = new Map(
        (rolesResult.data || []).map((r) => [r.user_id, r.role])
      );
      const activationMap = new Map<string, Array<unknown>>();
      for (const a of activationsResult.data || []) {
        const list = activationMap.get(a.user_id) || [];
        list.push(a);
        activationMap.set(a.user_id, list);
      }

      const enrichedUsers = (usersResult.data?.users || []).map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        role: roleMap.get(u.id) || "user",
        activations: activationMap.get(u.id) || [],
      }));

      return json({ users: enrichedUsers });
    }

    if (action === "delete-user") {
      const { user_id: targetUserId } = body as { user_id: string };
      if (!targetUserId) return json({ error: "user_id is required" }, 400);
      if (targetUserId === userId)
        return json({ error: "Cannot delete your own account" }, 400);

      await adminClient.from("activations").delete().eq("user_id", targetUserId);
      await adminClient
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId);

      const { error } = await adminClient.auth.admin.deleteUser(targetUserId);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    if (action === "deactivate-user") {
      const { user_id: targetUserId } = body as { user_id: string };
      if (!targetUserId) return json({ error: "user_id is required" }, 400);

      await adminClient
        .from("activations")
        .delete()
        .eq("user_id", targetUserId);
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("Admin error:", err);
    return json({ error: String(err) }, 500);
  }
});
