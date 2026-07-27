# 🌍 Language Learner - AI Language Tutor & Progress Storage

Language Learner is a personal daily language learning application built to automate and enhance daily structured prompts, vocabulary tracking, rule mastery, and exercise evaluations for **any language you want to learn**.

*(Note: Currently, the app is fully configured for learning **Korean from English**. Support for additional languages and custom language pairings is coming soon!)*

---

## 🌟 Key Features

1. **Pre-Lesson Rule Proposal Flow**:
   - Every day, the AI proposes **3 new candidate rules/expressions** suited for your learning level, filtering out rules you have already mastered.
   - Includes a **Spaced Repetition Review option** (Option 4) that randomly picks an already learned rule from your Rule Bank.
   - Customizable target count for new daily vocabulary words (3, 5, 7, 10).

2. **Dual-Mode Interactive Workspace & Raw Prompt Copier**:
   - **Interactive Studio**: Displays 5 new words, rule explanations, examples, and 3 interactive exercise forms directly in the web app.
   - **Raw Prompt Viewer**: Instant copy button for the exact compiled prompt template (`Lesson architecture... List of known words... Today's rule...`) if you prefer pasting into ChatGPT or Claude.

3. **Multimodal AI Vision & OCR Grading Engine**:
   - Complete exercises by typing in the app **or by snapping a photo of your handwritten notebook practice**!
   - Uses Multimodal AI (Vision) to transcribe handwritten text, grade sentence translations, check grammar/particles, and provide an overall score (0-100%).

4. **Automated Vocabulary & Rule Bank**:
   - Every generated lesson automatically populates new daily words into your **Word Bank** and mastered rules into your **Rule Bank**.
   - Full search, manual add/edit, and review capabilities.

5. **Web UI Settings**:
   - Dynamically select any OpenAI-compatible AI provider (OpenAI, Gemini, Groq, Mistral, Ollama, DeepSeek, xAI, etc.) and active model directly in the web interface. 
   - API Keys are securely managed via the backend environment variable (`API_KEY`).

---

## 🏗️ Tech Stack

- **Frontend**: React (TypeScript), Vite, Vanilla CSS Design System (Glassmorphism theme, modern typography, responsive layout).
- **Backend**: NestJS (TypeScript), Prisma ORM, SQLite Database.
- **Multimodal AI**: `openai` SDK (Configured dynamically via `baseURL` to support any OpenAI-compatible provider).
- **Containerization**: `Docker` & `Docker Compose` with persistent SQLite and Uploads volume storage.

---

## 🚀 Quick Start (Local Docker Compose)

```bash
# 1. Clone or navigate to repository root
cd /home/language_learner

# 2. (Optional) Copy .env.example to .env
cp .env.example .env

# 3. Install dependencies
pnpm i

# 4. Launch with Docker Compose
docker compose up --build -d
```

Open your browser and navigate to:
- **Frontend App**: `http://localhost:80` (or `http://localhost:5173`)
- **Backend API**: `http://localhost:3000/api`

---
