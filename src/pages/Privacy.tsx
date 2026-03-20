import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight font-['Space_Grotesk']">Privacy Policy / Privacidade</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[75vh]"
        >
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary font-['Space_Grotesk']">1. DATA COLLECTION / RECOLHA DE DADOS (GDPR/RGPD)</h2>
            <div className="space-y-2 text-sm text-foreground/90 leading-relaxed">
              <p>
                **EN**: We explicitly collect information you provide to configure personalized fitness algorithms: **Email Address**, **Encrypted Password**, **Weight**, **Height**, **Age**, **Target Fitness Goals**, and **Logged Workouts History**. 
              </p>
              <p>
                **PT**: Recolhemos dados fornecidos explicitamente para configurar algoritmos de fitness personalizados: **Email**, **Palavra-passe Encriptada**, **Peso**, **Altura**, **Idade**, **Objetivos**, e **Histórico de Treinos**.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-border/40 pt-6">
            <h2 className="text-lg font-bold font-['Space_Grotesk']">2. AI ENDPOINT PROCESSING / PROCESSAMENTO DE IA</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>
                **EN**: To generate custom routines, metrics (weight, goals, body stats) are securely forwarded as prompts to **Google Gemini API** endpoints. Your email or passwords are never shared with AI models. Google states API data is encrypted in transit and not utilized for training models.
              </p>
              <p>
                **PT**: Para gerar rotinas, métricas (peso, objetivos) são enviadas com segurança para a **API Google Gemini**. O seu email ou palavra-passe nunca são partilhados com os modelos de IA.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-border/40 pt-6">
            <h2 className="text-lg font-bold font-['Space_Grotesk']">3. DATA SECURITY & STORAGE / ARMAZENAMENTO</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>
                **EN**: Your information sits behind encrypted standard Postgres database servers operated securely on the **Supabase** infrastructure stack. Backups are automatic and locked.
              </p>
              <p>
                **PT**: As suas informações estão guardadas em servidores Postgres encriptados na infraestrutura do **Supabase**.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-border/40 pt-6">
            <h2 className="text-lg font-bold font-['Space_Grotesk']">4. USER RIGHTS & RETENTION / DIREITO AO ESQUECIMENTO</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>
                **EN**: You maintain complete sovereignty over your profiles. Under GDPR frameworks, you have the **Right to Erasure**; users can request comprehensive data wipeouts and account deletion instantly.
              </p>
              <p>
                **PT**: Mantém soberania sobre o seu perfil. Sob o RGPD, tem o **Direito ao Esquecimento**; pode solicitar a limpeza total de dados e eliminação de conta.
              </p>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Privacy;
