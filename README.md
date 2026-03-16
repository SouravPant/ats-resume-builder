# ATS Resume Builder

AI-powered resume optimization tool that scores your resume against job descriptions and provides intelligent rewrite suggestions using Groq AI (Llama 3.3 70B).

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![AI](https://img.shields.io/badge/AI-Groq%20Llama%203.3-orange) ![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **ATS Score (0–100)** — Gemini analyzes keyword match, formatting, relevance, and experience alignment
- **Missing Keywords** — Highlights keywords from the job description that are absent in your resume
- **AI Rewrite** — Rewrites weak sections (summary, skills, experience, education) to match the JD
- **PDF Export** — Download your optimized resume as a clean, styled PDF
- **Save Multiple Resumes** — Name and save resume versions in localStorage, switch between them
- **Demo Data** — App loads with sample data so it works immediately

## Project Structure

```
ats-resume-builder/
├── client/          # React + Vite + Tailwind CSS frontend
│   └── src/
│       ├── components/   # InputPanel, ResultsPanel, ScoreGauge, ResumeManager
│       └── utils/        # demoData, pdfExport
├── server/          # Node.js + Express backend
│   ├── index.js     # API routes (analyze, rewrite, health)
│   └── .env         # GEMINI_API_KEY
├── .env.example
├── .gitignore
└── README.md
```

## Setup

### 1. Clone & install

```bash
git clone <your-repo-url>
cd ats-resume-builder

# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure API Key

Create `server/.env`:

```
GROQ_API_KEY=your_groq_api_key
```

Get your free key from [Groq Console](https://console.groq.com/keys).

### 3. Run

```bash
# Terminal 1 — Backend
cd server
npm run dev        # http://localhost:3001

# Terminal 2 — Frontend
cd client
npm run dev        # http://localhost:5173
```

Open **http://localhost:5173** — the app loads with demo data pre-filled.

## Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | `server/.env` | Groq API key (free at console.groq.com) |
| `VITE_API_URL` | `client/.env` (optional) | Override backend URL (default: `http://localhost:3001`) |

## Vercel Deployment

### Frontend (client)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set **Root Directory** to `client`
4. Framework preset: **Vite**
5. Add env variable `VITE_API_URL` pointing to your deployed backend

### Backend (server)

Deploy to Vercel as a serverless function, or use Railway / Render:

1. Set **Root Directory** to `server`
2. Add env variable `GROQ_API_KEY`

## License

MIT
