import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Dumbbell, TrendingUp, Target, Repeat, ChevronRight, Timer, Zap, Square, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import RestTimer from "@/components/RestTimer";
import CoPilotInsights from "@/components/CoPilotInsights";
import { AddExerciseModal } from "@/components/AddExerciseModal";
import { ExerciseDemoModal, QuickPreview } from "@/components/ExerciseDemo";
import { Tables, Json } from "@/integrations/supabase/types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type WorkoutPlan = Tables<"workout_plans">;

type SwapAlternative = {
  name: string;
  id?: string;
  label: string;
  reason: string;
};

type Exercise = {
  name: string;
  id?: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  suggested_weight_kg?: number;
  primary_muscle?: string;
  coaching_cues?: string[];
  progression?: string;
  next_goal?: { weight_kg: number; reps: number };
  swap_alternatives?: SwapAlternative[];
};

type LogEntry = {
  name: string;
  sets: { reps: number; weight: number; logged: boolean }[];
};

const SWAP_LABEL_COLORS: Record<string, string> = {
  Easier: "text-green-400 border-green-400/30 bg-green-400/10",
  Harder: "text-red-400 border-red-400/30 bg-red-400/10",
  "Different Equipment": "text-blue-400 border-blue-400/30 bg-blue-400/10",
};

const WorkoutDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [swapOpenIdx, setSwapOpenIdx] = useState<number | null>(null);
  const [restTimer, setRestTimer] = useState<{ open: boolean; seconds: number }>({ open: false, seconds: 60 });
  const [personalBests, setPersonalBests] = useState<Set<string>>(new Set());
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    supabase
      .from("workout_plans")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPlan(data);
          const exs = (data.exercises as unknown) as Exercise[];
          setExercises(exs);

          const savedStateStr = localStorage.getItem(`workout_state_${id}`);
          if (savedStateStr) {
            try {
              const savedState = JSON.parse(savedStateStr);
              setLogEntries(savedState.logEntries || []);
              if (savedState.workoutStarted) setWorkoutStarted(true);
              if (savedState.workoutStartTime) {
                setWorkoutStartTime(new Date(savedState.workoutStartTime));
              }
            } catch (err) {
              console.error("Mighty cache error:", err);
            }
          } else {
            setLogEntries(
              exs.map((e) => ({
                name: e.name,
                sets: Array.from({ length: e.sets }, () => ({
                  reps: 0,
                  weight: e.suggested_weight_kg || 0,
                  logged: false,
                })),
              }))
            );
          }
        }
      });
  }, [id, user]);

  // Elapsed time ticker
  useEffect(() => {
    if (!workoutStarted || !workoutStartTime) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - workoutStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStarted, workoutStartTime]);

  // Persist workout state
  useEffect(() => {
    if (!id || !workoutStarted) return;
    localStorage.setItem(`workout_state_${id}`, JSON.stringify({
      logEntries,
      workoutStarted,
      workoutStartTime: workoutStartTime?.toISOString(),
    }));
  }, [id, logEntries, workoutStarted, workoutStartTime]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const startWorkout = () => {
    setWorkoutStarted(true);
    setWorkoutStartTime(new Date());
    toast.success("Let's get mighty! 💪");
  };

  const updateSet = (exIdx: number, setIdx: number, field: "reps" | "weight", value: number) => {
    setLogEntries((prev) => {
      const copy = [...prev];
      copy[exIdx] = {
        ...copy[exIdx],
        sets: copy[exIdx].sets.map((s, i) =>
          i === setIdx ? { ...s, [field]: value } : s
        ),
      };
      return copy;
    });
  };

  const logSet = useCallback((exIdx: number, setIdx: number) => {
    const entry = logEntries[exIdx]?.sets[setIdx];
    if (!entry || entry.logged) return;

    setLogEntries((prev) => {
      const copy = [...prev];
      copy[exIdx] = {
        ...copy[exIdx],
        sets: copy[exIdx].sets.map((s, i) =>
          i === setIdx ? { ...s, logged: true } : s
        ),
      };
      return copy;
    });

    const ex = exercises[exIdx];
    if (ex?.next_goal && entry.weight >= ex.next_goal.weight_kg && entry.reps >= ex.next_goal.reps) {
      setPersonalBests((prev) => new Set(prev).add(`${exIdx}-${setIdx}`));
      toast.success(`🏆 Personal Best on ${ex.name}!`, { duration: 3000 });
    }

    setRestTimer({ open: true, seconds: ex?.rest_seconds || 60 });
  }, [logEntries, exercises]);

  const swapExercise = (exIdx: number, alt: SwapAlternative) => {
    setExercises((prev) => {
      const copy = [...prev];
      copy[exIdx] = {
        ...copy[exIdx],
        name: alt.name,
        id: alt.id,
        notes: alt.reason,
        swap_alternatives: copy[exIdx].swap_alternatives?.filter((a) => a.name !== alt.name),
      };
      return copy;
    });
    setLogEntries((prev) => {
      const copy = [...prev];
      copy[exIdx] = { ...copy[exIdx], name: alt.name };
      return copy;
    });
    setSwapOpenIdx(null);
    toast.success(`Swapped to ${alt.name}`);
  };

  const handleLog = async () => {
    if (!user || !plan) return;
    setSaving(true);
    const cleanEntries = logEntries.map((e) => ({
      name: e.name,
      sets: e.sets.map(({ reps, weight }) => ({ reps, weight })),
    }));
    const { error } = await supabase.from("workout_logs").insert({
      user_id: user.id,
      workout_plan_id: plan.id,
      exercises: cleanEntries as unknown as Json,
      notes: notes || null,
    });
    if (error) {
      toast.error("Failed to log workout");
    } else {
      localStorage.removeItem(`workout_state_${id}`);
      toast.success("Workout logged! 🎉");
      navigate("/dashboard");
    }
    setSaving(false);
  };

  const handleDeletePlan = async () => {
    if (!user || !plan) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("workout_plans")
        .delete()
        .eq("id", plan.id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Workout plan deleted");
      navigate("/dashboard");
    } catch (e: any) {
      console.error("Delete error:", e);
      toast.error(e.message || "Failed to delete workout plan");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user || !plan) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("workout_plans")
        .update({
          exercises: exercises as unknown as Json,
        })
        .eq("id", plan.id);

      if (error) throw error;
      
      toast.success("Workout plan updated! 🎉");
      setHasUnsavedChanges(false);
      setIsEditing(false);
      
      // Update log entries to match new order
      setLogEntries(
        exercises.map((e) => ({
          name: e.name,
          sets: Array.from({ length: e.sets }, () => ({
            reps: 0,
            weight: e.suggested_weight_kg || 0,
            logged: false,
          })),
        }))
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to update plan");
    } finally {
      setSaving(false);
    }
  };

  const removeExercise = (idx: number) => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
    setHasUnsavedChanges(true);
  };

  const handleAddExercise = (newEx: any) => {
    setExercises(prev => [...prev, newEx]);
    setHasUnsavedChanges(true);
  };

  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
          <Dumbbell className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  const totalSets = logEntries.reduce((acc, e) => acc + e.sets.length, 0);
  const loggedSets = logEntries.reduce((acc, e) => acc + e.sets.filter((s) => s.logged).length, 0);
  const progressPct = totalSets > 0 ? (loggedSets / totalSets) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Rest Timer Overlay */}
      <RestTimer
        seconds={restTimer.seconds}
        isOpen={restTimer.open}
        onComplete={() => setRestTimer({ open: false, seconds: 60 })}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold font-['Space_Grotesk']">{plan.title}</h1>
            <p className="text-xs text-muted-foreground">
              {plan.muscle_groups.join(", ")} · {plan.duration_minutes} min
              {workoutStarted && ` · ${formatTime(elapsedSeconds)}`}
            </p>
          </div>
          <div className="text-right flex items-center gap-2">
            {workoutStarted ? (
              <p className="text-xs text-muted-foreground">{loggedSets}/{totalSets} sets</p>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-primary/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Delete Workout Plan?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this plan. You cannot undo this action.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-secondary">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeletePlan}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? "Deleting..." : "Delete Plan"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        {!workoutStarted && hasUnsavedChanges && (
          <div className="bg-primary/20 border-b border-primary/30 px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-2">
              <Zap className="h-3 w-3" />
              UNSAVED CHANGES
            </span>
            <Button size="sm" onClick={handleSaveChanges} disabled={saving} className="h-7 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4">
              {saving ? "Saving..." : "Save Plan"}
            </Button>
          </div>
        )}
        {workoutStarted && (
          <motion.div
            className="h-0.5 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" as const }}
            style={{ boxShadow: "0 0 10px hsl(175 85% 50% / 0.5)" }}
          />
        )}
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        {/* GET MIGHTY Button - shown before workout starts */}
        {!workoutStarted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Exercise overview header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Workout Overview
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className={`h-8 text-xs font-bold font-['Space_Grotesk'] rounded-lg transition-colors ${
                  isEditing ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" : ""
                }`}
              >
                {isEditing ? "Done Editing" : "Edit Plan"}
              </Button>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <CoPilotInsights planMuscleGroups={plan.muscle_groups} exercises={exercises} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {isEditing ? (
                <Reorder.Group
                  axis="y"
                  values={exercises}
                  onReorder={(newOrder) => {
                    setExercises(newOrder);
                    setHasUnsavedChanges(true);
                  }}
                  className="space-y-3"
                >
                  <AnimatePresence>
                    {exercises.map((ex, i) => (
                      <Reorder.Item
                        key={ex.name + i}
                        value={ex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="glass-card rounded-xl p-4 flex items-center justify-between cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors bg-background/50 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground font-bold font-['Space_Grotesk'] w-4 opacity-50">{i + 1}</span>
                          <div>
                            <p className="font-semibold font-['Space_Grotesk'] text-sm text-foreground">{ex.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Input 
                                type="number" 
                                value={ex.sets} 
                                onChange={(e) => {
                                  const newExs = [...exercises];
                                  newExs[i].sets = parseInt(e.target.value) || 0;
                                  setExercises(newExs);
                                  setHasUnsavedChanges(true);
                                }}
                                className="h-6 w-12 text-xs text-center p-0 bg-transparent border-border" 
                              />
                              <span className="text-xs text-muted-foreground">sets ×</span>
                              <Input 
                                type="text" 
                                value={ex.reps} 
                                onChange={(e) => {
                                  const newExs = [...exercises];
                                  newExs[i].reps = e.target.value;
                                  setExercises(newExs);
                                  setHasUnsavedChanges(true);
                                }}
                                className="h-6 w-16 text-xs text-center p-0 bg-transparent border-border" 
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExercise(i)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-2"
                  >
                    <AddExerciseModal 
                      onAdd={handleAddExercise} 
                      planMuscleGroups={plan.muscle_groups} 
                    />
                  </motion.div>
                </Reorder.Group>
              ) : (
                exercises.map((ex, i) => (
                  <div key={i} className="glass-card rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground uppercase opacity-50 w-4">{i + 1}</span>
                      <ExerciseDemoModal
                        name={ex.name}
                        id={ex.id}
                        primaryMuscle={ex.primary_muscle}
                        coachingCues={ex.coaching_cues}
                      />
                      <div>
                        <p className="font-semibold font-['Space_Grotesk'] text-sm">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">{ex.sets}×{ex.reps} · {ex.rest_seconds}s rest</p>
                      </div>
                    </div>
                    {ex.primary_muscle && (
                      <span className="text-[10px] font-medium text-primary border border-primary/30 bg-primary/10 rounded-full px-2 py-0.5">
                        {ex.primary_muscle}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <motion.div whileTap={{ scale: 0.97 }} className={isEditing ? "opacity-50 pointer-events-none" : ""}>
              <Button
                onClick={startWorkout}
                disabled={isEditing || hasUnsavedChanges}
                className="w-full h-16 text-xl font-bold gap-3 glow-primary rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Zap className="h-6 w-6" />
                GET MIGHTY
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Active workout - shown after start */}
        {workoutStarted && (
          <>
            <AnimatePresence>
              {exercises.map((ex, exIdx) => (
                <motion.div
                  key={`${exIdx}-${ex.name}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: exIdx * 0.05 }}
                  className="glass-card rounded-xl overflow-hidden"
                >
                  <div className="space-y-3 p-4">
                    {/* Exercise header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QuickPreview name={ex.name} id={ex.id}>
                          <h3 className="font-semibold font-['Space_Grotesk']">{ex.name}</h3>
                        </QuickPreview>
                        <ExerciseDemoModal
                          name={ex.name}
                          id={ex.id}
                          primaryMuscle={ex.primary_muscle}
                          coachingCues={ex.coaching_cues}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{ex.sets}×{ex.reps} · {ex.rest_seconds}s</span>
                        {ex.swap_alternatives && ex.swap_alternatives.length > 0 && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSwapOpenIdx(swapOpenIdx === exIdx ? null : exIdx)}
                            className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                          >
                            <Repeat className="h-3 w-3" />
                            Swap
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Swap Carousel */}
                    <AnimatePresence>
                      {swapOpenIdx === exIdx && ex.swap_alternatives && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {ex.swap_alternatives.map((alt, altIdx) => (
                              <motion.button
                                key={altIdx}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => swapExercise(exIdx, alt)}
                                className={`flex-shrink-0 rounded-lg border p-3 text-left w-[160px] transition-colors ${SWAP_LABEL_COLORS[alt.label] || "border-border"}`}
                              >
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-1">{alt.label}</p>
                                <p className="text-xs font-semibold text-foreground">{alt.name}</p>
                                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{alt.reason}</p>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {ex.notes && <p className="text-xs text-muted-foreground italic">{ex.notes}</p>}

                    {ex.progression && (
                      <div className="flex items-start gap-2 rounded-lg bg-primary/10 px-3 py-2">
                        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p className="text-xs font-medium text-primary">{ex.progression}</p>
                      </div>
                    )}

                    {ex.next_goal && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 rounded-lg bg-accent/30 border border-primary/20 px-3 py-2"
                      >
                        <Target className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Next Goal</p>
                          <p className="text-xs font-semibold text-foreground">
                            {ex.next_goal.weight_kg}kg × {ex.next_goal.reps} reps
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Log inputs */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-[1fr_70px_70px_48px] gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        <span>Set</span>
                        <span>Weight</span>
                        <span>Reps</span>
                        <span></span>
                      </div>
                      {logEntries[exIdx]?.sets.map((s, setIdx) => {
                        const isPB = personalBests.has(`${exIdx}-${setIdx}`);
                        return (
                          <motion.div
                            key={setIdx}
                            className={`grid grid-cols-[1fr_70px_70px_48px] gap-2 items-center rounded-lg px-1 py-0.5 transition-colors ${s.logged ? "bg-primary/5" : ""
                              }`}
                            animate={isPB ? {
                              boxShadow: [
                                "0 0 0px hsla(175, 85%, 50%, 0)",
                                "0 0 20px hsla(175, 85%, 50%, 0.4)",
                                "0 0 0px hsla(175, 85%, 50%, 0)",
                              ],
                            } : {}}
                            transition={isPB ? { duration: 1, repeat: 2 } : {}}
                          >
                            <span className={`text-sm font-medium ${s.logged ? "text-primary" : "text-muted-foreground"}`}>
                              {s.logged && <Check className="inline h-3 w-3 mr-1" />}
                              Set {setIdx + 1}
                            </span>
                            <Input
                              type="number"
                              value={s.weight || ""}
                              onChange={(e) => updateSet(exIdx, setIdx, "weight", parseFloat(e.target.value) || 0)}
                              className="h-8 bg-secondary border-border text-center text-xs"
                              placeholder="kg"
                              disabled={s.logged}
                            />
                            <Input
                              type="number"
                              value={s.reps || ""}
                              onChange={(e) => updateSet(exIdx, setIdx, "reps", parseInt(e.target.value) || 0)}
                              className="h-8 bg-secondary border-border text-center text-xs"
                              placeholder="0"
                              disabled={s.logged}
                            />
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => logSet(exIdx, setIdx)}
                              disabled={s.logged || (s.reps === 0 && s.weight === 0)}
                              className={`h-8 w-full rounded-md flex items-center justify-center transition-all ${s.logged
                                ? "bg-primary/20 text-primary cursor-default"
                                : s.reps > 0 || s.weight > 0
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan-sm"
                                  : "bg-secondary text-muted-foreground cursor-not-allowed"
                                }`}
                            >
                              {s.logged ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Timer className="h-4 w-4" />
                              )}
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="space-y-2">
              <Textarea
                placeholder="Notes about this workout (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            {/* End Workout / Log Button */}
            <div className="space-y-3">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleLog}
                  disabled={saving || loggedSets === 0}
                  className="w-full h-14 text-base font-semibold gap-2 glow-primary rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="h-5 w-5" />
                  {saving ? "Logging..." : `Complete & Log (${loggedSets}/${totalSets} sets)`}
                </Button>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (loggedSets > 0) {
                      handleLog();
                    } else {
                      navigate("/dashboard");
                    }
                  }}
                  className="w-full h-12 text-sm font-medium gap-2 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <Square className="h-4 w-4" />
                  End Workout {loggedSets > 0 ? "& Save" : ""}
                </Button>
              </motion.div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default WorkoutDetail;
