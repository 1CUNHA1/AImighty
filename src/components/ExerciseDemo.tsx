import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import exerciseMappingData from "@/data/exercise_mapping.json";

/** Map common exercise names to ExerciseDB IDs */
const EXERCISE_MAPPING: Record<string, string> = exerciseMappingData;

export function getDemoUrl(name: string, id?: string): string | null {
  const normalized = name.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\([^)]+\)/g, '') // Remove bracketed text like (Two-Hand)
    .replace('dumbell', 'dumbbell')
    .replace('flies', 'fly')
    .replace(/\boverhead\b/g, '') // Disregard overhead modifier for fallback matching
    .trim();

  // 1. Try exact match in static mapping for 100% visual integrity against AI ID hallucinations
  let foundId = EXERCISE_MAPPING[normalized];

  // 2. Fallback to AI-provided ID if direct lookup fails (e.g., Portuguese translations)
  if (!foundId && id) {
    foundId = id;
  }

  // 3. Try singular match (remove 's' at end)
  if (!foundId && normalized.endsWith('s')) {
    foundId = EXERCISE_MAPPING[normalized.slice(0, -1)];
  }

  // 4. Fallback: Word-level or substring matching
  if (!foundId) {
    const getBaseWords = (str: string) => 
      str.split(' ').filter(Boolean).map(w => w.replace(/^biceps$/, 'bicep').replace(/^triceps$/, 'tricep').replace(/s$/, ''));

    const normalizedWords = getBaseWords(normalized);

    const key = Object.keys(EXERCISE_MAPPING).find(k => {
      const kWords = getBaseWords(k);
      
      if (normalizedWords.length > 1 && normalizedWords.every(word => kWords.includes(word))) return true;
      if (kWords.length > 1 && kWords.every(word => normalizedWords.includes(word))) return true;

      return false;
    });
    if (key) foundId = EXERCISE_MAPPING[key];
  }

  if (!foundId) return null;
  return `https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/assets/${foundId}.gif`;
}

type ExerciseDemoProps = {
  name: string;
  id?: string;
  primaryMuscle?: string;
  coachingCues?: string[];
};

/** Full glassmorphism modal for exercise demo */
export function ExerciseDemoModal({ name, id, primaryMuscle, coachingCues }: ExerciseDemoProps) {
  const [open, setOpen] = useState(false);
  const gifUrl = getDemoUrl(name, id);

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => setOpen(true)}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
        aria-label={`View demo for ${name}`}
      >
        <Play className="h-3 w-3" />
      </motion.button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-card border-primary/20 max-w-md p-0 overflow-hidden sm:rounded-2xl">
          <div className="sr-only">
            <DialogHeader>
              <DialogTitle>{name}</DialogTitle>
              <DialogDescription>Exercise demonstration and coaching cues</DialogDescription>
            </DialogHeader>
          </div>
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Animation / Not Found */}
            <div className="relative aspect-[4/3] w-full bg-secondary overflow-hidden">
              {gifUrl ? (
                <img
                  src={gifUrl}
                  alt={`${name} demonstration`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground p-8 text-center bg-secondary/50">
                  <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-semibold text-foreground">Demonstration not found</p>
                  <p className="text-xs">We don't have a video for "{name}" yet.</p>
                </div>
              )}
            </div>

            <div className="space-y-4 p-5 text-left">
              <h3 className="text-lg font-bold font-['Space_Grotesk'] text-foreground">
                {name}
              </h3>

              {primaryMuscle && (
                <Badge className="border-primary/30 bg-primary/15 text-primary font-semibold text-xs border border-primary/20">
                  {primaryMuscle}
                </Badge>
              )}

              {coachingCues && coachingCues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Coaching Cues
                  </p>
                  <ul className="space-y-1.5">
                    {coachingCues.map((cue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {cue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Quick preview thumbnail on long-press */
export function QuickPreview({ name, id, children }: { name: string; id?: string; children?: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const gifUrl = getDemoUrl(name, id);
  let pressTimer: ReturnType<typeof setTimeout>;

  const handlePointerDown = () => {
    if (!gifUrl) return;
    pressTimer = setTimeout(() => setShow(true), 500);
  };

  const handlePointerUp = () => {
    clearTimeout(pressTimer);
    setShow(false);
  };

  return (
    <span
      className="relative cursor-pointer select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
      <AnimatePresence>
        {show && gifUrl && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="absolute bottom-full left-0 z-[60] mb-2 w-48 overflow-hidden rounded-xl border border-primary/20 shadow-2xl bg-secondary"
            style={{ pointerEvents: "none" }}
          >
            <div className="aspect-square w-full">
              <img
                src={gifUrl}
                alt={`${name} quick preview`}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
