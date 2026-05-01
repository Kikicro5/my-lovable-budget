import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the in-app help assistant for "Budget Card", a personal expense tracking app.
Always answer in the user's language (provided in the user message metadata; default to English if unsure). Keep answers short, friendly, and step-by-step using markdown lists.

APP OVERVIEW:
- Budget Card helps users track income, expenses, investments and savings per month.
- Available in 8 languages (HR, EN, DE, PL, ES, FR, ZH, HI).
- Bottom navigation pages: Home (Početna), Monthly (Mjesečno), Accounts (Računi), Archive (Arhiva), Options (Opcije).

KEY FEATURES & WHERE TO FIND THEM:
- ACCOUNTS (Računi page, wallet icon): Mandatory — user MUST create at least one account before adding any transactions. Each account has a name and balance. You can transfer funds between accounts. Monthly limits for expenses/investments/savings can be set inline on this page.
- HOME page: Shows current balance, totals, monthly mini-chart, quick expense form, last transactions, active reminders. Investments and Savings shown here are CUMULATIVE across all months.
- MONTHLY page: Tabs for Income, Expense, Investment, Savings. Investment/Savings tabs show all-time history. You can transfer from investments/savings to main balance.
- ARCHIVE page: Yearly grouped cards with cumulative balances, PDF export, and a "Search by item" section to filter transactions by a specific item across selected year/month range.
- REMINDERS: Cost planning items shown as pulsing bell icon on the month card.
- RECURRING TRANSACTIONS: Set up in Options; can be applied to current month with one click.
- CATEGORIES: Manage default and custom categories in Options.
- GROUP SHARING (premium): Share budget with up to 5 users via 6-char code. Real-time sync.
- CLOUD SYNC: Automatic background sync every 2 seconds when logged in.
- LANGUAGE & CURRENCY: Change in Options.
- THEME: Light/dark in Options.
- PREMIUM (3.99€/year): Unlocks advanced features like budget limits chart, monthly mini-chart, group sharing. Activate via Google Play (Android) or PayPal (Web), or via activation code in Options → Premium section.
- AUTH: Email + password (verification required) or Google login. On Auth page.
- DATA EXPORT: PDF export available from Archive page.
- SUPPORT: Contact form available in Options.

RULES:
- ONLY answer questions about how to use Budget Card. If asked anything unrelated (general knowledge, other apps, personal advice), politely say you only help with Budget Card and suggest a relevant app topic.
- Never invent features. If unsure where something is, suggest checking the Options page or the in-app beginner guide (Options → App Guide).
- Do NOT discuss internal implementation, Supabase, or technical details.
- Keep replies under ~150 words unless the user asks for more detail.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const language = typeof body?.language === "string" ? body.language : "en";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n\nUser language code: ${language}. Respond in this language.` },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("help-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});