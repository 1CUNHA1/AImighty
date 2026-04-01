export type Language = "en" | "pt";

const translations = {
  en: {
    // Common
    common: {
      save: "Save Changes",
      saving: "Saving...",
      back: "Back",
      continue: "Continue",
      cancel: "Cancel",
      delete: "Delete",
      signOut: "Sign Out",
      signIn: "Sign In",
      register: "Register",
      loading: "Please wait...",
      athlete: "Athlete",
      level: "level",
      min: "min",
    },

    // Login
    login: {
      subtitle: "AI-powered workout plans built for your goals. Let's get MIGHTY!",
      fullName: "Full Name",
      email: "Email",
      password: "Password",
      createAccount: "Create Account",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      checkEmail: "Check your email to confirm your account!",
      authFailed: "Authentication failed.",
      agreeTo: "I agree to the",
      terms: "Terms of Service",
      and: "and",
      privacy: "Privacy Policy",
    },

    // Onboarding
    onboarding: {
      stepOf: "Step {step} of 3",
      bodyStats: "Your Body Stats",
      bodyStatsDesc: "Help us personalize your workouts",
      smartDefaults: "Use Smart Defaults (adjust later in profile)",
      weight: "Weight (kg)",
      height: "Height (cm)",
      age: "Age",
      experienceLevel: "Experience Level",
      experienceDesc: "We'll adjust intensity accordingly",
      yourGoal: "Your Goal",
      goalDesc: "What are you training for?",
      getStarted: "Get Started",
      profileSaved: "Profile saved! Let's build your workouts.",
      profileFailed: "Failed to save profile",
    },

    // Experience Options
    experience: {
      beginner: "Beginner",
      beginnerDesc: "Less than 6 months",
      intermediate: "Intermediate",
      intermediateDesc: "6 months – 2 years",
      advanced: "Advanced",
      advancedDesc: "2+ years",
    },

    // Goal Options
    goals: {
      lose_weight: "Lose Weight",
      build_muscle: "Build Muscle",
      maintain: "Maintain",
      improve_endurance: "Endurance",
      increase_strength: "Strength",
    },

    // Muscle Groups
    muscles: {
      chest: "Chest",
      back: "Back",
      shoulders: "Shoulders",
      biceps: "Biceps",
      triceps: "Triceps",
      quads: "Quads",
      hamstrings: "Hamstrings",
      calves: "Calves",
      core: "Core",
      glutes: "Glutes",
    },

    // Dashboard
    dashboard: {
      welcome: "Welcome, {name}",
      subtitle: "Ready to get mighty?",
      currentGoal: "Current Goal",
      generalFitness: "General Fitness",
      sessionsThisWeek: "{count} sessions this week",
      getMighty: "GET MIGHTY",
      generateWorkout: "Generate a Workout",
      createFirst: "Create your first AI-powered session",
      thisWeek: "This Week",
      totalLogged: "Total Logged",
      plans: "Plans",
      intensityMap: "7-Day Intensity Map",
      newPlan: "New Workout Plan",
      recentPlans: "Recent Plans",
      noPlans: "No workout plans yet. Generate your first one!",
      deletePlanTitle: "Delete Workout Plan?",
      deletePlanDesc: "This action cannot be undone. This will permanently delete your workout plan and all associated data.",
      deletePlan: "Delete Plan",
      deleting: "Deleting...",
      planDeleted: "Workout plan deleted",
      deleteFailed: "Failed to delete workout plan",
      progress: "Progress",
    },

    // Generate
    generate: {
      title: "Generate Workout",
      targetMuscles: "Target Muscles",
      duration: "Duration",
      generateBtn: "Create My Workout ⚡",
      generating: "AI is building your workout...",
      lowEnergy: "⚠️ Low energy detected — consider lighter weights today",
      workoutGenerated: "Workout generated!",
      generateFailed: "Failed to generate workout",
      recoverySwitched: "Switched to a 15-min recovery session",
    },

    // Readiness Check
    readiness: {
      title: "Readiness Check",
      question: "How are you feeling today?",
      exhausted: "Exhausted",
      tired: "Tired",
      okay: "Okay",
      good: "Good",
      energized: "Energized!",
      low: "Low",
      high: "High",
      letsGo: "Let's Go",
      youSeemTired: "You seem tired",
      recoveryPrompt: "Want to switch to a 15-min Recovery session instead?",
      continueAnyway: "Continue anyway",
      recoverySession: "Recovery Session",
    },

    // Profile
    profile: {
      title: "Edit Profile",
      fullName: "Full Name",
      bodyStats: "Body Stats",
      experienceLevel: "Experience Level",
      goal: "Goal",
      language: "Language",
      profileUpdated: "Profile updated!",
      updateFailed: "Failed to update profile",
    },

    // Progress
    progress: {
      title: "Progress",
      currentStreak: "Current Streak",
      totalWorkouts: "Total Workouts",
      totalVolume: "Total Volume",
      daysTraining: "Days Training",
      days: "days",
      sessions: "sessions",
      tons: "tons",
      activityIntensity: "Activity Intensity",
      activityDesc: "Your workout consistency over the last 6 months",
      consistency: "{consistency}% Consistency",
      percentageDaysActive: "Percentage of days active in the last 24 weeks",
      volumeTrend: "Volume Trend",
      volumeDesc: "Weighted volume growth over the last 8 weeks",
      sessionHistory: "Session History",
      showingLast30: "Showing last 30",
      noWorkouts: "No workouts logged yet. Time to get mighty!",
    },

    // Notifications
    notifications: {
      inbox: "Inbox",
      markAllRead: "Mark all read",
      noMessages: "No messages yet.",
      newMessage: "New Motivation Co-Pilot message received! 🚀",
      generated: "Motivation generated!",
      generateFailed: "Failed to generate motivation",
    },

    // Chatbot
    chatbot: {
      title: "AI Coach",
      placeholder: "Ask me anything about fitness...",
      send: "Send",
    },
  },

  pt: {
    // Common
    common: {
      save: "Guardar Alterações",
      saving: "A guardar...",
      back: "Voltar",
      continue: "Continuar",
      cancel: "Cancelar",
      delete: "Eliminar",
      signOut: "Terminar Sessão",
      signIn: "Entrar",
      register: "Registar",
      loading: "Aguarde...",
      athlete: "Atleta",
      level: "nível",
      min: "min",
    },

    // Login
    login: {
      subtitle: "Planos de treino com IA para os teus objetivos. Vamos ficar MIGHTY!",
      fullName: "Nome Completo",
      email: "Email",
      password: "Palavra-passe",
      createAccount: "Criar Conta",
      alreadyHaveAccount: "Já tens uma conta?",
      dontHaveAccount: "Não tens conta?",
      checkEmail: "Verifica o teu email para confirmar a conta!",
      authFailed: "Falha na autenticação.",
      agreeTo: "Eu concordo com os",
      terms: "Termos de Serviço",
      and: "e a",
      privacy: "Política de Privacidade",
    },

    // Onboarding
    onboarding: {
      stepOf: "Passo {step} de 3",
      bodyStats: "As Tuas Medidas",
      bodyStatsDesc: "Ajuda-nos a personalizar os teus treinos",
      smartDefaults: "Usar valores padrão (ajustar depois no perfil)",
      weight: "Peso (kg)",
      height: "Altura (cm)",
      age: "Idade",
      experienceLevel: "Nível de Experiência",
      experienceDesc: "Vamos ajustar a intensidade",
      yourGoal: "O Teu Objetivo",
      goalDesc: "Para que estás a treinar?",
      getStarted: "Começar",
      profileSaved: "Perfil guardado! Vamos criar os teus treinos.",
      profileFailed: "Erro ao guardar o perfil",
    },

    // Experience Options
    experience: {
      beginner: "Iniciante",
      beginnerDesc: "Menos de 6 meses",
      intermediate: "Intermédio",
      intermediateDesc: "6 meses – 2 anos",
      advanced: "Avançado",
      advancedDesc: "2+ anos",
    },

    // Goal Options
    goals: {
      lose_weight: "Perder Peso",
      build_muscle: "Ganhar Músculo",
      maintain: "Manter",
      improve_endurance: "Resistência",
      increase_strength: "Força",
    },

    // Muscle Groups
    muscles: {
      chest: "Peito",
      back: "Costas",
      shoulders: "Ombros",
      biceps: "Bíceps",
      triceps: "Tríceps",
      quads: "Quadríceps",
      hamstrings: "Posteriores",
      calves: "Gémeos",
      core: "Abdómen",
      glutes: "Glúteos",
    },

    // Dashboard
    dashboard: {
      welcome: "Bem-vindo, {name}",
      subtitle: "Pronto para ficar mighty?",
      currentGoal: "Objetivo Atual",
      generalFitness: "Fitness Geral",
      sessionsThisWeek: "{count} sessões esta semana",
      getMighty: "TREINAR",
      generateWorkout: "Gerar um Treino",
      createFirst: "Cria a tua primeira sessão com IA",
      thisWeek: "Esta Semana",
      totalLogged: "Total",
      plans: "Planos",
      intensityMap: "Mapa de Intensidade (7 dias)",
      newPlan: "Novo Plano de Treino",
      recentPlans: "Planos Recentes",
      noPlans: "Ainda não tens planos. Gera o teu primeiro!",
      deletePlanTitle: "Eliminar Plano de Treino?",
      deletePlanDesc: "Esta ação não pode ser revertida. O plano e todos os dados associados serão eliminados permanentemente.",
      deletePlan: "Eliminar Plano",
      deleting: "A eliminar...",
      planDeleted: "Plano de treino eliminado",
      deleteFailed: "Erro ao eliminar plano de treino",
      progress: "Progresso",
    },

    // Generate
    generate: {
      title: "Gerar Treino",
      targetMuscles: "Músculos Alvo",
      duration: "Duração",
      generateBtn: "Criar o Meu Treino ⚡",
      generating: "A IA está a criar o teu treino...",
      lowEnergy: "⚠️ Energia baixa detetada — considera pesos mais leves hoje",
      workoutGenerated: "Treino gerado!",
      generateFailed: "Erro ao gerar treino",
      recoverySwitched: "Mudado para sessão de recuperação de 15 min",
    },

    // Readiness Check
    readiness: {
      title: "Verificação de Prontidão",
      question: "Como te sentes hoje?",
      exhausted: "Exausto",
      tired: "Cansado",
      okay: "Normal",
      good: "Bem",
      energized: "Cheio de Energia!",
      low: "Baixo",
      high: "Alto",
      letsGo: "Bora!",
      youSeemTired: "Pareces cansado",
      recoveryPrompt: "Queres mudar para uma sessão de recuperação de 15 min?",
      continueAnyway: "Continuar mesmo assim",
      recoverySession: "Sessão de Recuperação",
    },

    // Profile
    profile: {
      title: "Editar Perfil",
      fullName: "Nome Completo",
      bodyStats: "Medidas Corporais",
      experienceLevel: "Nível de Experiência",
      goal: "Objetivo",
      language: "Idioma",
      profileUpdated: "Perfil atualizado!",
      updateFailed: "Erro ao atualizar perfil",
    },

    // Progress
    progress: {
      title: "Progresso",
      currentStreak: "Sequência Atual",
      totalWorkouts: "Total de Treinos",
      totalVolume: "Volume Total",
      daysTraining: "Dias de Treino",
      days: "dias",
      sessions: "sessões",
      tons: "toneladas",
      activityIntensity: "Intensidade da Atividade",
      activityDesc: "Consistência de treinos nos últimos 6 meses",
      consistency: "{consistency}% Consistência",
      percentageDaysActive: "Percentual de dias ativos nas últimas 24 semanas",
      volumeTrend: "Tendência de Volume",
      volumeDesc: "Crescimento de volume ponderado nas últimas 8 semanas",
      sessionHistory: "Histórico de Sessões",
      showingLast30: "A mostrar as últimas 30",
      noWorkouts: "Nenhum treino registado. Hora de ficar mighty!",
    },

    // Notifications
    notifications: {
      inbox: "Caixa de Entrada",
      markAllRead: "Marcar tudo como lido",
      noMessages: "Sem mensagens.",
      newMessage: "Nova mensagem do Co-Pilot recebida! 🚀",
      generated: "Motivação gerada!",
      generateFailed: "Erro ao gerar motivação",
    },

    // Chatbot
    chatbot: {
      title: "Treinador IA",
      placeholder: "Pergunta-me qualquer coisa sobre fitness...",
      send: "Enviar",
    },
  },
};

export type TranslationKey = keyof typeof translations.en;
export default translations;
