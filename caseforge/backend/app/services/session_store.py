from __future__ import annotations
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional
from pydantic import BaseModel, Field

from app.core.config import settings
from app.models.schemas import CaseStudy, ChatMessage, VisionAnalysis


class SessionData(BaseModel):
    messages: list[ChatMessage] = Field(default_factory=list)
    analysis: Optional[VisionAnalysis] = None
    case_study: Optional[CaseStudy] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(minutes=settings.session_ttl_minutes))


class SessionStore:
    def __init__(self):
        self._store: Dict[str, SessionData] = {}

    def create(self, analysis: VisionAnalysis, first_message: ChatMessage) -> str:
        session_id = uuid.uuid4().hex
        self._store[session_id] = SessionData(analysis=analysis, messages=[first_message])
        return session_id

    def get(self, session_id: str) -> Optional[SessionData]:
        session = self._store.get(session_id)
        if session and session.expires_at < datetime.utcnow():
            self._store.pop(session_id, None)
            return None
        return session

    def append_message(self, session_id: str, message: ChatMessage) -> None:
        session = self.get(session_id)
        if not session:
            raise KeyError("Session not found")
        session.messages.append(message)
        self._store[session_id] = session

    def save_case_study(self, session_id: str, case: CaseStudy) -> None:
        session = self.get(session_id)
        if not session:
            raise KeyError("Session not found")
        session.case_study = case
        self._store[session_id] = session


session_store = SessionStore()


def create_session(session_id: str, analysis_payload: dict) -> None:
    """
    Create a session with a provided session_id using analysis payload that includes
    vision fields and opening/first question strings.
    """
    vision_data = analysis_payload.get("vision") or analysis_payload
    try:
        vision = VisionAnalysis(**vision_data)
    except Exception:
        vision = VisionAnalysis(
            platform=vision_data.get("platform", "web"),
            screenType=vision_data.get("screenType", "dashboard"),
            visualStyle=vision_data.get("visualStyle", "clean"),
            purpose=vision_data.get("purpose", "describe purpose"),
            notes=vision_data.get("notes"),
        )

    first_question = analysis_payload.get(
        "first_question", analysis_payload.get("opening_message", "Tell me about this design.")
    )
    first_message = ChatMessage(role="assistant", content=first_question)

    session_store._store[session_id] = SessionData(analysis=vision, messages=[first_message])
