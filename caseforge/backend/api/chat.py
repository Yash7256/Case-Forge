import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.services.session_store import session_store
from app.models.schemas import ChatRequest
from app.services.groq_service import stream_chat
from groq import AsyncGroq

client = AsyncGroq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

async def handler(request):
    if request.method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        }
    
    if request.method != "POST":
        return {"statusCode": 405, "body": json.dumps({"detail": "Method not allowed"})}
    
    try:
        body = await request.json()
    except:
        return {"statusCode": 400, "body": json.dumps({"detail": "Invalid JSON"})}
    
    session_id = body.get("session_id")
    message = body.get("message")
    
    if not session_id or not message:
        return {"statusCode": 400, "body": json.dumps({"detail": "session_id and message required"})}
    
    session = session_store.get(session_id)
    if not session:
        return {"statusCode": 404, "body": json.dumps({"detail": "Session not found"})}
    
    from app.models.schemas import ChatMessage
    from datetime import datetime
    
    user_message = ChatMessage(role="user", content=message)
    session_store.append_message(session_id, user_message)
    
    if not client:
        reply = ChatMessage(role="assistant", content="Thanks for the detail! I'll use this in the case study.")
        session_store.append_message(session_id, reply)
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"content": reply.content})
        }
    
    import asyncio
    from app.prompts.chat_system import build_chat_system_prompt
    
    vision_data = session.analysis.model_dump() if session.analysis else {}
    system_prompt = build_chat_system_prompt(vision_data)
    
    chat_messages = [
        {"role": "system", "content": system_prompt},
    ] + [{"role": m.role, "content": m.content} for m in session.messages]
    
    try:
        completion = await client.chat.completions.create(
            model=settings.GROQ_CHAT_MODEL,
            messages=chat_messages,
            stream=True,
        )
        
        content = ""
        async for chunk in completion:
            token = chunk.choices[0].delta.content or ""
            content += token
        
        reply = ChatMessage(role="assistant", content=content)
        session_store.append_message(session_id, reply)
        
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"content": content})
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"detail": str(e)})}
