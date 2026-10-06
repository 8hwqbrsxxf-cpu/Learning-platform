# CertCoach – Microsoft certification learning platform

A learning platform for Microsoft certifications (MD-102, MS-102, and more to come) that works as a personal coach, exam simulator, curriculum architect and knowledge base — not just a content generator.

## Features (MVP)

| Feature | What it does |
|---|---|
| **Certification catalog** | Fundamentals → Associate → Expert. Exams with a content file are fully available; the rest are coach-only for now. |
| **Learning roadmap** | 6 phases per exam (Foundations → Core → Advanced → Exam prep → Practice exams → Revision) with objectives, outcomes, hours, modules, labs and assessments. |
| **Knowledge modules** | Learning objectives, core concepts, deep dive, architecture, real-world MSP example, exam tips, pitfalls, field experience, revision notes, references (Microsoft Learn). |
| **Practice exams** | Diagnostic, full timed exam, domain drills, module checks and adaptive weak-area sessions. Question types: multiple choice, multiple response, true/false, sequence and yes/no statements (hot-area style), with case-study scenarios. Every question shows the explanation, why the other options are wrong, the skill measured and a Learn reference. |
| **Exam readiness dashboard** | Knowledge score, practical score (labs), retention (flashcards), per-domain readiness weighted by the official domain weights, weak/strong domains, an indicative pass likelihood and a concrete recommendation ("Focus on X for the next N hours"). |
| **Study plan generator** | Week-by-week plan based on hours per week, target date, current level, existing certifications and learning style. Follows a 20 % theory / 30 % guided practice / 50 % hands-on mix and gives weak domains more time once readiness data exists. |
| **Hands-on lab tracker** | Labs with objective, requirements, step-by-step portal instructions, validation, troubleshooting and cleanup. Track status and notes per lab. |
| **Flashcards (spaced repetition)** | SM-2 scheduling (same family as Anki) with daily/weekly/monthly review buckets, beginner/intermediate/expert levels and **Anki export**. |
| **AI Study Coach** | Claude-powered tutor that knows your readiness and recent mistakes: explains at your level, quizzes you one question at a time, generates flashcards and labs, and gives career advice. Answers in Dutch, English or French. |
| **Career paths** | Helpdesk → MD-102 → MS-102 → SC-300, System engineer → AZ-104 → AZ-500 → AZ-305, and more. |

No exam dumps: all questions are original and written to teach understanding.

## Getting started

Requirements: Node.js 20+.

```bash
npm install
cp .env.example .env.local   # set ANTHROPIC_API_KEY for the AI coach (optional for everything else)
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run validate    # checks content/exams/*.json (ids, references, question rules, weights)
npm run typecheck
npm run build && npm start
```

Progress is stored in SQLite at `data/learning.db` (override with `DATABASE_PATH`). Delete the file to reset.

## Architecture

```
app/                     Next.js App Router pages + API routes
  exams/[id]/            overview & roadmap, modules, practice, flashcards, labs, plan, readiness
  coach/                 AI Study Coach (streams from /api/coach)
  api/                   attempts, flashcards (review + Anki export), labs, modules, profile, coach
lib/
  content-types.ts       content schema (Exam, Domain, KnowledgeModule, Question, Flashcard, Lab)
  content.ts             loads content/exams/*.json + certification catalog
  db.ts                  SQLite progress store (better-sqlite3)
  readiness.ts           readiness scoring model
  planner.ts             study plan generator
  srs.ts                 SM-2 spaced repetition
  coach.ts               coach system prompt + learner context
content/exams/           exam content as version-controlled JSON (md-102.json, ms-102.json)
scripts/validate-content.mjs
```

Design choices:

- **Content as JSON in Git, progress in SQLite.** Content changes are reviewable in pull requests; learner data stays separate.
- **Server-side grading.** The attempts API re-grades answers against the content, so readiness can't be skewed from the browser.
- **Claude API for the coach** (`claude-opus-5-5`, streaming, prompt-cached system prompt, server-side refusal fallback). The stable coach prompt is in `lib/coach.ts`; learner context is appended per request.

## Adding an exam

1. Create `content/exams/<exam-id>.json` following `lib/content-types.ts` (use `md-102.json` as a template).
2. Take domains and weights from the official study guide on Microsoft Learn and set `lastReviewed`.
3. Run `npm run validate`.
4. The exam appears automatically in the catalog and dashboard.

## Roadmap

- **Microsoft Learn sync**: scheduled job that checks the study guides (skills measured, weights, "last updated") via the Microsoft Learn MCP server / Catalog API and flags content that needs review.
- **Multi-user with Entra ID sign-in** (Azure App Service Easy Auth or NextAuth with Entra ID), `learner_id` on all progress tables, team overview for managers.
- **Azure hosting**: App Service (Linux) + Azure SQL / PostgreSQL instead of SQLite, Key Vault for the API key.
- **AI-generated question bank** reviewed by a human before publishing, plus drag-and-drop and full case-study formats.
- **Content for AZ-104, SC-300, MS-900, AZ-900, SC-200, AZ-500.**
- **Knowledge base export** to SharePoint / Copilot Studio.

## Disclaimer

Not affiliated with Microsoft. Exam objectives change; always verify against the official study guide before booking an exam.
