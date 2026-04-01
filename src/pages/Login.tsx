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

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{t.common.orContinueWith || "Or continue with"}</span>
          </div>
        </div>

        <Button
          type="button"
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/dashboard`
              }
            });
          }}
          variant="outline"
          className="w-full h-14 rounded-xl font-semibold border-border bg-card hover:bg-accent/50"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>

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

      <p className="mt-12 pb-4 text-[11px] text-muted-foreground/40">
        © 2026 Almighty
      </p>
    </div>
  );
};

export default Login;
