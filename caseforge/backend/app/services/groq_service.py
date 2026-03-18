from __future__ import annotations
import json
import base64
import re
from typing import AsyncGenerator, Tuple
from groq import AsyncGroq

from app.core.config import settings
from app.models.schemas import CaseStudy, ChatMessage, ChatRequest, VisionAnalysis
from app.prompts.case_study_generator import CASE_STUDY_GENERATOR_PROMPT
from app.prompts.chat_system import build_chat_system_prompt
from app.prompts.followup_questions import FOLLOWUP_QUESTIONS_PROMPT
from app.prompts.vision_analysis import VISION_ANALYSIS_PROMPT
from app.services.session_store import session_store

client = AsyncGroq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None


def _fallback_analysis() -> Tuple[VisionAnalysis, ChatMessage]:
    analysis = VisionAnalysis(
        platform="web",
        screenType="dashboard",
        visualStyle="clean grid, blue accent, high contrast",
        purpose="Monitor key metrics and actions",
        notes="Consistent spacing; add alt text; check keyboard focus",
        screen_type="dashboard",
        app_category="analytics",
        polish_level="high",
        primary_user_action="view metrics",
        strengths=["Clear visual hierarchy", "Good use of whitespace"],
        risks_and_opportunities=[],
        interview_questions=["What problem were you solving?", "Who were your users?"],
        opening_message="I've reviewed your design — impressive work. Let's dig into the thinking behind it.",
        first_question="What problem were you trying to solve with this design, and who were you designing for?",
    )
    first = ChatMessage(
        id="intro",
        role="assistant",
        content="I see a web analytics dashboard with charts and KPI tiles. What problem were you solving?",
    )
    return analysis, first


async def analyze_design_image(file_bytes: bytes, content_type: str = "image/png") -> dict:
    if not client:
        vision, first_message = _fallback_analysis()
        return {
            "vision": vision.model_dump(),
            "opening_message": first_message.content,
            "first_question": first_message.content,
        }

    encoded_image = base64.standard_b64encode(file_bytes).decode("utf-8")
    try:
        completion = await client.chat.completions.create(
            model=settings.GROQ_VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{content_type};base64,{encoded_image}"},
                        },
                        {"type": "text", "text": VISION_ANALYSIS_PROMPT},
                    ],
                }
            ],
            max_tokens=1024,
        )
        raw = completion.choices[0].message.content
        match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", raw, re.DOTALL)
        if not match:
            match = re.search(r"(\{.*\})", raw, re.DOTALL)
        parsed = json.loads(match.group(1)) if match else {}
        vision = VisionAnalysis(**parsed) if parsed else _fallback_analysis()[0]
    except Exception:
        vision, _first = _fallback_analysis()
        parsed = {}

    refined_questions = await refine_interview_questions(parsed)
    parsed["interview_questions"] = refined_questions

    opening = parsed.get("opening_message") if isinstance(parsed, dict) else None
    first_question = parsed.get("first_question") if isinstance(parsed, dict) else None

    if not opening:
        opening = "I've reviewed your design — impressive work. Let's dig into the thinking behind it."
    if not first_question:
        first_question = "What problem were you trying to solve with this design, and who were you designing for?"

    required_keys = ["opening_message", "first_question", "interview_questions"]
    for key in required_keys:
        if key not in parsed or not parsed[key]:
            if key == "opening_message":
                parsed[key] = "I've reviewed your design — impressive work. Let's dig into the thinking behind it."
            elif key == "first_question":
                parsed[key] = "What problem were you trying to solve with this design, and who were you designing for?"
            elif key == "interview_questions":
                parsed[key] = []

    return {
        "vision": parsed,
        "opening_message": parsed["opening_message"],
        "first_question": refined_questions[0] if refined_questions else parsed["first_question"],
        "interview_questions": refined_questions
    }


async def refine_interview_questions(vision: dict) -> list[str]:
    """
    Optional second pass — takes the raw vision analysis and generates
    higher-quality, design-specific interview questions.
    Falls back to vision-generated questions if this call fails.
    """
    if not client:
        return vision.get("interview_questions", [])

    try:
        completion = await client.chat.completions.create(
            model=settings.GROQ_GENERATION_MODEL,
            messages=[
                {"role": "system", "content": FOLLOWUP_QUESTIONS_PROMPT},
                {"role": "user", "content": json.dumps(vision)}
            ],
            response_format={"type": "json_object"},
            temperature=0.4,
            max_tokens=1024
        )
        raw = completion.choices[0].message.content
        parsed = json.loads(raw)

        if isinstance(parsed, list):
            questions = parsed
        elif isinstance(parsed, dict):
            questions = parsed.get("questions", parsed.get("interview_questions", []))
        else:
            questions = []

        questions = [q for q in questions if isinstance(q, str) and len(q.strip()) > 10]
        return questions if len(questions) == 6 else vision.get("interview_questions", [])

    except Exception:
        return vision.get("interview_questions", [])


async def stream_chat(request: ChatRequest) -> AsyncGenerator[str, None]:
    session = session_store.get(request.session_id)
    if not session:
        raise ValueError("Session not found")

    user_message = ChatMessage(role="user", content=request.message)
    session_store.append_message(request.session_id, user_message)
    session = session_store.get(request.session_id)
    if not session:
        raise ValueError("Session expired")

    if not client:
        reply = ChatMessage(role="assistant", content="Thanks for the detail! I'll use this in the case study.")
        session_store.append_message(request.session_id, reply)
        yield reply.content
        return

    vision_data = session.analysis.model_dump() if session.analysis else {}
    system_prompt = build_chat_system_prompt(vision_data)

    chat_messages = [
        {"role": "system", "content": system_prompt},
    ] + [{"role": m.role, "content": m.content} for m in session.messages]

    completion = await client.chat.completions.create(
        model=settings.GROQ_CHAT_MODEL,
        messages=chat_messages,
        stream=True,
    )

    content = ""
    async for chunk in completion:
        token = chunk.choices[0].delta.content or ""
        content += token
        yield token

    reply = ChatMessage(role="assistant", content=content)
    session_store.append_message(request.session_id, reply)


async def generate_case_study(session_id: str) -> CaseStudy:
    session = session_store.get(session_id)
    if not session:
        raise ValueError("Session not found")

    if session.case_study:
        return session.case_study

    def message_to_dict(m):
        d = m.model_dump()
        if "created_at" in d:
            d["created_at"] = d["created_at"].isoformat()
        return d

    transcript = [message_to_dict(m) for m in session.messages]
    analysis_data = session.analysis.model_dump() if session.analysis else {}
    for k, v in analysis_data.items():
        if hasattr(v, "isoformat"):
            analysis_data[k] = v.isoformat()
        elif isinstance(v, list) and v and hasattr(v[0], "model_dump"):
            analysis_data[k] = [{"severity": i.severity, "note": i.note} for i in v]

    payload = {
        "analysis": analysis_data,
        "transcript": transcript,
    }

    if not client:
        case = CaseStudy(
            title="CaseForge Demo",
            tagline="Generated without API key — upload a design to get started.",
            badge_tags=["Demo", "Portfolio", "UX Design"],
            overview={
                "body": "This is a demo case study generated when no API key is configured.",
                "what_label": "What",
                "what": "A placeholder project structure for demonstration purposes.",
                "why_label": "Why",
                "why": "To show the case study format when Groq API is unavailable."
            },
            project_meta={
                "role": "Product Designer",
                "tools": ["Figma", "Groq"],
                "timeline": "4 weeks",
                "platform": "Web",
                "category": "SaaS"
            },
            design_process={
                "intro": "Process approach not available without API key.",
                "stages": [
                    {"number": "01", "label": "DISCOVER", "body": "Not available in demo mode."},
                    {"number": "02", "label": "DEFINE", "body": "Not available in demo mode."},
                    {"number": "03", "label": "IDEATE", "body": "Not available in demo mode."},
                    {"number": "04", "label": "DESIGN", "body": "Not available in demo mode."}
                ]
            },
            user_research={
                "intro": "Research details not available without API key.",
                "method": "Not mentioned",
                "participant_count": "Not mentioned",
                "key_findings": [],
                "standout_quote": {"text": "", "attribution": ""}
            },
            personas=[],
            pain_points={
                "intro": "Pain points not discussed in demo mode.",
                "points": []
            },
            problem_statement={
                "intro": "Problems not defined in demo mode.",
                "problems": []
            },
            key_decisions={
                "intro": "Design decisions not documented in demo mode.",
                "decisions": []
            },
            visual_identity={
                "discussed": False,
                "intro": "Visual identity not discussed.",
                "color_palette": [],
                "logo_redesign": {"discussed": False, "before": [], "after": []}
            },
            wireframes={
                "discussed": False,
                "intro": "Wireframes not discussed.",
                "fidelity": "Not mentioned",
                "screens_count": "Not mentioned",
                "notes": ""
            },
            outcomes={
                "type": "none",
                "intro": "No outcomes data available in demo mode.",
                "metrics": [],
                "qualitative": "Not discussed in this project."
            },
            learnings=[
                {"number": "01", "body": "Configure the Groq API key to generate full case studies."}
            ],
            next_steps="Upload a design image and complete the interview to generate a real case study.",
            challenges="Demo mode — Groq API key not configured.",
            screenshots=[],
            meta={
                "completeness_score": 0,
                "completeness_notes": "Demo mode — no API key configured.",
                "missing_sections": [],
                "strongest_section": "",
                "weakest_section": "",
                "is_conceptual_project": True
            }
        )
        session_store.save_case_study(session_id, case)
        return case

    completion = await client.chat.completions.create(
        model=settings.GROQ_GENERATION_MODEL,
        messages=[
            {"role": "system", "content": CASE_STUDY_GENERATOR_PROMPT},
            {"role": "user", "content": json.dumps(payload)},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
        max_tokens=4096,
    )
    content = completion.choices[0].message.content
    try:
        parsed = json.loads(content)
        case = CaseStudy(**parsed)
    except Exception:
        case = CaseStudy(**fallback_case_study())

    session_store.save_case_study(session_id, case)
    return case


def fallback_case_study() -> dict:
    return {
        "title": "Untitled Project",
        "tagline": "Auto-generated case study from interview",
        "badge_tags": ["Portfolio", "UX Design", "Case Study"],
        "overview": {
            "body": "This case study was generated from the interview transcript.",
            "what_label": "What",
            "what": "Details not shared.",
            "why_label": "Why",
            "why": "Details not shared."
        },
        "project_meta": {
            "role": "Product Designer",
            "tools": ["Figma"],
            "timeline": "Not mentioned",
            "platform": "Web",
            "category": "Not mentioned"
        },
        "design_process": {
            "intro": "Process approach from transcript.",
            "stages": [
                {"number": "01", "label": "DISCOVER", "body": "Details not shared."},
                {"number": "02", "label": "DEFINE", "body": "Details not shared."},
                {"number": "03", "label": "IDEATE", "body": "Details not shared."},
                {"number": "04", "label": "DESIGN", "body": "Details not shared."}
            ]
        },
        "user_research": {
            "intro": "Research approach not discussed.",
            "method": "Not mentioned",
            "participant_count": "Not mentioned",
            "key_findings": [],
            "standout_quote": {"text": "", "attribution": ""}
        },
        "personas": [],
        "pain_points": {
            "intro": "Pain points not discussed in this project.",
            "points": []
        },
        "problem_statement": {
            "intro": "Problems not discussed in this project.",
            "problems": []
        },
        "key_decisions": {
            "intro": "Design decisions from transcript.",
            "decisions": []
        },
        "visual_identity": {
            "discussed": False,
            "intro": "Visual identity not discussed.",
            "color_palette": [],
            "logo_redesign": {"discussed": False, "before": [], "after": []}
        },
        "wireframes": {
            "discussed": False,
            "intro": "Wireframes not discussed.",
            "fidelity": "Not mentioned",
            "screens_count": "Not mentioned",
            "notes": ""
        },
        "outcomes": {
            "type": "none",
            "intro": "Outcomes not discussed in this project.",
            "metrics": [],
            "qualitative": "Not discussed in this project."
        },
        "learnings": [
            {"number": "01", "body": "Details not shared."}
        ],
        "next_steps": "Not discussed in this project.",
        "challenges": "Details not shared.",
        "screenshots": [],
        "meta": {
            "completeness_score": 0,
            "completeness_notes": "Fallback generated due to parsing error.",
            "missing_sections": [],
            "strongest_section": "",
            "weakest_section": "",
            "is_conceptual_project": True
        }
    }
