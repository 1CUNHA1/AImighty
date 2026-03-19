import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus, LogOut, TrendingUp, Calendar, Zap, UserCog, ChevronRight, Target, Trash2, AlertTriangle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import MuscleHeatmap from "@/components/MuscleHeatmap";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Profile = Tables<"profiles">;
type WorkoutPlan = Tables<"workout_plans">;
type WorkoutLog = Tables<"workout_logs">;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, plansRes, logsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("workout_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("workout_logs").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(20)]
      );
      setProfile(profileRes.data);
      setPlans(plansRes.data || []);
      setLogs(logsRes.data || []);

      if (!profileRes.data || !profileRes.data.onboarding_completed) {
        navigate("/onboarding");
      }
      setLoading(false);
    };
    load();
  }, [user, navigate]);

  const handleDeletePlan = async () => {
    if (!user || !planToDelete) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from("workout_plans")
        .delete()
        .eq("id", planToDelete)
        .eq("user_id", user.id);

      if (error) throw error;

      setPlans(prev => prev.filter(p => p.id !== planToDelete));
      toast.success(t.dashboard.planDeleted);
    } catch (e: any) {
      console.error("Delete error:", e);
      toast.error(e.message || t.dashboard.deleteFailed);
    } finally {
      setDeleting(false);
      setPlanToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
          <Dumbbell className="h-8 w-8 text-primary" />
        </motion.div>
      </div>);

  }

  const thisWeekLogs = logs.filter((l) => {
    const d = new Date(l.completed_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  });

  const goalLabel = profile?.goal ?
    (t.goals as Record<string, string>)[profile.goal] || 
    (profile.goal.charAt(0).toUpperCase() + profile.goal.slice(1).replace(/_/g, " ")) :
    t.dashboard.generalFitness;

  // Find most recent plan for "Ready to Lift"
  const readyPlan = plans[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Dumbbell className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight font-['Space_Grotesk']">
              AI<span className="text-gradient">mighty</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate("/progress")} className="gap-1.5 text-muted-foreground hover:text-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">{t.dashboard.progress}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-foreground">
              <UserCog className="h-4 w-4" />
            </Button>
            <NotificationCenter />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
          <AlertDialogContent className="glass-card border-primary/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                {t.dashboard.deletePlanTitle}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t.dashboard.deletePlanDesc}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-secondary">{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePlan}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? t.dashboard.deleting : t.dashboard.deletePlan}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {/* Welcome */}
          <motion.div variants={item} className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight font-['Space_Grotesk']">
              {t.dashboard.welcome.replace("{name}", profile?.full_name?.split(" ")[0] || t.common.athlete)}
            </h1>
            <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
          </motion.div>

          {/* Hero Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Goal Hero Card */}
            <motion.div
              variants={item}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="glass-card-highlight rounded-2xl p-5 cursor-pointer relative overflow-hidden group"
              onClick={() => navigate("/profile")}>

              {/* Background glow orb */}
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider text-primary">{t.dashboard.currentGoal}</span>
                </div>
                <p className="text-xl font-bold font-['Space_Grotesk']">{goalLabel}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{profile?.experience || t.experience.beginner} {t.common.level}</span>
                  <span>·</span>
                  <span>{t.dashboard.sessionsThisWeek.replace("{count}", String(thisWeekLogs.length))}</span>
                </div>
              </div>
            </motion.div>

            {/* Ready to Lift Card */}
            <motion.div
              variants={item}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="glass-card rounded-2xl p-5 cursor-pointer relative overflow-hidden group"
              onClick={() => readyPlan ? navigate(`/workout/${readyPlan.id}`) : navigate("/generate")}>

              <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium uppercase tracking-wider text-primary">{t.dashboard.getMighty}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {readyPlan ?
                  <>
                    <p className="text-lg font-bold font-['Space_Grotesk']">{readyPlan.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {readyPlan.muscle_groups.join(", ")} · {readyPlan.duration_minutes} {t.common.min}
                    </p>
                  </> :

                  <>
                    <p className="text-lg font-bold font-['Space_Grotesk']">{t.dashboard.generateWorkout}</p>
                    <p className="text-xs text-muted-foreground">{t.dashboard.createFirst}</p>
                  </>
                }
              </div>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div variants={item} className="grid grid-cols-3 gap-3">
            {[
              { icon: Zap, value: thisWeekLogs.length, label: t.dashboard.thisWeek },
              { icon: Calendar, value: logs.length, label: t.dashboard.totalLogged },
              { icon: Dumbbell, value: plans.length, label: t.dashboard.plans }].
              map((stat, i) =>
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05 }}
                  className="glass-card rounded-xl p-4 text-center">

                  <stat.icon className="mx-auto mb-1.5 h-4.5 w-4.5 text-primary" />
                  <p className="text-2xl font-bold font-['Space_Grotesk']">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              )}
          </motion.div>

          {/* Muscle Heatmap */}
          <motion.div variants={item} className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t.dashboard.intensityMap}
            </h2>
            <MuscleHeatmap logs={logs} />
          </motion.div>

          {/* Generate Button */}
          <motion.div variants={item}>
            <Button
              onClick={() => navigate("/generate")}
              className="w-full h-14 text-base font-semibold gap-2 glow-primary rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">

              <Plus className="h-5 w-5" />
              {t.dashboard.newPlan}
            </Button>
          </motion.div>

          {/* Recent Plans */}
          <motion.div variants={item} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t.dashboard.recentPlans}
            </h2>
            <AnimatePresence>
              {plans.length === 0 ?
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-xl p-8 text-center text-muted-foreground">

                  {t.dashboard.noPlans}
                </motion.div> :

                plans.map((plan, i) =>
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="glass-card rounded-xl cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => navigate(`/workout/${plan.id}`)}>

                    <div className="flex items-center justify-between p-4 group/card">
                      <div className="flex-1" onClick={() => navigate(`/workout/${plan.id}`)}>
                        <p className="font-semibold font-['Space_Grotesk']">{plan.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {plan.muscle_groups.join(", ")} · {plan.duration_minutes} {t.common.min}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(plan.created_at).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlanToDelete(plan.id);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/card:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </motion.div>
                )
              }
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>
    </div>);

};

export default Dashboard;