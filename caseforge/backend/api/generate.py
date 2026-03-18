import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.services.groq_service import generate_case_study

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
    if not session_id:
        return {"statusCode": 400, "body": json.dumps({"detail": "session_id required"})}
    
    try:
        case_study = await generate_case_study(session_id)
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "session_id": session_id,
                "case_study": case_study.model_dump()
            })
        }
    except Exception as e:
        return {"statusCode": 400, "body": json.dumps({"detail": str(e)})}
