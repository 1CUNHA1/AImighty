import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, Zap } from "lucide-react";

export type CoPilotIssue = {
  type: "warning" | "info" | "success";
  message: string;
};

type CoPilotInsightsProps = {
  planMuscleGroups: string[];
  exercises: { name: string; primary_muscle?: string }[];
};

export default function CoPilotInsights({ planMuscleGroups, exercises }: CoPilotInsightsProps) {
  const getInsights = (): CoPilotIssue[] => {
    const issues: CoPilotIssue[] = [];
    const exerciseMuscles = new Set(
      exercises
        .map((e) => e.primary_muscle?.toLowerCase())
        .filter(Boolean) as string[]
    );

    const targetMusclesLower = planMuscleGroups.map((m) => m.toLowerCase());

    // Heuristic 1: Missing target muscles
    targetMusclesLower.forEach((targetMuscle) => {
      // Basic matching (could be expanded based on your exercise mapping)
      const hasMatch = Array.from(exerciseMuscles).some((em) => 
        em.includes(targetMuscle) || targetMuscle.includes(em)
      );
      
      if (!hasMatch && targetMuscle !== "full body") {
        issues.push({
          type: "warning",
          message: `Missing ${targetMuscle.charAt(0).toUpperCase() + targetMuscle.slice(1)} exercises.`,
        });
      }
    });

    // Heuristic 2: Too much volume
    if (exercises.length > 8) {
      issues.push({
        type: "warning",
        message: "High volume detected (>8 exercises). Watch out for overtraining.",
      });
    } else if (exercises.length < 3) {
      issues.push({
        type: "info",
        message: "Low volume. Consider adding more exercises or increasing sets.",
      });
    }

    // Heuristic 3: Unexpected muscles (if not full body)
    if (!targetMusclesLower.includes("full body")) {
      exerciseMuscles.forEach((em) => {
        const isExpected = targetMusclesLower.some((target) => 
          em.includes(target) || target.includes(em)
        );
        if (!isExpected && em !== "other") {
           issues.push({
             type: "info",
             message: `Found ${em} exercises, but this is a ${planMuscleGroups.join("/")} day.`,
           });
        }
      });
    }
    
    // Heuristic 4: Success state
    if (issues.length === 0) {
      issues.push({
        type: "success",
        message: "Plan looks perfectly balanced! Get mighty.",
      });
    }

    return issues;
  };

  const insights = getInsights();

  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary font-['Space_Grotesk']">
          AImighty Co-Pilot
        </span>
      </div>
      <AnimatePresence mode="popLayout">
        {insights.map((insight, idx) => (
          <motion.div
            key={`${insight.message}-${idx}`}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            className={`flex items-start gap-3 rounded-xl p-3 border backdrop-blur-md ${
              insight.type === "warning"
                ? "bg-destructive/10 border-destructive/30 text-destructive"
                : insight.type === "success"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-blue-500/10 border-blue-500/30 text-blue-400"
            }`}
          >
            {insight.type === "warning" ? (
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            ) : insight.type === "success" ? (
              <Zap className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <p className="text-xs font-medium leading-relaxed">{insight.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
