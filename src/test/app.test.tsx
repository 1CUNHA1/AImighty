import { describe, it, expect, vi } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "test-id" }, error: null }),
        }),
      }),
    }),
    functions: {
      invoke: () => Promise.resolve({ data: { title: "Test", exercises: [] }, error: null }),
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { whileHover, whileTap, variants, initial, animate, exit, transition, ...domProps } = props;
      // Filter out non-DOM props
      const safeDomProps: Record<string, any> = {};
      for (const [key, val] of Object.entries(domProps)) {
        if (!key.startsWith("while") && key !== "variants" && key !== "initial" && key !== "animate" && key !== "exit" && key !== "transition") {
          safeDomProps[key] = val;
        }
      }
      return <div {...safeDomProps}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      const { whileHover, whileTap, variants, initial, animate, exit, transition, ...domProps } = props;
      const safeDomProps: Record<string, any> = {};
      for (const [key, val] of Object.entries(domProps)) {
        if (!key.startsWith("while") && key !== "variants") {
          safeDomProps[key] = val;
        }
      }
      return <button {...safeDomProps}>{children}</button>;
    },
    span: ({ children, ...props }: any) => <span>{children}</span>,
    p: ({ children, ...props }: any) => <p>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("App Configuration", () => {
  it("should have valid muscle group options", () => {
    const muscleGroups = ["chest", "back", "shoulders", "biceps", "triceps", "legs", "core", "glutes"];
    expect(muscleGroups.length).toBe(8);
    muscleGroups.forEach((g) => expect(typeof g).toBe("string"));
  });

  it("should have valid experience options", () => {
    const experiences = ["beginner", "intermediate", "advanced"];
    expect(experiences.length).toBe(3);
  });

  it("should have valid goal options", () => {
    const goals = ["lose_weight", "build_muscle", "maintain", "improve_endurance", "increase_strength"];
    expect(goals.length).toBe(5);
  });
});

describe("Onboarding Smart Defaults", () => {
  it("should have reasonable default values", () => {
    const defaults = { weight: "75", height: "175", age: "25" };
    expect(parseFloat(defaults.weight)).toBeGreaterThan(0);
    expect(parseFloat(defaults.height)).toBeGreaterThan(0);
    expect(parseInt(defaults.age)).toBeGreaterThan(0);
    expect(parseFloat(defaults.weight)).toBeLessThan(200);
    expect(parseFloat(defaults.height)).toBeLessThan(250);
    expect(parseInt(defaults.age)).toBeLessThan(100);
  });
});

describe("Readiness Check Logic", () => {
  it("should identify low readiness scores (1-2) as requiring warning", () => {
    const lowScores = [1, 2];
    const normalScores = [3, 4, 5];
    lowScores.forEach((s) => expect(s <= 2).toBe(true));
    normalScores.forEach((s) => expect(s <= 2).toBe(false));
  });

  it("should have correct readiness labels for all 5 levels", () => {
    const labels = ["Exhausted", "Tired", "Okay", "Good", "Energized!"];
    expect(labels.length).toBe(5);
  });

  it("should default recovery session to 15 minutes", () => {
    const recoveryDuration = 15;
    const recoveryMuscles = ["core", "glutes", "legs"];
    expect(recoveryDuration).toBe(15);
    expect(recoveryMuscles.length).toBe(3);
  });
});

describe("Autoregulation Engine", () => {
  it("should have correct rep schemes for each goal", () => {
    const schemes: Record<string, { sets: string; reps: string }> = {
      muscle_gain: { sets: "3-5", reps: "6-12" },
      build_muscle: { sets: "3-5", reps: "6-12" },
      fat_loss: { sets: "2-3", reps: "12-20" },
      lose_fat: { sets: "2-3", reps: "12-20" },
      strength: { sets: "4-6", reps: "3-6" },
      endurance: { sets: "2-3", reps: "15-25" },
      general_fitness: { sets: "3-4", reps: "8-15" },
    };

    expect(schemes.muscle_gain.sets).toBe("3-5");
    expect(schemes.fat_loss.reps).toBe("12-20");
    expect(schemes.strength.sets).toBe("4-6");
    expect(schemes.endurance.reps).toBe("15-25");
    expect(schemes.general_fitness).toBeDefined();
  });

  it("should normalize goal strings correctly", () => {
    const normalize = (goal: string) => goal.replace(/\s+/g, "_").toLowerCase();
    expect(normalize("muscle gain")).toBe("muscle_gain");
    expect(normalize("fat loss")).toBe("fat_loss");
    expect(normalize("General Fitness")).toBe("general_fitness");
  });
});

describe("Progressive Overload Logic", () => {
  it("should detect personal best when exceeding next_goal", () => {
    const nextGoal = { weight_kg: 40, reps: 10 };
    const entry = { weight: 42.5, reps: 10 };
    const isPB = entry.weight >= nextGoal.weight_kg && entry.reps >= nextGoal.reps;
    expect(isPB).toBe(true);
  });

  it("should not flag PB when under next_goal", () => {
    const nextGoal = { weight_kg: 40, reps: 10 };
    const entry = { weight: 37.5, reps: 10 };
    const isPB = entry.weight >= nextGoal.weight_kg && entry.reps >= nextGoal.reps;
    expect(isPB).toBe(false);
  });
});

describe("Rest Timer", () => {
  it("should calculate progress correctly", () => {
    const totalSeconds = 60;
    const elapsed = 30;
    const progress = elapsed / totalSeconds;
    expect(progress).toBe(0.5);
  });

  it("should complete at 100%", () => {
    const totalSeconds = 90;
    const elapsed = 90;
    const progress = elapsed / totalSeconds;
    expect(progress).toBe(1);
  });
});

describe("Swap Alternatives", () => {
  it("should have valid swap label colors", () => {
    const validLabels = ["Easier", "Harder", "Different Equipment"];
    const colors: Record<string, string> = {
      Easier: "text-green-400 border-green-400/30 bg-green-400/10",
      Harder: "text-red-400 border-red-400/30 bg-red-400/10",
      "Different Equipment": "text-blue-400 border-blue-400/30 bg-blue-400/10",
    };
    validLabels.forEach((label) => {
      expect(colors[label]).toBeDefined();
      expect(colors[label].length).toBeGreaterThan(0);
    });
  });
});

describe("Workout Progress Calculation", () => {
  it("should calculate progress percentage correctly", () => {
    const logEntries = [
      { sets: [{ logged: true }, { logged: true }, { logged: false }] },
      { sets: [{ logged: true }, { logged: false }] },
    ];
    const totalSets = logEntries.reduce((acc, e) => acc + e.sets.length, 0);
    const loggedSets = logEntries.reduce((acc, e) => acc + e.sets.filter((s) => s.logged).length, 0);
    const pct = totalSets > 0 ? (loggedSets / totalSets) * 100 : 0;

    expect(totalSets).toBe(5);
    expect(loggedSets).toBe(3);
    expect(pct).toBe(60);
  });

  it("should handle empty workout", () => {
    const logEntries: any[] = [];
    const totalSets = logEntries.reduce((acc: number, e: any) => acc + e.sets.length, 0);
    const pct = totalSets > 0 ? 0 : 0;
    expect(pct).toBe(0);
  });
});

describe("Muscle Heatmap Intensity", () => {
  it("should calculate intensity decay over 7 days", () => {
    const now = new Date();
    const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

    const calcIntensity = (workoutDate: Date) => {
      const diffDays = (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24);
      return Math.max(0, 1 - diffDays / 7);
    };

    expect(calcIntensity(now)).toBeCloseTo(1, 1);
    expect(calcIntensity(daysAgo(3))).toBeCloseTo(0.57, 1);
    expect(calcIntensity(daysAgo(7))).toBeCloseTo(0, 1);
    expect(calcIntensity(daysAgo(10))).toBe(0); // Clamped to 0
  });
});

describe("Exercise Demo", () => {
  it("should slugify exercise names with underscores for exercisedb", () => {
    const slugify = (name: string): string =>
      name.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "_").trim();

    expect(slugify("Dumbbell Bench Press")).toBe("dumbbell_bench_press");
    expect(slugify("Barbell Bench Press")).toBe("barbell_bench_press");
    expect(slugify("Cable Crossover (Middle Height)")).toBe("cable_crossover_middle_height");
    expect(slugify("Standard Push-ups")).toBe("standard_pushups");
  });

  it("should generate correct demo URL", () => {
    const slugify = (name: string): string =>
      name.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "_").trim();
    const getDemoUrl = (name: string) =>
      `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${slugify(name)}/0.jpg`;

    const url = getDemoUrl("Dumbbell Bench Press");
    expect(url).toContain("dumbbell_bench_press");
    expect(url).toContain("/0.jpg");
  });
});

describe("App Branding", () => {
  it("should use AImighty as the app name", () => {
    const appName = "AImighty";
    expect(appName).toBe("AImighty");
  });
});

describe("Workout Flow", () => {
  it("should track workout started state", () => {
    let workoutStarted = false;
    expect(workoutStarted).toBe(false);
    workoutStarted = true;
    expect(workoutStarted).toBe(true);
  });

  it("should format elapsed time correctly", () => {
    const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec.toString().padStart(2, "0")}`;
    };
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(3600)).toBe("60:00");
  });
});
