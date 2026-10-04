# ContentSpy AI

**Paste a competitor's URL and get an AI-written competitive-intelligence report: SEO keywords, content strategy, weaknesses, content gaps and a market-entry plan, exportable as PDF.**

[![Live demo](https://img.shields.io/badge/demo-live-2ea44f?logo=vercel)](https://contentspy-ai.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

**Live demo:** https://contentspy-ai.vercel.app (sign in with a free [Puter](https://puter.com) account to run an analysis)

![ContentSpy dashboard](docs/screenshots/dashboard.png)

## The problem

Researching a competitor's SEO and content strategy by hand takes hours of browsing and note-taking. ContentSpy turns one URL into a structured report you can act on.

## Features

- **One-URL analysis:** enter a competitor URL (and optionally a niche); the app sends a structured prompt to an LLM through [Puter.js](https://docs.puter.com) with web search enabled
- **Model fallback:** tries `gpt-5.4`, then `claude-opus-4-5`, then `gpt-4o` until one responds
- **Robust parsing:** repairs common LLM JSON problems (trailing commas, stray control characters, quotes) before rendering
- **Structured report:** overall score, success factors, top keywords with difficulty, SEO score and strategy, top content, market size and trend, weaknesses with how to exploit them, content gaps, opportunities, a step-by-step market-entry plan and positioning suggestions
- **Saved reports per user** in Puter's key-value store, with delete and delete-all
- **Insights and Benchmarking** views that compare scores, keywords, gaps and opportunities across your saved reports
- **PDF export** of any report (jsPDF)
- Responsive UI built with shadcn/ui components and Framer Motion

## How the analysis works

`src/lib/agent.ts` makes a single tool-enabled chat call (web search) and parses the JSON it returns into a `CompetitorReport` (`src/lib/types.ts`). The progress messages shown in the "thinking" console are displayed while the report is prepared; they are not separate agent steps.

## Tech stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion · Puter.js (auth, AI, key-value storage) · jsPDF · jsonrepair

## Getting started

No API keys needed: Puter handles authentication and AI calls in the browser.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Project structure

```text
src/
├── app/                   # layout, page, global styles
├── components/
│   ├── pages/             # Reports, Insights, Benchmarking, Settings
│   ├── ui/                # shadcn/ui primitives
│   ├── ReportView.tsx     # renders a CompetitorReport
│   └── ThinkingConsole.tsx
├── hooks/usePuter.ts      # Puter auth state
└── lib/
    ├── agent.ts           # prompt, model fallback, JSON repair
    ├── report-store.ts    # per-user storage in Puter KV
    ├── pdf-generator.ts   # PDF export
    └── types.ts
```

## Known limitations

- Analysis quality depends on the model and its web-search results; scores are model estimates, not measured metrics.
- Reports are stored in the signed-in user's Puter account, not in a database you control.

## Author

Utkarsh Vaibhav · [GitHub](https://github.com/Utkarsh151-glitch) · [LinkedIn](https://www.linkedin.com/in/utkarsh-vaibhav-76aa99300/)
