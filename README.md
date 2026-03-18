# AImighty 🏋️‍♂️

AImighty is a cutting-edge, AI-powered fitness assistant designed to create hyper-personalized workout plans for beginners and experts alike. Using the latest AI models and a comprehensive exercise database, AImighty generates structured routines that adapt to your goals, history, and available equipment.

## 🚀 Key Features

*   **AI Workout Generation**: Powered by **Google Gemini 2.5 Flash**, the app selects movements from a verified pool of 1,318 exercises based on user goals and equipment.
*   **AI Motivational Co-Pilot**: An automated, intelligent notification system running on Supabase `pg_cron`. The AI analyzes your workout history and triggers personalized push notifications for:
    *   🎉 **Milestones** (10th, 50th, 100th workout)
    *   🔥 **Streaks** (Consistent training momentum)
    *   🛌 **Recovery** (Reminding you to rest after consecutive intense days)
    *   ⏰ **Dedication** (Praising extreme early bird or night owl workouts)
    *   ⚠️ **Inactivity** (Gentle nudges when you've missed a few days)
*   **Interactive Co-Pilot Builder**: A drag-and-drop workout creation experience with smart exercise filtering based on your plan's target muscle groups.
*   **Bulletproof Video Demonstrations**: 100% video coverage guaranteed. The AI uses unique ExerciseDB IDs to ensure every generated exercise has a flawless animated demonstration.
*   **1300+ Exercise Animations**: A massive library featuring high-quality animated GIFs.
*   **Glassmorphism UI**: A sleek, premium dark-mode interface built with Framer Motion and Tailwind CSS.
*   **Supabase Integration**: Secure user profiles, real-time data storage, Row Level Security (RLS), and CLI-managed database migrations.

## 🛠 Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS, Framer Motion, Lucide Icons, Shadcn/UI
*   **Backend/DB**: Supabase (Auth, PostgreSQL DB, `pg_cron` Edge Functions, Realtime Subscriptions)
*   **AI**: Gemini 2.5 Flash API
*   **Demonstrations**: [Exercise-GIFs](https://github.com/omercotkd/exercises-gifs)

## 📦 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18+)
*   [Bun](https://bun.sh/) (Recommended for faster development)
*   [Supabase CLI](https://supabase.com/docs/guides/cli)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <your-repo-url>
    cd AImighty
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Set up your environment variables:**
    Create a `.env` file in the root directory (never commit this to Git!):
    ```env
    VITE_SUPABASE_URL=your_public_supabase_url
    VITE_SUPABASE_ANON_KEY=your_public_anon_key
    VITE_GEMINI_API_KEY=your_gemini_api_key
    
    # Required for backend scripts and cron simulation:
    SUPABASE_SERVICE_ROLE_KEY=your_secret_admin_key
    ```

4.  **Sync Database Migrations:**
    Ensure your remote database structure is up-to-date with the local schema.
    ```sh
    npx supabase db push
    ```

5.  **Start the development server:**
    ```sh
    bun dev
    ```

## 🧪 Testing AI Motivation

The AI Motivation Edge Function runs automatically in production via a daily database cron job. To test it locally, use the provided CLI scripts:

*   `bun trigger-cron.ts`
    *   *Simulates exactly what the production database timer does. It triggers the Edge Function to evaluate your current database state and generate notifications.*
*   `bun test-motivation.ts <YOUR_USER_ID> <SCENARIO>`
    *   *A powerful scenario testing tool. It safely wipes your previous test logs, injects precise historical fake data (e.g., a "streak" or an "inactivity" gap), and instantly forces the AI to react to the new state. Available scenarios: `welcome`, `streak`, `recovery`, `inactivity`, `milestone`, `earlybird`, `nightowl`.*

## 📂 Project Structure

*   `src/components/NotificationCenter.tsx`: Real-time Supabase subscription logic for displaying AI messages.
*   `src/components/ExerciseDemo.tsx`: The core logic for the animated demonstration system.
*   `supabase/migrations/`: CLI-managed SQL files for tracking database schema changes, RLS, and triggers.
*   `supabase/functions/generate-motivation`: The `pg_cron` triggered Edge Function that evaluates user data and prompts Gemini 2.5 Flash.
*   `supabase/functions/generate-workout`: The AI engine responsible for building the initial workout plans.

## ✨ Acknowledgments

*   Exercise GIFs provided by the [omercotkd/exercises-gifs](https://github.com/omercotkd/exercises-gifs) repository.
*   Built with [Lovable](https://lovable.dev).

---
*Ready to become Al-mighty? Start your training today.*
