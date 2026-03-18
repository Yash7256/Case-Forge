# Deployment Guide

## Recommended: Vercel (Frontend) + Render (Backend)

### Backend: Render

1. **Create Render Account**
   - Go to [render.com](https://render.com) and sign up
   - Connect your GitHub repository

2. **Deploy Backend**
   - New → Web Service
   - Connect `caseforge/backend` repo
   - Settings:
     - **Root Directory**: `backend`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Configure Environment Variables**
   - `GROQ_API_KEY` - Your Groq API key
   - `GROQ_VISION_MODEL` - `meta-llama/llama-4-scout-17b-16e-instruct`
   - `GROQ_CHAT_MODEL` - `meta-llama/llama-4-scout-17b-16e-instruct`
   - `GROQ_GENERATION_MODEL` - `moonshotai/kimi-k2-instruct-0905`
   - `SESSION_TTL_MINUTES` - `60`
   - `CORS_ORIGINS` - `["https://your-frontend.vercel.app"]`

4. **Note Your Backend URL**
   - Render will provide: `https://caseforge-backend.onrender.com`

### Frontend: Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com) and sign up

2. **Import Project**
   - Import `caseforge/frontend` from GitHub
   - Framework Preset: Vite

3. **Add Environment Variable**
   - Key: `VITE_API_URL`
   - Value: `https://caseforge-backend.onrender.com` (your Render URL)

4. **Deploy**

---

## Local Development

### Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env with your backend URL
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

---

## Troubleshooting

### CORS Issues
Make sure backend has CORS configured for your frontend domain:
```python
# In backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Session Expired
- Sessions have a TTL (default 60 minutes)
- Increase `SESSION_TTL_MINUTES` for longer interviews

### Chat Streaming Not Working
- Check Render's response type settings
- Ensure you're using the correct port ($PORT)
- Free tier may have timeout limits
