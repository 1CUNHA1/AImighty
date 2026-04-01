import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RestTimerProps {
  seconds: number;
  onComplete: () => void;
  isOpen: boolean;
}

const RestTimer = ({ seconds, onComplete, isOpen }: RestTimerProps) => {
  const [remaining, setRemaining] = useState(seconds);
  const [isFinished, setIsFinished] = useState(false);
  
  const onCompleteRef = React.useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset when open/close state changes
  useEffect(() => {
    if (!isOpen) {
      setRemaining(seconds);
      setIsFinished(false);
    }
  }, [isOpen, seconds]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isFinished) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isFinished]);

  // Completion delay
  useEffect(() => {
    if (isFinished && isOpen) {
      const timeout = setTimeout(() => {
        onCompleteRef.current();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isFinished, isOpen]);

  const progress = isOpen ? (seconds - remaining) / seconds : 0;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Label */}
            <motion.p
              className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
              animate={{ opacity: isFinished ? 0 : 1 }}
            >
              Rest Timer
            </motion.p>

            {/* Circular progress */}
            <div className="relative flex items-center justify-center">
              <svg width="220" height="220" className="-rotate-90">
                {/* Background circle */}
                <circle
                  cx="110"
                  cy="110"
                  r="90"
                  fill="none"
                  stroke="hsl(220 15% 18%)"
                  strokeWidth="6"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="110"
                  cy="110"
                  r="90"
                  fill="none"
                  stroke="hsl(175 85% 50%)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ filter: "drop-shadow(0 0 8px hsla(175, 85%, 50%, 0.5))" }}
                />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isFinished ? (
                    <motion.div
                      key="go"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <motion.p
                        className="text-4xl font-black font-['Space_Grotesk'] text-primary"
                        animate={{
                          scale: [1, 1.15, 1],
                          textShadow: [
                            "0 0 20px hsla(175, 85%, 50%, 0.5)",
                            "0 0 40px hsla(175, 85%, 50%, 0.8)",
                            "0 0 20px hsla(175, 85%, 50%, 0.5)",
                          ],
                        }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        GO!
                      </motion.p>
                      <p className="mt-1 text-xs text-muted-foreground">Start next set</p>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="time"
                      className="text-5xl font-bold font-['Space_Grotesk'] tabular-nums text-foreground"
                    >
                      {formatTime(remaining)}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Skip button */}
            {!isFinished && (
              <motion.button
                onClick={onComplete}
                whileTap={{ scale: 0.95 }}
                className="rounded-full border border-border px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                Skip Rest
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RestTimer;
