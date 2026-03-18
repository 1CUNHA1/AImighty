import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, Dumbbell, Target, User, Ruler, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SMART_DEFAULTS = { weight: "75", height: "175", age: "25" };

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner", desc: "Less than 6 months" },
  { value: "intermediate", label: "Intermediate", desc: "6 months – 2 years" },
  { value: "advanced", label: "Advanced", desc: "2+ years" },
];

const GOAL_OPTIONS = [
  { value: "lose_weight", label: "Lose Weight", icon: "🔥" },
  { value: "build_muscle", label: "Build Muscle", icon: "💪" },
  { value: "maintain", label: "Maintain", icon: "⚖️" },
  { value: "improve_endurance", label: "Endurance", icon: "🏃" },
  { value: "increase_strength", label: "Strength", icon: "🏋️" },
];

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    weight: SMART_DEFAULTS.weight,
    height: SMART_DEFAULTS.height,
    age: SMART_DEFAULTS.age,
    experience: "",
    goal: "",
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        weight: parseFloat(form.weight),
        height: parseFloat(form.height),
        age: parseInt(form.age),
        experience: form.experience,
        goal: form.goal,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile saved! Let's build your workouts.");
      navigate("/dashboard");
    }
    setSaving(false);
  };

  const canProceed = () => {
    if (step === 0) return form.weight && form.height && form.age;
    if (step === 1) return form.experience;
    if (step === 2) return form.goal;
    return false;
  };

  const next = () => {
    if (step < 2) setStep(step + 1);
    else handleSave();
  };

  const applyDefaults = () => {
    setForm((prev) => ({
      ...prev,
      weight: prev.weight || SMART_DEFAULTS.weight,
      height: prev.height || SMART_DEFAULTS.height,
      age: prev.age || SMART_DEFAULTS.age,
    }));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 relative">
      {/* Top Navigation */}
      <div className="absolute top-4 left-4">
        <Button 
          variant="ghost" 
          onClick={() => {
            supabase.auth.signOut();
            navigate("/");
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
          Sign Out
        </Button>
      </div>

      <div className="w-full max-w-md space-y-8 mt-12">
        {/* Progress */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary glow-primary" : "bg-secondary"
                }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Ruler className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">Step 1 of 3</span>
                </div>
                <h2 className="text-3xl font-bold font-['Space_Grotesk']">Your Body Stats</h2>
                <p className="text-muted-foreground">Help us personalize your workouts</p>
              </div>

              {/* Smart Defaults Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={applyDefaults}
                className="flex w-full items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <Zap className="h-4 w-4" />
                Use Smart Defaults (adjust later in profile)
              </motion.button>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" placeholder="75" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="h-12 bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input type="number" placeholder="175" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="h-12 bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" placeholder="25" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="h-12 bg-secondary border-border" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">Step 2 of 3</span>
                </div>
                <h2 className="text-3xl font-bold font-['Space_Grotesk']">Experience Level</h2>
                <p className="text-muted-foreground">We'll adjust intensity accordingly</p>
              </div>
              <div className="space-y-3">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <motion.div key={opt.value} whileTap={{ scale: 0.98 }}>
                    <Card
                      className={`cursor-pointer transition-all border-2 ${form.experience === opt.value
                          ? "border-primary glow-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                        }`}
                      onClick={() => setForm({ ...form, experience: opt.value })}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-semibold">{opt.label}</p>
                          <p className="text-sm text-muted-foreground">{opt.desc}</p>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${form.experience === opt.value ? "border-primary" : "border-muted-foreground/30"}`}>
                          {form.experience === opt.value && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Target className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">Step 3 of 3</span>
                </div>
                <h2 className="text-3xl font-bold font-['Space_Grotesk']">Your Goal</h2>
                <p className="text-muted-foreground">What are you training for?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((opt) => (
                  <motion.div key={opt.value} whileTap={{ scale: 0.97 }}>
                    <Card
                      className={`cursor-pointer transition-all border-2 ${form.goal === opt.value
                          ? "border-primary glow-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                        } ${opt.value === "increase_strength" ? "col-span-2" : ""}`}
                      onClick={() => setForm({ ...form, goal: opt.value })}
                    >
                      <CardContent className="flex items-center gap-3 p-4">
                        <span className="text-2xl">{opt.icon}</span>
                        <p className="font-semibold">{opt.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 h-12">
              Back
            </Button>
          )}
          <Button
            onClick={next}
            disabled={!canProceed() || saving}
            className="flex-1 h-12 gap-2 glow-primary"
          >
            {step === 2 ? (saving ? "Saving..." : "Get Started") : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
