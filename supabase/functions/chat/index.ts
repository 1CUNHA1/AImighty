import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userProfile } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    let profileContext = "";
    if (userProfile) {
      profileContext = `\nUser profile: ${userProfile.experience || "intermediate"} level, goal: ${(userProfile.goal || "build_muscle").replace("_", " ")}, weight: ${userProfile.weight || "unknown"}kg, height: ${userProfile.height || "unknown"}cm, age: ${userProfile.age || "unknown"}.`;
    }

    const systemPrompt = `You are FormaFit AI, an expert fitness assistant. You help users with workout advice, form tips, nutrition guidance, injury prevention, and fitness questions. Be concise, friendly, and encouraging. Use emojis sparingly.${profileContext}`;

    // Build Gemini contents format
    const contents = [];

    // Add system instruction as first user message context
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt + "\n\nPlease acknowledge and respond to the following conversation." }],
    });
    contents.push({
      role: "model",
      parts: [{ text: "Understood! I'm FormaFit AI, ready to help with your fitness questions. What would you like to know?" }],
    });

    for (const msg of messages) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI API error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ reply: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
