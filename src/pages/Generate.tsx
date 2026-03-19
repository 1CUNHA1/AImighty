import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ReadinessCheck from "@/components/ReadinessCheck";

const RECOVERY_MUSCLES = ["core", "glutes", "legs"];

const Generate = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [duration, setDuration] = useState(45);
  const [generating, setGenerating] = useState(false);
  const [readinessChecked, setReadinessChecked] = useState(false);
  const [readinessScore, setReadinessScore] = useState<number | null>(null);

  const MUSCLE_GROUPS = [
    { value: "chest", label: t.muscles.chest, emoji: "🫁" },
    { value: "back", label: t.muscles.back, emoji: "🔙" },
    { value: "shoulders", label: t.muscles.shoulders, emoji: "🤷" },
    { value: "biceps", label: t.muscles.biceps, emoji: "💪" },
    { value: "triceps", label: t.muscles.triceps, emoji: "🦾" },
    { value: "legs", label: t.muscles.legs, emoji: "🦵" },
    { value: "core", label: t.muscles.core, emoji: "🎯" },
    { value: "glutes", label: t.muscles.glutes, emoji: "🍑" },
  ];

  const toggle = (v: string) => {
    setSelected((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const handleGenerate = async (overrideMuscles?: string[], overrideDuration?: number) => {
    if (!user) return;
    const muscles = overrideMuscles || selected;
    const dur = overrideDuration || duration;
    if (muscles.length === 0) return;
    setGenerating(true);

    try {
      const [profileRes, logsRes] = await Promise.all([
        supabase.from("profiles").select("experience, goal").eq("user_id", user.id).single(),
        supabase.from("workout_logs").select("exercises, completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(5),
      ]);

      const { data, error } = await supabase.functions.invoke("generate-workout", {
        body: {
          muscleGroups: muscles,
          durationMinutes: dur,
          experience: profileRes.data?.experience,
          goal: profileRes.data?.goal,
          previousLogs: logsRes.data || [],
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const { data: plan, error: saveErr } = await supabase
        .from("workout_plans")
        .insert({
          user_id: user.id,
          title: data.title || `${muscles.join(", ")} Workout`,
          muscle_groups: muscles,
          duration_minutes: dur,
          exercises: data.exercises,
        })
        .select()
        .single();

      if (saveErr) throw saveErr;

      toast.success(t.generate.workoutGenerated);
      navigate(`/workout/${plan.id}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || t.generate.generateFailed);
    } finally {
      setGenerating(false);
    }
  };

  const handleReadinessProceed = (score: number) => {
    setReadinessScore(score);
    setReadinessChecked(true);
  };

  const handleRecoverySession = () => {
    setSelected(RECOVERY_MUSCLES);
    setDuration(15);
    setReadinessScore(1);
    setReadinessChecked(true);
    toast.info(t.generate.recoverySwitched);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold font-['Space_Grotesk']">{t.generate.title}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-6">
        <AnimatePresence mode="wait">
          {!readinessChecked ? (
            <ReadinessCheck
              key="readiness"
              onProceed={handleReadinessProceed}
              onRecovery={handleRecoverySession}
            />
          ) : (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {readinessScore && readinessScore <= 2 && (
                <div className="flex items-center gap-2 rounded-xl border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-xs text-orange-400 font-medium">
                  {t.generate.lowEnergy}
                </div>
              )}

              <div className="space-y-3">
                <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{t.generate.targetMuscles}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {MUSCLE_GROUPS.map((m) => (
                    <Card
                      key={m.value}
                      className={`cursor-pointer transition-all border-2 ${
                        selected.includes(m.value)
                          ? "border-primary glow-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                      onClick={() => toggle(m.value)}
                    >
                      <CardContent className="flex items-center gap-3 p-4">
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="font-semibold">{m.label}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{t.generate.duration}</h2>
                  <span className="text-2xl font-bold text-primary">{duration} {t.common.min}</span>
                </div>
                <Slider value={[duration]} onValueChange={(v) => setDuration(v[0])} min={15} max={90} step={5} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>15 {t.common.min}</span>
                  <span>90 {t.common.min}</span>
                </div>
              </div>

              <Button
                onClick={() => handleGenerate()}
                disabled={selected.length === 0 || generating}
                className="w-full h-14 text-base font-semibold gap-2 glow-primary rounded-xl"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t.generate.generating}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    {t.generate.generateBtn}
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Generate;
