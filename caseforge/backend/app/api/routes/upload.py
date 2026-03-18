import uuid
from fastapi import APIRouter, UploadFile, HTTPException, File

from app.services.session_store import create_session
from app.services.groq_service import analyze_design_image

router = APIRouter()


@router.post("/upload")
async def upload_design(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are accepted")

    image_bytes = await file.read()
    analysis = await analyze_design_image(image_bytes, file.content_type or "image/png")

    session_id = str(uuid.uuid4())
    create_session(session_id, analysis)

    return {
        "session_id": session_id,
        "message": analysis.get("opening_message"),
        "first_question": analysis.get("first_question"),
        "vision": analysis.get("vision"),
    }
