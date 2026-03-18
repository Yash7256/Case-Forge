import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.session_store import session_store
from app.models.schemas import ChatRequest
from groq import AsyncGroq
from app.core.config import settings
import json
import base64

client = AsyncGroq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

def create_session_v1(file_bytes: bytes, content_type: str = "image/png"):
    import asyncio
    from app.services.groq_service import analyze_design_image
    return asyncio.run(analyze_design_image(file_bytes, content_type))

async def handler(request):
    if request.method == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type"}}
    
    import uuid
    
    try:
        body = await request.json()
    except:
        return {"statusCode": 400, "body": json.dumps({"detail": "Invalid JSON"})}
    
    try:
        file_bytes = base64.b64decode(body.get("file", ""))
        content_type = body.get("content_type", "image/png")
    except Exception as e:
        return {"statusCode": 400, "body": json.dumps({"detail": f"Invalid file data: {str(e)}"})}
    
    import asyncio
    
    try:
        analysis = asyncio.run(analyze_design_image(file_bytes, content_type))
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"detail": f"Analysis failed: {str(e)}"})}
    
    session_id = str(uuid.uuid4())
    create_session(session_id, analysis)
    
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
        "body": json.dumps({
            "session_id": session_id,
            "message": analysis.get("opening_message"),
            "first_question": analysis.get("first_question"),
            "vision": analysis.get("vision"),
        })
    }
