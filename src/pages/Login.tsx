import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dumbbell, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Login = () => {
  const { user, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRegister = searchParams.get("mode") === "register";

  const setIsRegister = (val: boolean) => {
    setSearchParams(val ? { mode: "register" } : {});
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        toast.success(t.login.checkEmail);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message || t.login.authFailed);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === "en" ? "pt" : "en")}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          {language === "en" ? "PT 🇵🇹" : "EN 🇬🇧"}
        </Button>
      </div>

      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 overflow-hidden">
            <img src="/logo.png" className="h-full w-full object-cover" alt="AImighty Logo" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Almighty
          </h1>
          <p className="text-muted-foreground">
            {t.login.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="fullName">{t.login.fullName}</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12 rounded-xl border-border bg-card"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t.login.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl border-border bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.login.password}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 rounded-xl border-border bg-card"
            />
          </div>
          {isRegister && (
            <div className="flex items-start gap-2 pt-1 pb-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-xs text-muted-foreground font-normal leading-snug cursor-pointer">
                {t.login.agreeTo}{" "}
                <Link to="/terms" className="text-primary hover:underline underline-offset-4">
                  {t.login.terms}
                </Link>{" "}
                {t.login.and}{" "}
                <Link to="/privacy" className="text-primary hover:underline underline-offset-4">
                  {t.login.privacy}
                </Link>.
              </Label>
            </div>
          )}
          <Button
            type="submit"
            disabled={submitting || (isRegister && !agreed)}
            size="lg"
            className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 glow-primary text-base font-semibold h-14"
          >
            {submitting ? t.common.loading : isRegister ? t.login.createAccount : t.common.signIn}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          {isRegister ? t.login.alreadyHaveAccount : t.login.dontHaveAccount}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-primary underline-offset-4 hover:underline font-medium"
          >
            {isRegister ? t.common.signIn : t.common.register}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
