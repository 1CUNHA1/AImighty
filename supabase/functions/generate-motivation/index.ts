import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // This function is meant to be called via pg_cron natively, but can be triggered manually.
    // We use the service_role key to bypass RLS because we are operating on all users.
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Fetch all profiles that have notifications enabled
    const { data: profiles, error: profilesError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("notification_preferences", true)

    if (profilesError) throw profilesError
    if (!profiles || profiles.length === 0) {
       return new Response(JSON.stringify({ message: "No active profiles found." }), { headers: corsHeaders, status: 200 })
    }

    const geminiKey = Deno.env.get("VITE_GEMINI_API_KEY") || Deno.env.get("GEMINI_API_KEY")
    let createdCount = 0;

    // 2. Iterate through each profile
    for (const profile of profiles) {
      // Fetch user's recent logs
      const { data: logs } = await supabaseClient
        .from("workout_logs")
        .select("completed_at, exercises")
        .eq("user_id", profile.user_id) // Assuming profiles.user_id maps to auth.users.id
        .order("completed_at", { ascending: false })
        .limit(100) // Get enough to check milestones

      if (!logs) continue;

      const totalWorkouts = logs.length;
      const today = new Date();
      
      let triggerReason = "";
      let context = `Athlete Name: ${profile.full_name || "Athlete"}\nGoal: ${profile.goal || "Fitness"}\n`;

      if (totalWorkouts === 0) {
        // Welcome them
        triggerReason = "Welcome";
        context += "This user just joined and hasn't logged a workout yet. Encourage them to start their first session today!";
      } else {
        const lastWorkoutDate = new Date(logs[0].completed_at);
        const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Count workouts in the last 7 days
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const workoutsThisWeek = logs.filter(l => new Date(l.completed_at) >= weekAgo).length;

        // Check for Consecutive Days (Recovery Trigger)
        // Simplified Logic: if workoutsThisWeek >= 5 and daysSinceLastWorkout == 0
        
        // Last workout time extraction (Dedication Trigger)
        const lastWorkoutHour = lastWorkoutDate.getHours();

        // ** Determine Trigger Condition **
        if (totalWorkouts === 10 || totalWorkouts === 50 || totalWorkouts === 100) {
          triggerReason = "Milestone";
          context += `User just hit an epic milestone: ${totalWorkouts} total workouts! Celebrate this massive achievement.`;
        } 
        else if (daysSinceLastWorkout >= 3) {
          triggerReason = "Inactivity";
          context += `User hasn't worked out in ${daysSinceLastWorkout} days. Give them a gentle but firm push to get back to the gym today.`;
        } 
        else if (workoutsThisWeek >= 5 && daysSinceLastWorkout === 0) {
          triggerReason = "Recovery";
          context += `User has worked out ${workoutsThisWeek} times this week. Remind them that muscles grow during rest and to prioritize recovery.`;
        }
        else if (workoutsThisWeek >= 3 && daysSinceLastWorkout <= 1) {
          triggerReason = "Streak";
          context += `User is on a hot streak with ${workoutsThisWeek} workouts this week! Tell them to keep this amazing momentum going.`;
        }
        else if (lastWorkoutHour < 6 || lastWorkoutHour > 22) {
          triggerReason = "Dedication";
          const timeDesc = lastWorkoutHour < 6 ? "early morning" : "late night";
          context += `User's last workout was a ${timeDesc} session (Hour: ${lastWorkoutHour}). Praise their extreme dedication and discipline.`;
        }
      }

      // 3. If a trigger condition was met, call Gemini
      if (triggerReason !== "") {
        let message = "";
        
        if (!geminiKey) {
           message = `[MOCK] Trigger: ${triggerReason} - Keep up the great work! ✨`;
        } else {
           const prompt = `You are the AImighty app's Co-Pilot, an elite, motivational personal trainer talking directly to an athlete.
Generate a very short, punchy (max 1 sentence) push notification for this user based on the scenario.

STRICT RULES:
1. MUST include 1-2 relevant emojis.
2. Ensure the message is grammatically correct and well-structured. You may use standard punctuation, but NO hashtags (#), asterisks (*), or quotation marks ("").
3. Keep it under 100 characters.

SCENARIO:
${context}`;

            try {
              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
              });

              if (response.ok) {
                const aiData = await response.json();
                message = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Time to crush your next session!";
                message = message.replace(/^['"]|['"]$/g, '').trim(); // Clean quotes
              } else {
                console.error("Gemini API Error for user", profile.user_id);
                continue; // Skip saving notification if AI fails
              }
            } catch (e) {
               console.error("Fetch error", e);
               continue;
            }
        }

        // 4. Save to `app_notifications`
        if (message) {
           await supabaseClient
             .from("app_notifications")
             .insert({
               user_id: profile.user_id,
               title: triggerReason,
               message: message
             });
           createdCount++;
        }
      }
    }

    return new Response(JSON.stringify({ success: true, notificationsCreated: createdCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
