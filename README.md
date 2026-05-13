# cobol-archaeologist-web

Next.js dashboard for the [COBOL Archaeologist](https://github.com/twiswiz/cobol-archaeologist)
backend — browse logic blocks, view inferred Business Intent Cards, search
regulations, and run on-demand inference against pasted COBOL code.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4
- Talks to the FastAPI backend over HTTP (default: `http://localhost:8000`)

## Prerequisites

The Python backend in [cobol-archaeologist](https://github.com/twiswiz/cobol-archaeologist)
must be running. From that repo:

```powershell
uvicorn cobol_archaeologist.api.main:app --reload --port 8000
```

For LLM inference, [Ollama](https://ollama.com/) must be running with the
target model pulled:

```powershell
ollama serve
ollama pull qwen2.5-coder:1.5b
```

## Setup

```powershell
npm install
copy .env.local.example .env.local   # adjust NEXT_PUBLIC_API_URL if needed
npm run dev
```

Open <http://localhost:3000>.

## One-command startup

The backend repo contains a `dev.ps1` that launches both the API and this
frontend in two PowerShell windows:

```powershell
cd ..\cobol-archaeologist
.\dev.ps1
```

## Architecture

- `lib/api.ts` — typed API client. Server components hit the FastAPI backend
  directly via `NEXT_PUBLIC_API_URL`; client components hit `/api/backend/*`,
  which is proxied by the Next.js route below.
- `app/api/backend/[...path]/route.ts` — catch-all proxy that forwards to the
  Python API. Avoids CORS and `NEXT_PUBLIC_*` baking issues for client calls.
  Long-running `infer/*` and `analyse` requests get a 200 s timeout.
- `app/blocks/` — list, detail, and freeform-paste pages.
- `app/search/` — regulation search.

## Environment

| Var | Default | Purpose |
|-----|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI backend base URL |
