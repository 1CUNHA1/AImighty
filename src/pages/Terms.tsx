import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight font-['Space_Grotesk']">Terms & Conditions / Termos</span>
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
            <h2 className="text-xl font-bold text-primary font-['Space_Grotesk']">1. MEDICAL DISCLAIMER / AVISO MÉDICO (⚠️ CRITICAL)</h2>
            <div className="space-y-2 text-sm text-foreground/90 leading-relaxed">
              <p>
                **EN**: Almighty is an artificial intelligence-assisted workout planning tool. **We are not licensed medical professionals, doctors, or certified trainers.** The routines, advice, and sets generated are suggestions for informational purposes only. You must consult a qualified physician before starting any exercise regimen. You use this application and proceed with generated workouts entirely at your own risk.
              </p>
              <p>
                **PT**: O Almighty é uma ferramenta de planeamento de treinos assistida por inteligência artificial. **Não somos profissionais de saúde, médicos ou treinadores certificados.** As rotinas e conselhos gerados são sugestões apenas para fins informativos. Deve consultar um médico qualificado antes de iniciar qualquer regime de exercícios. Utiliza esta aplicação e os treinos gerados inteiramente por sua conta e risco.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-border/40 pt-6">
            <h2 className="text-lg font-bold font-['Space_Grotesk']">2. ASSUMPTION OF RISK / ASSUNÇÃO DE RISCO</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>
                **EN**: By utilizing our services, you explicitly acknowledge that physical exercise carries inherent risks of injury, exhaustion, or health complications. You voluntarily assume all responsibility and liability for any injuries, direct or indirect, resulting from executing routines provided by the AI.
              </p>
              <p>
                **PT**: Ao utilizar os nossos serviços, reconhece explicitamente que o exercício físico acarreta riscos inerentes de lesões ou esgotamento. Assume voluntariamente toda a responsabilidade por quaisquer lesões resultantes da execução das rotinas geradas pela IA.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-border/40 pt-6">
            <h2 className="text-lg font-bold font-['Space_Grotesk']">3. NO GUARANTEE OF RESULTS / AUSÊNCIA DE GARANTIAS</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>
                **EN**: Muscle growth, weight loss, or endurance thresholds vary according to individual nutrition, genetics, and consistency. Almighty does not guarantee specific fit results or timeline milestones.
              </p>
              <p>
                **PT**: O crescimento muscular ou perda de peso varia consoante a nutrição e genética individuais. O Almighty não garante resultados específicos ou prazos.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-border/40 pt-6">
            <h2 className="text-lg font-bold font-['Space_Grotesk']">4. USER ACCOUNTS & CODE OF CONDUCT / USO INDEVIDO</h2>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>
                **EN**: You are solely responsible for securing your login credentials. Abuse of AI endpoints, bulk downloading datasets, or attempting to reverse engineer the application violates these Terms and triggers immediate suspension.
              </p>
              <p>
                **PT**: É responsável pela segurança das suas credenciais. O abuso de endpoints de IA ou tentativas de engenharia reversa violam estes termos e provocam suspensão imediata.
              </p>
            </div>
          </section>

          <section className="space-y-3 border-t border-border/40 pt-6">
            <h2 className="text-lg font-bold font-['Space_Grotesk']">5. GOVERNING LAW / LEI APLICÁVEL</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms shall be governed according to state and local laws of the application owner's operating address / Prazos regulados pelas leis da sede de operação.
            </p>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Terms;
