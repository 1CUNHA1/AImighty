import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import exercisesByMuscle from "./exercises_by_muscle.json" assert { type: "json" };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOAL_REP_SCHEMES: Record<string, { sets: string; reps: string; rest: number }> = {
  muscle_gain: { sets: "3-5", reps: "6-12", rest: 90 },
  build_muscle: { sets: "3-5", reps: "6-12", rest: 90 },
  fat_loss: { sets: "3-4", reps: "8-12", rest: 60 },
  lose_fat: { sets: "3-4", reps: "8-12", rest: 60 },
  strength: { sets: "4-6", reps: "3-6", rest: 180 },
  endurance: { sets: "2-3", reps: "15-25", rest: 45 },
  general_fitness: { sets: "3-4", reps: "8-15", rest: 60 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { muscleGroups, durationMinutes, experience, goal, previousLogs, language } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const normalizedGoal = (goal || "general_fitness").replace(/\s+/g, "_").toLowerCase();
    const scheme = GOAL_REP_SCHEMES[normalizedGoal] || GOAL_REP_SCHEMES.general_fitness;

    // Filter available exercises based on requested muscle groups
    const requestedMuscles = (muscleGroups || []).map((m: string) => m.toLowerCase());
    let pool: any[] = [];

    // Always include some basics if pool is small or no muscles matched
    requestedMuscles.forEach(muscle => {
      // Direct match or partial match (e.g., 'back' matches 'Back', 'upper legs' matches 'Legs')
      const matches = Object.entries(exercisesByMuscle).filter(([key]) =>
        key.toLowerCase().includes(muscle) || muscle.includes(key.toLowerCase())
      );
      matches.forEach(([_, exercises]) => pool.push(...(exercises as any[])));
    });

    // Fallback to a broader sample if pool is empty
    if (pool.length === 0) {
      pool = Object.values(exercisesByMuscle).flat();
    }

    // Deduplicate and format pool for AI
    const exercisePool = pool.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
      .map(ex => `- ${ex.name} (ID: ${ex.id}) [Target: ${ex.target}, Equipment: ${ex.equipment}]`)
      .slice(0, 300); // Limit to 300 most relevant to keep prompt clean

    let historyContext = "";
    if (previousLogs && previousLogs.length > 0) {
      // ... (history logic remains same)
      historyContext = `\n\nIMPORTANT - Previous workout history for progressive overload:\n`;
      for (const log of previousLogs) {
        historyContext += `\nWorkout from ${log.completed_at}:\n`;
        if (Array.isArray(log.exercises)) {
          for (const ex of log.exercises) {
            if (ex.sets && Array.isArray(ex.sets)) {
              const sets = ex.sets.map((s: any) => `${s.weight}kg × ${s.reps} reps`).join(", ");
              historyContext += `  - ${ex.name}: ${sets}\n`;
            }
          }
        }
      }
      historyContext += `\nBased on the above history, for exercises the user has done before:
- If they completed all reps consistently, suggest INCREASING the weight by 2.5-5kg and potentially lowering reps.
- Add a "progression" field to each exercise with a brief note like "↑ Weight from 40kg to 42.5kg" or "Maintain current weight - focus on form".
- Add a "next_goal" object with "weight_kg" and "reps" fields showing the specific target for next session.
- For new exercises they haven't done, use appropriate weights based on their existing strength levels.\n`;
    }

    const isPT = language === "pt";
    const languageInstruction = isPT 
      ? `\n- GENERATE ALL RESPONSE TEXT (title, exercise names, notes, coaching_cues, swap alternatives reasons) IN PORTUGUESE (pt-PT). Use accurate terminology (e.g., 'Séries', 'Repetições').`
      : `\n- Generate all text in English.`;

    const systemPrompt = `You are an expert fitness coach. Generate a structured workout plan.${languageInstruction}
The user's goal is "${normalizedGoal}" so use this rep scheme: ${scheme.sets} sets of ${scheme.reps} reps per exercise.

### EXERCISE POOL
You MUST ONLY pick exercises from this list for 'name', 'id', and 'swap_alternatives'. 
Every exercise you select MUST exist in this list with its exact ID. (Translate the 'name' and 'coaching_cues' string to Portuguese if requested).
${exercisePool.join('\n')}

### RESPONSE FORMAT
Return ONLY valid JSON using this exact structure (no markdown, no extra text):
{
  "title": "Workout title",
  "exercises": [
    {
      "name": "Exercise name (Translate to Portuguese if requested)",
      "id": "Exact ID from pool",
      "sets": 3,
      "reps": "10-12",
      "rest_seconds": ${scheme.rest},
      "notes": "Form tips",
      "suggested_weight_kg": 40,
      "primary_muscle": "From pool target",
      "coaching_cues": ["Tip 1", "Tip 2", "Tip 3"],
      "progression": "Optional note",
      "next_goal": { "weight_kg": 42.5, "reps": 10 },
      "swap_alternatives": [
        { "name": "Translate name to Portuguese if requested", "id": "Exact ID from pool", "label": "Easier", "reason": "Translate reason to Portuguese if requested" },
        { "name": "Translate name to Portuguese if requested", "id": "Exact ID from pool", "label": "Harder", "reason": "Translate reason to Portuguese if requested" },
        { "name": "Translate name to Portuguese if requested", "id": "Exact ID from pool", "label": "Different Equipment", "reason": "Translate reason to Portuguese if requested" }
      ]
    }
  ]
}

IMPORTANT RULES:
- STRICT SELECTION RULE: Every selected exercise MUST have its '[Target: ...]' from the pool EXACTLY match one of the requested muscle groups: ${requestedMuscles.join(", ")}. Do NOT include compound movements that target other muscles primarily (e.g., do not suggest Back rows for Biceps logs unless specifically requested).
- ALWAYS include exactly 3 swap_alternatives per exercise picked from the same pool.
- ALWAYS include "primary_muscle" matching the target from the pool.
- ALWAYS include the 'id' field for every exercise.
- Sets MUST be in range ${scheme.sets}, reps MUST be in range ${scheme.reps}, and rest_seconds MUST be exactly ${scheme.rest}.
- Tailor the workout to the user's experience level ("${experience || "intermediate"}"):
  - Beginner: Prioritize fundamental compound movements and keep exercise complexity low. Focus on form.
  - Intermediate: Add more isolation exercises to compliment compounds.
  - Advanced: Introduce intensity techniques (RPE scale, drop sets, tempo focus) into the "notes" field.
- Make it fit within the specified duration${historyContext}`;

    const userPrompt = `Create a ${durationMinutes}-minute workout targeting: ${muscleGroups.join(", ")}.
Experience level: ${experience || "intermediate"}.
Goal: ${normalizedGoal.replace(/_/g, " ")}.`;

    const fetchWithRetry = async (retries = 3, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
              ],
              generationConfig: { temperature: 0.7 },
            }),
          }
        );
        if (resp.status === 429 && i < retries - 1) {
          console.warn(`Gemini rate limited, retrying in ${delay}ms (attempt ${i + 1}/${retries})`);
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        return resp;
      }
      throw new Error("Max retries exceeded");
    };

    const response = await fetchWithRetry();

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      const status = response.status === 429 ? 429 : 500;
      return new Response(JSON.stringify({ error: response.status === 429 ? "Too many requests, please wait a moment and try again." : "AI API error: " + response.status }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    let workout;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      workout = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse workout plan" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(workout), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-workout error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
