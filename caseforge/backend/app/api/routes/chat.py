from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.models.schemas import ChatRequest
from app.services.groq_service import stream_chat
from app.services.session_store import session_store

router = APIRouter(tags=["chat"])


@router.post("/chat")
async def chat(payload: ChatRequest):
    session = session_store.get(payload.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Please upload an image first.")

    try:
        async def iterator():
            try:
                async for token in stream_chat(payload):
                    yield token
            except Exception as exc:
                yield f"[ERROR] {str(exc)}"
        return StreamingResponse(iterator(), media_type="text/plain")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
