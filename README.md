# AP CSP Prep — Performance Task Practice

An AI-powered web app to help students practice AP Computer Science Principles Performance Task (Create Task) written responses.

## Features
- Paste your code -> AI analyzes it
- Get 5 personalized AP-style questions
- Write your answers
- Get rubric-based grading (0-2 pts per question)
- Detailed feedback + model answers
- Progress tracking across sessions

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set your OpenAI API key
```bash
cp .env.local.example .env.local
# Edit .env.local and add your key:
# OPENAI_API_KEY=sk-...
```

### 3. Run locally
```bash
npm run dev
```
Visit http://localhost:3000

## Deploy to Vercel
```bash
npx vercel
# Add OPENAI_API_KEY as an environment variable in Vercel dashboard
```

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (gpt-4o-mini)
- localStorage for session persistence
