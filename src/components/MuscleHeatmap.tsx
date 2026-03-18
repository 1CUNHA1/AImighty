import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Maximize2, RotateCcw, Zap } from "lucide-react";

type MuscleIntensity = Record<string, number>; // 0-1

interface MuscleHeatmapProps {
  logs: Array<{
    exercises: unknown;
    completed_at: string;
  }>;
}

const MUSCLE_KEYWORD_MAP: Record<string, string[]> = {
  chest: ["bench", "chest", "push-up", "pushup", "fly", "pec", "dip"],
  shoulders: ["shoulder", "press", "delt", "lateral raise", "overhead", "arnold"],
  biceps: ["bicep", "curl", "hammer", "preacher"],
  triceps: ["tricep", "extension", "skull", "dip", "pushdown", "kickback"],
  forearms: ["forearm", "wrist", "grip", "carry"],
  abs: ["ab", "crunch", "plank", "core", "sit-up", "situp", "leg raise", "hanging"],
  obliques: ["oblique", "twist", "russian", "side bend"],
  quads: ["quad", "squat", "leg press", "lunge", "extension", "hack squat"],
  hamstrings: ["hamstring", "deadlift", "leg curl", "rdl", "romanian", "good morning"],
  glutes: ["glute", "hip thrust", "bridge", "squat", "kickback", "sumo"],
  calves: ["calf", "calves", "raise", "donkey"],
  lats: ["lat", "pull-up", "pullup", "pulldown", "lat pulldown"],
  traps: ["trap", "shrug", "upright row"],
  "lower-back": ["lower back", "back extension", "hyperextension", "deadlift", "superman"],
  "upper-back": ["row", "pull", "back", "rear delt", "face pull", "t-bar"],
};

// High-fidelity Anatomical SVG Path Data (Anterior)
const ANTERIOR_DATA = [
  { muscle: 'chest', points: ['51.8 41.6 51.0 55.1 57.9 57.9 67.7 55.5 70.6 47.3 62.0 41.6', '29.7 46.5 31.4 55.5 40.8 57.9 48.1 55.1 47.7 42.0 37.5 42.0'] },
  { muscle: 'obliques', points: ['68.5 63.2 67.3 57.1 58.7 59.5 60.0 64.0 60.4 83.2 65.7 78.7 66.5 69.7', '33.8 78.3 33.0 71.8 31.0 63.2 32.2 57.1 40.8 59.1 39.1 63.2 39.1 83.6'] },
  { muscle: 'abs', points: ['56.3 59.1 57.9 64.0 58.3 77.9 58.3 92.6 56.3 98.3 55.1 104.0 51.4 107.7 51.0 84.4 50.6 67.3 51.0 57.1', '43.6 58.7 48.5 57.1 48.9 67.3 48.5 84.4 48.1 107.3 44.4 103.6 40.8 91.4 40.8 78.3 41.2 64.4'] },
  { muscle: 'biceps', points: ['16.7 68.1 17.9 71.4 22.8 66.1 28.9 53.8 27.7 49.3 20.4 55.9', '71.4 49.3 70.2 54.6 76.3 66.1 81.6 71.8 82.8 68.9 78.7 55.5'] },
  { muscle: 'triceps', points: ['69.3 55.5 69.3 61.6 75.9 72.6 77.5 70.2 75.5 67.3', '22.4 69.3 29.7 55.5 29.7 60.8 22.8 73.0'] },
  { muscle: 'traps', points: ['55.5 23.6 50.6 33.4 50.6 39.1 61.6 40.0 70.6 44.8 69.3 36.7 63.2 35.1 58.3 30.6', '28.9 44.8 30.2 37.1 36.3 35.1 41.2 30.2 44.4 24.4 48.9 33.8 48.5 39.1 37.9 39.5'] },
  { muscle: 'shoulders', points: ['78.3 53.0 79.5 47.7 79.1 41.2 75.9 37.9 71.0 36.3 72.2 42.8 71.4 47.3', '28.1 47.3 21.2 53.0 20.0 47.7 20.4 40.8 24.4 37.1 28.5 37.1 26.9 43.2'] },
  { muscle: 'quads', points: ['34.6 98.7 37.1 108.1 37.1 127.7 34.2 137.1 31.0 132.6 29.3 120.0 28.1 111.4 29.3 100.8 32.2 94.6', '63.2 105.7 64.4 100.0 66.9 94.6 70.2 101.2 71.0 111.8 68.1 133.0 65.3 137.5 62.4 128.5 62.0 111.4', '38.7 129.3 38.3 112.2 41.2 118.3 44.4 129.3 42.8 135.1 40.0 146.1 36.3 146.5 35.5 140.0', '59.5 145.7 55.5 128.9 60.8 113.8 61.2 130.2 64.0 139.5 62.8 146.5', '32.6 138.3 26.5 145.7 25.7 136.7 25.7 127.3 26.9 114.2 29.3 133.4', '71.8 113.0 73.8 124.0 73.8 140.4 72.6 145.7 66.5 138.3 70.2 133.4'] },
  { muscle: 'calves', points: ['71.4 160.4 73.4 153.4 76.7 161.2 79.5 167.7 78.3 187.7 79.5 195.5 74.6 195.5', '24.8 194.6 27.7 164.8 28.1 160.4 26.1 154.2 24.8 157.5 22.4 161.6 20.8 167.7 22.0 188.1 20.8 195.5', '72.6 195.1 69.7 159.1 65.3 158.3 64.0 162.4 64.0 165.3 65.7 177.1', '35.5 158.3 35.9 162.4 35.9 166.9 35.1 172.2 35.1 176.7 32.2 182.0 30.6 187.3 26.9 194.6 27.3 187.7 28.1 180.4 28.5 175.5 28.9 169.7 29.7 164.0 30.2 158.7'] },
  { muscle: 'forearms', points: ['6.1 88.5 10.2 75.1 14.6 70.2 16.3 74.2 19.1 73.4 4.4 97.5 0.0 100.0', '84.4 69.7 83.2 73.4 80.0 73.0 95.1 98.3 100.0 100.4 93.4 89.3 89.7 76.3', '77.5 72.2 77.5 77.5 80.4 84.0 85.3 89.7 92.2 101.2 94.6 99.5', '6.9 101.2 13.4 90.6 18.7 84.0 21.6 77.1 21.2 71.8 4.8 98.7'] },
];

const POSTERIOR_DATA = [
  { muscle: 'traps', points: ['44.6 21.7 47.6 21.7 47.2 38.2 47.6 64.6 38.2 53.1 35.3 40.8 31.0 36.5 39.1 33.1 43.8 27.2', '52.3 21.7 55.7 21.7 56.5 27.2 60.8 32.7 68.9 36.5 64.6 40.4 61.7 53.1 52.3 64.6 53.1 38.2'] },
  { muscle: 'shoulders', points: ['29.3 37.0 22.9 39.1 17.4 44.2 18.2 53.6 24.2 49.3 27.2 46.3', '71.0 37.0 78.2 39.5 82.5 44.6 81.7 53.6 74.8 48.9 72.3 45.1'] },
  { muscle: 'upper-back', points: ['31.0 38.7 28.0 48.9 28.5 55.3 34.0 75.3 47.2 71.0 47.2 66.3 36.5 54.0 33.6 41.2', '68.9 38.7 71.9 49.3 71.4 56.1 65.9 75.3 52.7 71.0 52.7 66.3 63.4 54.4 66.3 41.7'] },
  { muscle: 'triceps', points: ['26.8 49.7 17.8 55.7 14.4 72.3 16.5 81.7 21.7 63.8 26.8 55.7', '73.6 50.2 82.1 55.7 85.9 73.1 83.4 82.1 77.8 62.9 73.1 55.7', '26.8 58.2 26.8 68.5 22.9 75.3 19.1 77.4 22.5 65.5', '72.7 58.2 77.0 64.6 80.4 77.4 76.5 75.3 72.7 68.9'] },
  { muscle: 'lower-back', points: ['47.6 72.7 34.4 77.0 35.3 83.4 49.3 102.1 46.8 82.9', '52.3 72.7 65.5 77.0 64.6 83.4 50.6 102.1 53.1 83.8'] },
  { muscle: 'forearms', points: ['86.3 75.7 91.0 83.4 93.1 94.0 100.0 106.3 96.1 104.2 88.0 89.3 84.2 83.8', '13.6 75.7 8.9 83.8 6.8 93.6 0.0 106.3 3.8 104.2 12.3 88.5 15.7 82.9', '81.2 79.5 77.4 77.8 79.1 84.6 91.0 103.8 93.1 108.9 94.4 104.6', '18.7 79.5 22.1 77.8 20.8 84.2 9.3 102.9 6.8 108.5 5.1 104.6'] },
  { muscle: 'glutes', points: ['44.6 99.5 30.2 108.5 29.7 118.7 31.4 125.9 47.2 121.2 49.3 114.8', '55.3 99.1 51.0 114.4 52.3 120.8 68.0 125.9 69.7 119.1 69.3 108.5'] },
  { muscle: 'hamstrings', points: ['28.9 122.1 31.0 129.3 36.5 125.9 35.3 135.3 34.4 150.2 29.3 158.2 28.9 146.8 27.6 141.2 27.2 131.4', '71.4 121.7 69.3 128.9 63.8 125.9 65.5 136.5 66.3 150.2 71.0 158.2 71.4 147.6 72.7 142.1 73.6 131.9', '38.7 125.5 44.2 145.9 40.4 166.8 36.1 152.7 37.0 135.3', '61.7 125.5 63.4 136.1 64.2 153.1 60.0 166.8 56.1 146.3'] },
  { muscle: 'calves', points: ['29.3 160.4 28.5 167.2 24.6 179.5 23.8 192.7 25.5 197.0 28.5 193.1 29.7 180.0 31.9 171.0 31.9 166.8', '37.4 165.1 35.3 167.6 33.1 171.9 31.0 180.4 30.2 191.9 34.0 200.0 38.7 190.6 39.1 168.9', '62.9 165.1 61.2 168.5 61.7 190.6 66.3 199.5 70.6 191.9 68.9 179.5 66.8 170.2', '70.6 160.4 72.3 168.5 75.7 179.1 76.5 192.7 74.4 196.5 72.3 193.6 70.6 179.5 68.0 168.0', '28.5 195.7 30.2 195.7 33.6 201.7 30.6 220.0 28.5 213.6 26.8 198.2', '69.7 195.7 71.9 195.7 73.6 198.2 71.9 213.1 70.2 219.5 67.2 202.1'] },
];

function extractMuscleIntensities(logs: MuscleHeatmapProps["logs"]): MuscleIntensity {
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const intensities: MuscleIntensity = {};

  for (const log of logs) {
    const daysSince = (now - new Date(log.completed_at).getTime()) / (24 * 60 * 60 * 1000);
    if (daysSince > 7) continue;

    const recency = Math.max(0, 1 - daysSince / 7);
    const exercises = log.exercises as Array<{ name?: string }>;
    if (!Array.isArray(exercises)) continue;

    for (const ex of exercises) {
      const name = (ex.name || "").toLowerCase();
      for (const [muscle, keywords] of Object.entries(MUSCLE_KEYWORD_MAP)) {
        if (keywords.some((kw) => name.includes(kw))) {
          intensities[muscle] = Math.min(1, (intensities[muscle] || 0) + recency * 0.4);
        }
      }
    }
  }
  return intensities;
}

const MuscleHeatmap = ({ logs }: MuscleHeatmapProps) => {
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');
  const intensities = useMemo(() => extractMuscleIntensities(logs), [logs]);

  const getColor = (muscle: string) => {
    const intensity = intensities[muscle] || 0;
    if (intensity === 0) return "hsl(var(--secondary))";
    return `hsl(var(--primary) / ${0.2 + intensity * 0.8})`;
  };

  const getGlow = (muscle: string) => {
    const intensity = intensities[muscle] || 0;
    if (intensity < 0.1) return "none";
    return `0 0 ${10 + intensity * 20}px hsl(var(--primary) / ${intensity * 0.5})`;
  };

  const muscleStyle = (muscle: string) => ({
    fill: getColor(muscle),
    filter: intensities[muscle] > 0.1 ? `drop-shadow(${getGlow(muscle)})` : "none",
    transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "help",
  });

  const activeData = view === 'anterior' ? ANTERIOR_DATA : POSTERIOR_DATA;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary/20" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Intensity</span>
          </div>
          <div className="flex -space-x-1">
            {[0, 0.3, 0.7, 1].map((val) => (
              <div
                key={val}
                className="h-1.5 w-4 first:rounded-l-full last:rounded-r-full"
                style={{ background: `hsl(var(--primary) / ${0.2 + val * 0.8})` }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-secondary/50 p-1 rounded-lg border border-border/50">
          <button
            onClick={() => setView('anterior')}
            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all ${view === 'anterior' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Front
          </button>
          <button
            onClick={() => setView('posterior')}
            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all ${view === 'posterior' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Back
          </button>
        </div>
      </div>

      <div className="relative mx-auto w-full aspect-[1/2] max-w-[240px]">
        {/* Decorative background grid */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 100%, hsl(var(--primary) / 0.2), transparent 70%)' }} />

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <svg viewBox="0 0 100 220" className="w-full h-full drop-shadow-2xl">
              {/* Common Body Frame (Head/Neck) */}
              <g opacity="0.3">
                <ellipse cx="50" cy="12" rx="9" ry="11" fill="hsl(var(--muted))" />
                <rect x="46" y="22" width="8" height="7" rx="2" fill="hsl(var(--muted))" />
              </g>

              {activeData.map((group) => (
                <g key={group.muscle}>
                  {group.points.map((pts, i) => (
                    <polygon
                      key={`${group.muscle}-${i}`}
                      points={pts}
                      style={muscleStyle(group.muscle)}
                      className="hover:brightness-125 hover:scale-[1.01] transition-all origin-center"
                    >
                      <title>{group.muscle.toUpperCase()} - {Math.round((intensities[group.muscle] || 0) * 100)}% Intensity</title>
                    </polygon>
                  ))}
                </g>
              ))}
            </svg>
          </motion.div>
        </AnimatePresence>

        {/* Floating Stat badges for peak muscles */}
        <div className="absolute top-4 -right-12 flex flex-col gap-2 pointer-events-none">
          {Object.entries(intensities)
            .sort(([, a], [, b]) => b - a)
            .filter(([, v]) => v > 0.1)
            .slice(0, 4)
            .map(([muscle, intensity], idx) => (
              <motion.div
                key={muscle}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center gap-2 px-2 py-1 rounded-full bg-background/40 backdrop-blur-md border border-primary/20"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary glow-primary" />
                <span className="text-[10px] font-bold uppercase tracking-tight text-foreground/80">{muscle}</span>
              </motion.div>
            ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-50">
          Pulse Anatomical Visualization
        </p>
      </div>
    </div>
  );
};

export default MuscleHeatmap;
