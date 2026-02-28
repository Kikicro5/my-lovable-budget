import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAYPAL_API = "https://api-m.paypal.com";

const TIER_IDS: Record<string, string> = {
  "1m": "1month",
  "3m": "3months",
  "12m": "12months",
};

const TIER_DAYS: Record<string, number> = {
  "1m": 30,
  "3m": 90,
  "12m": 365,
};

const TIER_LABELS: Record<string, string> = {
  "1m": "1 month",
  "3m": "3 months",
  "12m": "12 months",
};

async function getPayPalAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
  const secretKey = Deno.env.get("PAYPAL_SECRET")!;
  const auth = btoa(`${clientId}:${secretKey}`);

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { action, order_id, device_id, tier = "1m" } = body;

    // Public endpoint — no auth needed
    if (action === "get-prices") {
      const clientId = Deno.env.get("PAYPAL_CLIENT_ID")!;

      // Read prices from premium_settings table
      const { data: settings } = await adminClient
        .from("premium_settings")
        .select("id, price")
        .order("duration_days", { ascending: true });

      const priceMap: Record<string, string> = {};
      for (const s of settings || []) {
        priceMap[s.id] = String(s.price);
      }

      return json({
        price_1m: priceMap["1month"] || "6.99",
        price_3m: priceMap["3months"] || "17.99",
        price_12m: priceMap["12months"] || "59.99",
        clientId,
      });
    }

    // All other actions require auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = (claimsData.claims as any).email || "";

    if (action === "create-order") {
      const tierId = TIER_IDS[tier] || "1month";
      const { data: priceSetting } = await adminClient
        .from("premium_settings")
        .select("price")
        .eq("id", tierId)
        .single();

      const price = priceSetting?.price ? String(priceSetting.price) : "6.99";
      const label = TIER_LABELS[tier] || "1 month";

      const accessToken = await getPayPalAccessToken();

      const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: { currency_code: "EUR", value: price },
              description: `BudgetCard Premium (${label})`,
            },
          ],
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        return json({ error: "Failed to create PayPal order", details: orderData }, 500);
      }

      return json({ id: orderData.id });
    }

    if (action === "capture-order") {
      if (!order_id || !device_id) {
        return json({ error: "order_id and device_id required" }, 400);
      }

      const accessToken = await getPayPalAccessToken();

      const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${order_id}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const captureData = await captureRes.json();
      if (!captureRes.ok || captureData.status !== "COMPLETED") {
        return json({ error: "Payment not completed", details: captureData }, 400);
      }

      const days = TIER_DAYS[tier] || 30;

      // Generate activation code
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const genSegment = () => {
        const arr = new Uint8Array(4);
        crypto.getRandomValues(arr);
        return Array.from(arr, b => chars[b % chars.length]).join("");
      };
      const code = `${genSegment()}-${genSegment()}-${genSegment()}`;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      const { data: codeData, error: codeError } = await adminClient
        .from("activation_codes")
        .insert({
          code,
          max_uses: 1,
          current_uses: 1,
          expires_at: expiresAt.toISOString(),
          created_by: userId,
        })
        .select("id")
        .single();

      if (codeError) {
        return json({ error: "Failed to create code: " + codeError.message }, 500);
      }

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + days);

      await adminClient
        .from("activations")
        .insert({
          code_id: codeData.id,
          user_id: userId,
          email: userEmail,
          device_id,
          valid_until: validUntil.toISOString(),
        });

      return json({ success: true, code, valid_until: validUntil.toISOString() });
    }

    return json({ error: "Invalid action" }, 400);
  } catch (err) {
    console.error("PayPal checkout error:", err);
    return json({ error: String(err) }, 500);
  }
});
