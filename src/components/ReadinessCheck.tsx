import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Battery, BatteryLow, AlertTriangle } from "lucide-react";

const READINESS_LABELS = [
  { label: "Exhausted", emoji: "😩", color: "text-red-400" },
  { label: "Tired", emoji: "😴", color: "text-orange-400" },
  { label: "Okay", emoji: "😐", color: "text-yellow-400" },
  { label: "Good", emoji: "😊", color: "text-green-400" },
  { label: "Energized!", emoji: "🔥", color: "text-primary" },
];

interface ReadinessCheckProps {
  onProceed: (readiness: number) => void;
  onRecovery: () => void;
}

const ReadinessCheck = ({ onProceed, onRecovery }: ReadinessCheckProps) => {
  const [readiness, setReadiness] = useState(3);
  const [showWarning, setShowWarning] = useState(false);

  const handleContinue = () => {
    if (readiness <= 2) {
      setShowWarning(true);
    } else {
      onProceed(readiness);
    }
  };

  const readinessData = READINESS_LABELS[readiness - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 space-y-6"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Battery className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Readiness Check</span>
        </div>
        <h2 className="text-xl font-bold font-['Space_Grotesk']">How are you feeling today?</h2>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <motion.span
            key={readiness}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl inline-block"
          >
            {readinessData.emoji}
          </motion.span>
          <motion.p
            key={`label-${readiness}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-lg font-bold mt-2 ${readinessData.color}`}
          >
            {readinessData.label}
          </motion.p>
        </div>

        <div className="px-2">
          <Slider
            value={[readiness]}
            onValueChange={(v) => {
              setReadiness(v[0]);
              setShowWarning(false);
            }}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-orange-400/30 bg-orange-400/10 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-400">You seem tired</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Want to switch to a 15-min Recovery session instead?
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onProceed(readiness)}
                  className="flex-1 text-xs"
                >
                  Continue anyway
                </Button>
                <Button
                  size="sm"
                  onClick={onRecovery}
                  className="flex-1 text-xs bg-orange-400 text-background hover:bg-orange-500"
                >
                  <BatteryLow className="h-3 w-3 mr-1" />
                  Recovery Session
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showWarning && (
        <Button onClick={handleContinue} className="w-full h-12 glow-primary font-semibold">
          Let's Go
        </Button>
      )}
    </motion.div>
  );
};

export default ReadinessCheck;
