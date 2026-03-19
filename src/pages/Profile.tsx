import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, Dumbbell, Globe } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    weight: "",
    height: "",
    age: "",
    experience: "",
    goal: "",
  });

  const EXPERIENCE_OPTIONS = [
    { value: "beginner", label: t.experience.beginner, desc: t.experience.beginnerDesc },
    { value: "intermediate", label: t.experience.intermediate, desc: t.experience.intermediateDesc },
    { value: "advanced", label: t.experience.advanced, desc: t.experience.advancedDesc },
  ];

  const GOAL_OPTIONS = [
    { value: "lose_weight", label: t.goals.lose_weight, icon: "🔥" },
    { value: "build_muscle", label: t.goals.build_muscle, icon: "💪" },
    { value: "maintain", label: t.goals.maintain, icon: "⚖️" },
    { value: "improve_endurance", label: t.goals.improve_endurance, icon: "🏃" },
    { value: "increase_strength", label: t.goals.increase_strength, icon: "🏋️" },
  ];

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setForm({
          full_name: data.full_name || "",
          weight: data.weight?.toString() || "",
          height: data.height?.toString() || "",
          age: data.age?.toString() || "",
          experience: data.experience || "",
          goal: data.goal || "",
        });
      }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        weight: form.weight ? parseFloat(form.weight) : null,
        height: form.height ? parseFloat(form.height) : null,
        age: form.age ? parseInt(form.age) : null,
        experience: form.experience || null,
        goal: form.goal || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error(t.profile.updateFailed);
    } else {
      toast.success(t.profile.profileUpdated);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Dumbbell className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.profile.title}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {/* Language Selector */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{t.profile.language}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "en" as const, label: "English", flag: "🇬🇧" },
              { value: "pt" as const, label: "Português", flag: "🇵🇹" },
            ].map((opt) => (
              <Card
                key={opt.value}
                className={`cursor-pointer transition-all border-2 ${
                  language === opt.value
                    ? "border-primary glow-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
                onClick={() => setLanguage(opt.value)}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <span className="text-xl">{opt.flag}</span>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold text-sm">{opt.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label>{t.profile.fullName}</Label>
          <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="h-12 bg-secondary border-border" placeholder={t.profile.fullName} />
        </div>

        {/* Body Stats */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{t.profile.bodyStats}</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>{t.onboarding.weight}</Label>
              <Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="h-12 bg-secondary border-border" placeholder="75" />
            </div>
            <div className="space-y-2">
              <Label>{t.onboarding.height}</Label>
              <Input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="h-12 bg-secondary border-border" placeholder="180" />
            </div>
            <div className="space-y-2">
              <Label>{t.onboarding.age}</Label>
              <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="h-12 bg-secondary border-border" placeholder="25" />
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{t.profile.experienceLevel}</h2>
          <div className="space-y-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <Card
                key={opt.value}
                className={`cursor-pointer transition-all border-2 ${
                  form.experience === opt.value
                    ? "border-primary glow-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
                onClick={() => setForm({ ...form, experience: opt.value })}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${form.experience === opt.value ? "border-primary" : "border-muted-foreground/30"}`}>
                    {form.experience === opt.value && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{t.profile.goal}</h2>
          <div className="grid grid-cols-2 gap-3">
            {GOAL_OPTIONS.map((opt) => (
              <Card
                key={opt.value}
                className={`cursor-pointer transition-all border-2 ${
                  form.goal === opt.value
                    ? "border-primary glow-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                } ${opt.value === "increase_strength" ? "col-span-2" : ""}`}
                onClick={() => setForm({ ...form, goal: opt.value })}
              >
                <CardContent className="flex items-center gap-2 p-3">
                  <span className="text-lg">{opt.icon}</span>
                  <p className="font-semibold text-sm">{opt.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full h-14 text-base font-semibold gap-2 glow-primary rounded-xl">
          <Save className="h-5 w-5" />
          {saving ? t.common.saving : t.common.save}
        </Button>
      </main>
    </div>
  );
};

export default Profile;
