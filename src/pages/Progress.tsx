import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Dumbbell, TrendingUp, Calendar, Zap, Target, BarChart2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Tables } from "@/integrations/supabase/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import { motion } from "framer-motion";

type WorkoutLog = Tables<"workout_logs">;
type WorkoutPlan = Tables<"workout_plans">;

type LogExercise = {
  name: string;
  primary_muscle?: string;
  sets: { reps: number; weight: number }[];
};

type LogWithPlan = WorkoutLog & { plan?: WorkoutPlan };

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Progress = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogWithPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [logsRes, plansRes] = await Promise.all([
        supabase
          .from("workout_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(200), // More logs for heatmap and accurate trends
        supabase
          .from("workout_plans")
          .select("*")
          .eq("user_id", user.id),
      ]);
      const plans = plansRes.data || [];
      const plansMap = new Map(plans.map((p) => [p.id, p]));
      const enriched: LogWithPlan[] = (logsRes.data || []).map((log) => ({
        ...log,
        plan: log.workout_plan_id ? plansMap.get(log.workout_plan_id) : undefined,
      }));
      setLogs(enriched);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
          <Dumbbell className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  // Calculate Streak
  const calculateStreak = () => {
    if (logs.length === 0) return 0;
    const sortedDates = [...new Set(logs.map(l => {
      const d = new Date(l.completed_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }))].sort((a, b) => b - a);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let checkDate = today;
    // Check if the most recent workout was today or yesterday to start streak
    const mostRecent = sortedDates[0];
    const diffDays = Math.floor((today.getTime() - mostRecent) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) return 0; // Streak broken

    for (let i = 0; i < sortedDates.length; i++) {
      const d = new Date(sortedDates[i]);
      if (diffDays === 1 && i === 0) {
        // Workout was yesterday, streak continues if consecutive
        streak++;
        checkDate = new Date(d.getTime() - (1000 * 60 * 60 * 24));
        continue;
      }
      
      const expectedTime = checkDate.getTime();
      if (d.getTime() === expectedTime) {
        streak++;
        checkDate = new Date(expectedTime - (1000 * 60 * 60 * 24));
      } else if (d.getTime() < expectedTime) {
        break; // Gap in dates
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  // Volume Trend data (last 8 weeks)
  const volumeTrend = Array.from({ length: 8 }, (_, i) => {
    const now = new Date();
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    
    const weekLogs = logs.filter((l) => {
      const d = new Date(l.completed_at);
      return d >= weekStart && d < weekEnd;
    });

    const volume = weekLogs.reduce((acc, log) => {
      const exs = log.exercises as unknown as LogExercise[];
      if (!Array.isArray(exs)) return acc;
      return acc + exs.reduce((eAcc, ex) => {
        if (!Array.isArray(ex.sets)) return eAcc;
        return eAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.weight || 0) * (s.reps || 0), 0);
      }, 0);
    }, 0);

    return { 
      name: `W${8 - i}`, 
      volume: Math.round(volume / 10), // Scale for better display
      rawVolume: volume 
    };
  }).reverse();

  // Total volume from all logs
  const totalVolume = logs.reduce((acc, log) => {
    const exs = log.exercises as unknown as LogExercise[];
    if (!Array.isArray(exs)) return acc;
    return acc + exs.reduce((eAcc, ex) => {
      if (!Array.isArray(ex.sets)) return eAcc;
      return eAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.weight || 0) * (s.reps || 0), 0);
    }, 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight font-['Space_Grotesk']">{t.progress.title}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show" 
          className="space-y-8"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={item} className="glass-card-highlight rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Zap className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.progress.currentStreak}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-['Space_Grotesk']">{streak}</span>
                  <span className="text-xs text-muted-foreground font-medium">{t.progress.days}</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={item} className="glass-card rounded-2xl p-5 relative overflow-hidden group">
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.progress.totalWorkouts}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-['Space_Grotesk']">{logs.length}</span>
                  <span className="text-xs text-muted-foreground font-medium">{t.progress.sessions}</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={item} className="glass-card rounded-2xl p-5 relative overflow-hidden group">
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Dumbbell className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.progress.totalVolume}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-['Space_Grotesk']">{(totalVolume / 1000).toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground font-medium">{t.progress.tons}</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={item} className="glass-card rounded-2xl p-5 relative overflow-hidden group">
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.progress.daysTraining}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-['Space_Grotesk']">{[...new Set(logs.map(l => l.completed_at.split('T')[0]))].length}</span>
                  <span className="text-xs text-muted-foreground font-medium">{t.progress.days}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Activity Heatmap */}
          <motion.div variants={item} className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wider font-['Space_Grotesk'] text-muted-foreground">{t.progress.activityIntensity}</h2>
                <p className="text-xs text-muted-foreground">{t.progress.activityDesc}</p>
              </div>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold py-1 px-2 cursor-help">
                    {Math.round((logs.length / 168) * 100)}% Consistency
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="glass-card border-border/50 text-[10px]">
                  Percentage of days active in the last 24 weeks
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
            </div>
            <ActivityHeatmap logs={logs} />
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6">
            <motion.div variants={item} className="glass-card rounded-2xl p-6 space-y-6">
              <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wider font-['Space_Grotesk'] text-muted-foreground">{t.progress.volumeTrend}</h2>
                <p className="text-xs text-muted-foreground">{t.progress.volumeDesc}</p>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeTrend}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.2)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      dy={10}
                    />
                    <YAxis 
                      hide
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass-card border-border/50 p-3 rounded-xl shadow-2xl">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{payload[0].payload.name}</p>
                              <p className="text-sm font-bold text-primary">{payload[0].value.toLocaleString()} pts</p>
                              <p className="text-[10px] text-muted-foreground">Raw: {payload[0].payload.rawVolume.toLocaleString()} kg</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorVolume)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Recent Sessions List */}
          <motion.div variants={item} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold uppercase tracking-wider font-['Space_Grotesk'] text-muted-foreground">{t.progress.sessionHistory}</h2>
              <span className="text-[10px] font-medium text-muted-foreground uppercase">{t.progress.showingLast30}</span>
            </div>
            
            {logs.length === 0 ? (
              <Card className="glass-card rounded-2xl">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                      <Target className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{t.progress.noWorkouts}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              (() => {
                const grouped = new Map<string, LogWithPlan[]>();
                logs.slice(0, 30).forEach((log) => {
                  const muscles = log.plan?.muscle_groups;
                  const groups = Array.isArray(muscles) && muscles.length > 0 ? muscles : ["Other"];
                  groups.forEach((group: string) => {
                    const key = group.toLowerCase();
                    const translatedGroup = t.muscles[key as keyof typeof t.muscles] || group;
                    const finalKey = translatedGroup.charAt(0).toUpperCase() + translatedGroup.slice(1);
                    if (!grouped.has(finalKey)) grouped.set(finalKey, []);
                    grouped.get(finalKey)!.push(log);
                  });
                });

                return (
                  <Accordion type="multiple" defaultValue={Array.from(grouped.keys())} className="space-y-4">
                    {Array.from(grouped.entries()).map(([group, groupLogs]) => (
                      <AccordionItem key={group} value={group} className="border-none">
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                        >
                          <Card className="glass-card rounded-2xl overflow-hidden">
                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                  <Dumbbell className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-bold font-['Space_Grotesk']">{group}</p>
                                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                    {groupLogs.length} session{groupLogs.length !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-0 pb-0">
                              <div className="divide-y divide-border/50 border-t border-border/50">
                                {groupLogs.map((log) => {
                                  const exs = log.exercises as unknown as LogExercise[];
                                  const exerciseNames = Array.isArray(exs) ? exs.map((e) => e.name).join(", ") : "—";
                                  const vol = Array.isArray(exs)
                                    ? exs.reduce((a, ex) => a + (Array.isArray(ex.sets) ? ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0) : 0), 0)
                                    : 0;
                                  return (
                                    <div key={log.id} className="px-6 py-4 hover:bg-primary/5 transition-colors group/row">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-bold text-foreground truncate group-hover/row:text-primary transition-colors">
                                            {exerciseNames}
                                          </p>
                                          <div className="flex items-center gap-3 mt-1.5 grayscale opacity-60 group-hover/row:grayscale-0 group-hover/row:opacity-100 transition-all">
                                            <div className="flex items-center gap-1">
                                              <TrendingUp className="h-3 w-3 text-primary" />
                                              <span className="text-[10px] font-bold">{vol.toLocaleString()} kg</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Calendar className="h-3 w-3 text-muted-foreground" />
                                              <span className="text-[10px] font-bold">{new Date(log.completed_at).toLocaleDateString()}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 rounded-lg opacity-0 group-hover/row:opacity-100 transition-opacity"
                                          onClick={() => navigate(`/workout/${log.workout_plan_id}`)}
                                        >
                                          <ArrowLeft className="h-4 w-4 rotate-180" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </Card>
                        </motion.div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                );
              })()
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Progress;
