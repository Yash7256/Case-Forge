# CaseForge

CaseForge is a two-sided web app for UI/UX designers: upload a design, answer AI follow-up questions, and export a polished PDF case study.

## Stack
- **Frontend**: React + TypeScript + Vite + Tailwind + shadcn-style UI
- **Backend**: FastAPI + Groq API
- **PDF**: WeasyPrint using a Jinja2 template

## Getting Started

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env - set VITE_API_URL=http://localhost:8001
npm install
npm run dev
```

## API Endpoints
- `POST /upload` — multipart image → returns `session_id`, vision analysis, and first AI question
- `POST /chat` — `{ session_id, message }` → streamed AI reply
- `POST /generate` — `{ session_id }` → structured case study JSON
- `POST /export/pdf` — case study JSON → PDF blob

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy (Recommended)

**Frontend → Vercel**
1. Import `frontend` to Vercel
2. Set `VITE_API_URL` to your backend URL

**Backend → Railway** (recommended for streaming support)
1. Create new Railway project
2. Connect your GitHub repo
3. Set environment variables from `.env.example`
4. Railway provides a URL like `https://your-app.up.railway.app`

### Notes
- When no `GROQ_API_KEY` is set, the backend returns deterministic fallback content so the UI remains demoable
- The PDF template lives at `backend/app/templates/case_study.html` and maps 1:1 with the case study schema
- For production with streaming chat, use Railway/Render/Fly.io for the backend (Vercel Python serverless has streaming limitations)
