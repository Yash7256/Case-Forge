# CaseForge Backend on Render

## Quick Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Click the button above or go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Set the following:

### Settings
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Environment Variables
```
GROQ_API_KEY=your_groq_api_key_here
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
GROQ_CHAT_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
GROQ_GENERATION_MODEL=moonshotai/kimi-k2-instruct-0905
SESSION_TTL_MINUTES=60
CORS_ORIGINS=["https://your-frontend.vercel.app"]
```

## After Deploy

1. Copy your Render backend URL (e.g., `https://caseforge-backend.onrender.com`)
2. Deploy frontend to Vercel with:
   ```
   VITE_API_URL=https://caseforge-backend.onrender.com
   ```

## Troubleshooting

### Build Failures
- Make sure Python 3.10+ is selected in Render settings
- Check that all requirements install correctly

### Cold Starts
- Render's free tier spins down after 15 minutes
- First request after inactivity may take 30+ seconds
- Upgrade to a paid plan for always-on instances

### Streaming Issues
- If chat streaming doesn't work, check Render's streaming response support
- Some plans may have restrictions on long-running responses
