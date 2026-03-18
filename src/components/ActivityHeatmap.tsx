import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActivityHeatmapProps {
  logs: { completed_at: string }[];
  daysToShow?: number;
}

const ActivityHeatmap = ({ logs, daysToShow = 168 }: ActivityHeatmapProps) => {
  const days = Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysToShow - 1 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const getIntensity = (date: Date) => {
    const count = logs.filter(l => {
      const logDate = new Date(l.completed_at);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === date.getTime();
    }).length;

    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    return 3;
  };

  const getColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-secondary/40';
      case 1: return 'bg-primary/30';
      case 2: return 'bg-primary/60';
      case 3: return 'bg-primary';
      default: return 'bg-secondary/40';
    }
  };

  // Group days into weeks for column-based layout
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  // To align weeks correctly (starting from Monday or Sunday), 
  // we might need more complex logic, but for a simple "last X days" 
  // we can just chunk them into 7s.
  days.forEach((day, i) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <TooltipProvider delayDuration={0}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1.5 shrink-0">
              {week.map((day, dayIndex) => {
                const intensity = getIntensity(day);
                return (
                  <Tooltip key={dayIndex}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                        className={`h-3 w-3 rounded-[2px] ${getColor(intensity)} transition-colors duration-300 hover:ring-2 hover:ring-primary/50`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px] font-medium glass-card border-border/50">
                      <p>{day.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-primary">{intensity} workout{intensity !== 1 ? 's' : ''}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium uppercase tracking-wider px-1">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-[1px] bg-secondary/40" />
          <span>Less</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-[1px] bg-primary/30" />
          <div className="h-2 w-2 rounded-[1px] bg-primary/60" />
          <div className="h-2 w-2 rounded-[1px] bg-primary" />
          <span className="ml-0.5">More</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
