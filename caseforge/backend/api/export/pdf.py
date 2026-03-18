import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.pdf_service import render_case_study_pdf
from app.models.schemas import CaseStudy

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
    
    try:
        case_study = CaseStudy(**body)
        pdf_bytes = render_case_study_pdf(case_study)
        import base64
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/pdf", "Access-Control-Allow-Origin": "*"},
            "body": base64.b64encode(pdf_bytes).decode("utf-8"),
            "isBase64Encoded": True
        }
    except Exception as e:
        return {"statusCode": 400, "body": json.dumps({"detail": str(e)})}
