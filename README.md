# AImighty 🏋️‍♂️ — AI-Powered Fitness Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB%20%2B%20Edge-3ECF8E?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-FF6F00?logo=google)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)](https://aimighty.vercel.app)

> A cutting-edge, AI-powered fitness assistant that generates hyper-personalized workout plans, provides real-time exercise demonstrations, and sends intelligent motivational notifications — all wrapped in a premium glassmorphism dark-mode interface.

**🔗 Live App:** [almightyapp.pt](https://www.almightyapp.pt)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Edge Functions](#edge-functions)
- [Getting Started](#getting-started)
- [Deployment (Vercel)](#deployment-vercel)
- [Environment Variables](#environment-variables)
- [Acknowledgments](#acknowledgments)

---

## Overview

AImighty is a full-stack web application designed to be a personal AI gym coach. It combines three core systems working together:

### 1. AI Workout Engine (Gemini 2.5 Flash)
The user selects target muscle groups and preferences. Gemini generates a structured workout plan with exercises pulled from a verified database of **1,318 exercises**, each mapped to an animated GIF demonstration. The AI uses strict ExerciseDB IDs to guarantee 100% video coverage — no broken links, no missing demos.

### 2. AI Motivational Co-Pilot (Supabase Edge Function + `pg_cron`)
An autonomous background system that runs daily via a Supabase database cron job. It scans every active user's workout history, detects behavioral patterns (streaks, inactivity, milestones, extreme dedication hours), and calls Gemini to generate a short, personalized push notification delivered in real-time via Supabase Realtime subscriptions.

### 3. Interactive Workout Builder
A drag-and-drop interface where users can manually build custom routines. The builder features smart exercise filtering based on the plan's target muscle groups and AI-powered insights via the Co-Pilot panel.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Frontend (Vercel — React + Vite)                 │
│                                                                      │
│   Login · Onboarding · Dashboard · Generate · Workout · Progress     │
│   Profile · AI Chatbot (floating) · Notification Center (bell)       │
│                                                                      │
│   ┌────────────────┐  ┌──────────────────┐  ┌────────────────────┐   │
│   │  Auth Context   │  │  React Query     │  │  Supabase Realtime │   │
│   │  (Supabase Auth)│  │  (Data Fetching) │  │  (Live Notifs)     │   │
│   └────────────────┘  └──────────────────┘  └────────────────────┘   │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ Supabase JS Client (Anon Key + RLS)
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  Supabase (Auth + PostgreSQL + Edge Functions)        │
│                                                                      │
│   ┌─────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│   │  Auth        │  │  Database (RLS)  │  │  Edge Functions         │  │
│   │  Email/Pass  │  │  profiles        │  │  generate-workout       │  │
│   │  + OAuth     │  │  workout_plans   │  │  generate-motivation    │  │
│   │             │  │  workout_logs    │  │  chat                   │  │
│   │             │  │  app_notifications│  │                         │  │
│   └─────────────┘  └─────────────────┘  └────────────┬────────────┘  │
│                                                       │              │
│   ┌──────────────────────┐          ┌─────────────────▼────────────┐ │
│   │  pg_cron (Daily)      │─────────▶│  generate-motivation         │ │
│   │  Triggers motivation  │          │  Scans all users → Gemini    │ │
│   │  check automatically │          │  → Saves to app_notifications │ │
│   └──────────────────────┘          └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    Google Gemini 2.5 Flash API
              (Workout generation + Motivation + Chat)
```

---

## Key Features

### AI Workout Generation
*   Powered by **Google Gemini 2.5 Flash** with structured JSON output
*   Selects exercises from a verified pool of **1,318 exercises** mapped to ExerciseDB IDs
*   100% animated GIF coverage guaranteed — the AI is prompted with the exact ID database
*   Smart fuzzy matching fallback for legacy support (typos, pluralization)

### AI Motivational Co-Pilot
*   Runs autonomously via `pg_cron` — zero manual intervention required
*   Analyzes each user's `workout_logs` and triggers personalized AI messages:

| Trigger | Condition | Example AI Message |
|---|---|---|
| 🎉 **Milestone** | 10th, 50th, or 100th workout logged | *"Double digits! You just hit 10 workouts 💪"* |
| 🔥 **Streak** | 3+ workouts in the last 7 days | *"Three days strong, keep this fire alive! 🔥"* |
| 🛌 **Recovery** | 5+ consecutive training days | *"Your muscles grow during rest, take today off! 😴"* |
| ⏰ **Dedication** | Training before 6 AM or after 10 PM | *"Training at 4 AM, that's elite discipline! ⏰"* |
| ⚠️ **Inactivity** | No workouts logged in 3+ days | *"It's been a few days, let's get back at it! 🏋️"* |
| 👋 **Welcome** | New user with 0 workouts | *"Welcome! Time to crush your first session! 🚀"* |

*   Delivered in real-time via **Supabase Realtime** subscriptions to the Notification Bell

### Exercise Demonstrations
*   1,300+ animated GIFs sourced from the [ExerciseDB dataset](https://github.com/omercotkd/exercises-gifs)
*   Mapped via `exercise_mapping.json` (53KB, 1,318 entries)
*   Muscle-group indexed via `exercises_by_muscle.json` (218KB)

### Interactive Co-Pilot Builder
*   Drag-and-drop workout creation with reorder support
*   Smart exercise search filtered by the plan's target muscle groups
*   AI-generated insights panel analyzing the workout composition

### Activity Tracking & Progress
*   Workout logging with per-exercise set/rep/weight tracking
*   Visual progress dashboard with activity heatmaps
*   Muscle group heatmap showing training distribution
*   Rest timer with audio alerts

### Premium UI
*   Glassmorphism dark-mode interface
*   Framer Motion animations and micro-interactions
*   Fully responsive — works on desktop, tablet, and mobile
*   Shadcn/UI component library with Radix primitives

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 5 |
| **Styling** | Tailwind CSS, Framer Motion, Lucide Icons, Shadcn/UI (Radix) |
| **State** | React Query (TanStack), React Context (Auth) |
| **Backend** | Supabase (Auth, PostgreSQL, Edge Functions, Realtime, `pg_cron`) |
| **AI** | Google Gemini 2.5 Flash API |
| **Hosting** | Vercel (frontend), Supabase Cloud (backend) |
| **Exercise Data** | [ExerciseDB GIFs](https://github.com/omercotkd/exercises-gifs) |

---

## Database Schema

All tables use **Row Level Security (RLS)** — users can only access their own data. A `SECURITY DEFINER` trigger automatically creates a blank profile row when a user registers.

### `profiles`
| Column | Type | Description |
|---|---|---|
| `user_id` | UUID (FK → auth.users) | Link to Supabase Auth |
| `full_name` | TEXT | User's display name |
| `weight` | NUMERIC | Body weight (kg) |
| `height` | NUMERIC | Height (cm) |
| `age` | INTEGER | Age |
| `experience` | TEXT | `beginner`, `intermediate`, `advanced` |
| `goal` | TEXT | `lose_weight`, `build_muscle`, `maintain`, etc. |
| `onboarding_completed` | BOOLEAN | Whether the user finished onboarding |
| `notification_preferences` | BOOLEAN | Enable/disable AI notifications |

### `workout_plans`
| Column | Type | Description |
|---|---|---|
| `user_id` | UUID (FK → auth.users) | Owner |
| `title` | TEXT | Plan name |
| `muscle_groups` | TEXT[] | Target muscle groups array |
| `duration_minutes` | INTEGER | Estimated duration |
| `exercises` | JSONB | Full exercise list with sets, reps, and ExerciseDB IDs |

### `workout_logs`
| Column | Type | Description |
|---|---|---|
| `user_id` | UUID (FK → auth.users) | Who completed it |
| `workout_plan_id` | UUID (FK → workout_plans) | Which plan was followed |
| `exercises` | JSONB | Actual performed sets/reps/weights |
| `notes` | TEXT | Optional session notes |
| `completed_at` | TIMESTAMPTZ | When the workout was completed |

### `app_notifications`
| Column | Type | Description |
|---|---|---|
| `user_id` | UUID (FK → auth.users) | Recipient |
| `title` | TEXT | Trigger category (e.g., `Streak`, `Milestone`) |
| `message` | TEXT | AI-generated notification text |
| `read` | BOOLEAN | Whether the user has seen it |

---

## Project Structure

```
AImighty/
│
├── README.md                              # This file
├── vercel.json                            # SPA routing rewrite rules
├── package.json                           # Dependencies and scripts
├── vite.config.ts                         # Vite build configuration
├── tailwind.config.ts                     # Tailwind theme + custom colors
├── tsconfig.json                          # TypeScript configuration
│
│  ─── Frontend ────────────────────────────────────────────────────────
├── src/
│   ├── main.tsx                           # React entry point
│   ├── App.tsx                            # Router + providers + protected routes
│   ├── index.css                          # Global styles + Tailwind directives
│   │
│   ├── pages/
│   │   ├── Login.tsx                      # Email/password auth with redirect logic
│   │   ├── Onboarding.tsx                 # 3-step onboarding (body stats → xp → goals)
│   │   ├── Dashboard.tsx                  # Main hub: plans, heatmap, notifications
│   │   ├── Generate.tsx                   # AI workout generation interface
│   │   ├── WorkoutDetail.tsx              # Full workout view + exercise demos + logging
│   │   ├── Progress.tsx                   # Activity heatmap + muscle distribution
│   │   ├── Profile.tsx                    # User settings + notification preferences
│   │   └── NotFound.tsx                   # 404 fallback
│   │
│   ├── components/
│   │   ├── NotificationCenter.tsx         # 🔔 Real-time AI notification bell (Realtime sub)
│   │   ├── Chatbot.tsx                    # 💬 Floating AI chat assistant
│   │   ├── ExerciseDemo.tsx               # 🎬 Animated GIF player + fuzzy ID matching
│   │   ├── AddExerciseModal.tsx           # ➕ Smart exercise search (muscle-filtered)
│   │   ├── CoPilotInsights.tsx            # 🤖 AI analysis panel for workout builder
│   │   ├── MuscleHeatmap.tsx              # 🔥 SVG body map showing trained muscles
│   │   ├── ActivityHeatmap.tsx            # 📊 GitHub-style contribution grid
│   │   ├── ReadinessCheck.tsx             # ✅ Pre-workout readiness survey
│   │   ├── RestTimer.tsx                  # ⏱️ Configurable rest timer with sound
│   │   └── ui/                            # Shadcn/UI primitives (button, dialog, etc.)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx                # Supabase Auth session provider
│   │
│   ├── data/
│   │   ├── exercise_mapping.json          # 1,318 exercise → ExerciseDB ID mappings
│   │   └── exercises_by_muscle.json       # Exercises indexed by muscle group
│   │
│   ├── integrations/supabase/
│   │   ├── client.ts                      # Supabase client initialization
│   │   └── types.ts                       # Auto-generated TypeScript types for DB schema
│   │
│   └── hooks/
│       ├── use-mobile.tsx                 # Responsive breakpoint hook
│       └── use-toast.ts                   # Toast notification hook
│
│  ─── Backend (Supabase) ─────────────────────────────────────────────
├── supabase/
│   ├── config.toml                        # Supabase project configuration
│   │
│   ├── migrations/
│   │   ├── 20260304_initial_schema.sql    # profiles, workout_plans, workout_logs + RLS
│   │   └── 20260317_notifications.sql     # app_notifications table + notification prefs
│   │
│   └── functions/
│       ├── generate-workout/              # AI workout plan generator (Gemini)
│       │   └── index.ts                   # Receives muscle groups → returns JSONB plan
│       │
│       ├── generate-motivation/           # AI motivational notification engine
│       │   └── index.ts                   # pg_cron triggered: scan users → Gemini → notify
│       │
│       └── chat/                          # AI chat assistant backend
│           └── index.ts                   # Conversational endpoint for the floating chatbot
│
│  ─── Configuration ──────────────────────────────────────────────────
├── .env                                   # Secrets (NEVER committed — in .gitignore)
├── .gitignore                             # Protects .env, node_modules, dist, test scripts
└── components.json                        # Shadcn/UI component registry config
```

---

## Edge Functions

AImighty uses three Supabase Edge Functions deployed to the Supabase Cloud:

### `generate-workout`
*   **Trigger:** Called by the frontend when the user clicks "Generate Plan"
*   **Input:** Muscle groups, duration, experience level
*   **Process:** Prompts Gemini with the full ExerciseDB mapping to generate a structured workout
*   **Output:** JSONB exercise array with names, sets, reps, and ExerciseDB IDs

### `generate-motivation`
*   **Trigger:** `pg_cron` daily schedule (autonomous) or manual HTTP call
*   **Auth:** Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and scan all users
*   **Process:**
    1. Fetches all profiles with `notification_preferences = true`
    2. For each user, fetches their last 100 `workout_logs`
    3. Evaluates 6 trigger conditions (milestone, streak, recovery, inactivity, dedication, welcome)
    4. Calls Gemini with the matched scenario context
    5. Saves the AI-generated message to `app_notifications`
*   **Output:** `{ success: true, notificationsCreated: N }`

### `chat`
*   **Trigger:** Called by the floating chatbot component
*   **Process:** Conversational AI assistant for real-time fitness guidance

#### Deploying Edge Functions

```sh
npx supabase functions deploy generate-workout
npx supabase functions deploy generate-motivation
npx supabase functions deploy chat
```

---

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18+)
*   [Bun](https://bun.sh/) (recommended) or npm
*   [Supabase CLI](https://supabase.com/docs/guides/cli)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone git@github.com:1CUNHA1/AImighty.git
    cd AImighty
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory (never commit this!):
    ```env
    VITE_SUPABASE_URL=your_public_supabase_url
    VITE_SUPABASE_PUBLISHABLE_KEY=your_public_anon_key
    VITE_GEMINI_API_KEY=your_gemini_api_key

    # Backend only (Edge Functions + admin scripts):
    SUPABASE_SERVICE_ROLE_KEY=your_secret_service_role_key
    ```

4.  **Sync database migrations:**
    ```sh
    npx supabase db push
    ```

5.  **Start the development server:**
    ```sh
    bun dev
    ```
    Open [http://localhost:8080](http://localhost:8080)

---

## Deployment (Vercel)

The project is fully prepared for one-click deployment to **Vercel**:

*   **SPA Routing:** A `vercel.json` is included to rewrite all routes to `index.html`, keeping React Router working on direct URL access and page refresh.
*   **Environment Variables:** When importing the project in Vercel, add **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_PUBLISHABLE_KEY`** in the Environment Settings panel. Do **NOT** add backend secrets (`SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) — those live securely inside Supabase.
*   **Automatic CI/CD:** Every push to the `main` branch triggers an automatic rebuild and redeploy on Vercel.

---

## Environment Variables

### Frontend (Vercel + `.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Public Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Public Supabase anon key (safe for frontend) |
| `VITE_GEMINI_API_KEY` | Yes | Gemini API key for client-side chat |

### Backend (Supabase Secrets)

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Admin key for Edge Functions (bypasses RLS) |
| `GEMINI_API_KEY` | Yes | Gemini API key for server-side workout + motivation generation |

> **Security Note:** The `SERVICE_ROLE_KEY` and server-side `GEMINI_API_KEY` are stored as [Supabase Secrets](https://supabase.com/docs/guides/functions/secrets) and are never exposed to the browser. The frontend only uses the `VITE_` prefixed variables, which are public by design.

---

## Acknowledgments

*   Exercise GIFs provided by the [omercotkd/exercises-gifs](https://github.com/omercotkd/exercises-gifs) repository (ExerciseDB dataset).
*   UI components from [Shadcn/UI](https://ui.shadcn.com/) and [Radix Primitives](https://www.radix-ui.com/).
*   Design and rapid prototyping assisted by the [Lovable](https://lovable.dev) AI workspace platform.

---

*Ready to become Al-mighty? Start your training today.* 💪

---

<details>
<summary>🇵🇹 <strong>Versão em Português</strong></summary>

# AImighty 🏋️‍♂️ — Plataforma de Fitness com IA

> Um assistente de fitness com inteligência artificial que gera planos de treino hiper-personalizados, oferece demonstrações de exercícios em tempo real e envia notificações motivacionais inteligentes — tudo numa interface premium com glassmorfismo e modo escuro.

**🔗 App Online:** [aimighty.vercel.app](https://aimighty.vercel.app)

## 🌍 Suporte Bilingue

A aplicação suporta **Inglês** e **Português**. O idioma pode ser alterado:
*   Na página de **Login** — botão 🌐 no canto superior direito
*   Na página de **Perfil** — seletor de idioma com bandeiras EN 🇬🇧 / PT 🇵🇹

A escolha é guardada no navegador e persiste entre sessões.

## 🚀 Funcionalidades Principais

*   **Geração de Treinos com IA**: Powered by **Google Gemini 2.5 Flash**, a app seleciona exercícios de uma base verificada de **1.318 exercícios** mapeados com IDs do ExerciseDB.
*   **Co-Piloto Motivacional com IA**: Sistema autónomo via `pg_cron` que analisa o histórico de treinos e envia notificações personalizadas (marcos, sequências, recuperação, dedicação, inatividade).
*   **Demonstrações de Exercícios**: 1.300+ GIFs animados com cobertura de 100%.
*   **Construtor Interativo**: Criação de treinos com drag-and-drop e filtragem inteligente por grupo muscular.
*   **Progresso e Estatísticas**: Heatmaps de atividade, distribuição muscular e acompanhamento de séries/repetições/pesos.
*   **UI Premium**: Interface glassmorfismo com modo claro/escuro, animações Framer Motion e totalmente responsiva.

## 🛠 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 5 |
| **Estilos** | Tailwind CSS, Framer Motion, Lucide Icons, Shadcn/UI |
| **Backend** | Supabase (Auth, PostgreSQL, Edge Functions, Realtime, `pg_cron`) |
| **IA** | Google Gemini 2.5 Flash API |
| **Hosting** | Vercel (frontend), Supabase Cloud (backend) |

## 📦 Instalação

1.  **Clonar o repositório:**
    ```sh
    git clone git@github.com:1CUNHA1/AImighty.git
    cd AImighty
    ```

2.  **Instalar dependências:**
    ```sh
    bun install
    ```

3.  **Configurar variáveis de ambiente:**
    Criar um ficheiro `.env` na raiz:
    ```env
    VITE_SUPABASE_URL=url_publico_do_supabase
    VITE_SUPABASE_PUBLISHABLE_KEY=chave_anon_publica
    VITE_GEMINI_API_KEY=chave_api_gemini
    SUPABASE_SERVICE_ROLE_KEY=chave_secreta_admin
    ```

4.  **Iniciar o servidor de desenvolvimento:**
    ```sh
    bun dev
    ```

## 🌐 Deploy (Vercel)

*   **Routing SPA**: Ficheiro `vercel.json` incluído para redirecionar todas as rotas para `index.html`.
*   **Variáveis**: Adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no painel do Vercel.
*   **CI/CD Automático**: Cada push para `main` faz rebuild automático.

---

*Pronto para ficar Al-mighty? Começa o teu treino hoje.* 💪

</details>
