from __future__ import annotations
from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


Role = Literal["user", "assistant", "system"]


class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: "msg_" + datetime.utcnow().isoformat())
    role: Role
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RiskOpportunity(BaseModel):
    severity: str
    note: str


class VisionAnalysis(BaseModel):
    platform: Optional[str] = "unknown"
    screenType: Optional[str] = "unknown"
    visualStyle: Optional[str] = "unknown"
    purpose: Optional[str] = "unknown"
    notes: Optional[str] = None
    screen_type: Optional[str] = None
    app_category: Optional[str] = None
    polish_level: Optional[str] = None
    primary_user_action: Optional[str] = None
    strengths: Optional[List[str]] = None
    risks_and_opportunities: Optional[List[RiskOpportunity]] = None
    interview_questions: Optional[List[str]] = None
    opening_message: Optional[str] = None
    first_question: Optional[str] = None


class ColorSwatch(BaseModel):
    name: str
    hex: str
    usage: str


class Typography(BaseModel):
    font_family: str
    weights_used: List[str]
    rationale: str


class LogoRedesign(BaseModel):
    discussed: bool
    before: List[str]
    after: List[str]


class VisualIdentity(BaseModel):
    discussed: bool
    intro: str
    color_palette: List[ColorSwatch]
    typography: Optional[Typography] = None
    logo_redesign: LogoRedesign


class ProcessStage(BaseModel):
    number: str
    label: str
    body: str


class DesignProcess(BaseModel):
    intro: str
    stages: List[ProcessStage]


class KeyFinding(BaseModel):
    label: str
    body: str


class StandoutQuote(BaseModel):
    text: str
    attribution: str


class UserResearch(BaseModel):
    intro: str
    method: str
    participant_count: str
    key_findings: List[KeyFinding]
    standout_quote: StandoutQuote


class Persona(BaseModel):
    name: str
    descriptor: str
    background: str
    goals: List[str]
    frustrations: List[str]


class PainPoint(BaseModel):
    number: str
    label: str
    body: str


class PainPoints(BaseModel):
    intro: str
    points: List[PainPoint]


class Problem(BaseModel):
    number: str
    label: str
    body: str


class ProblemStatement(BaseModel):
    intro: str
    problems: List[Problem]


class Decision(BaseModel):
    number: str
    title: str
    body: str


class KeyDecisions(BaseModel):
    intro: str
    decisions: List[Decision]


class Wireframes(BaseModel):
    discussed: bool
    intro: str
    fidelity: str
    screens_count: str
    notes: str


class Metric(BaseModel):
    value: str
    label: str
    reason: str
    is_projected: bool


class Outcomes(BaseModel):
    type: str
    intro: str
    metrics: List[Metric]
    qualitative: str


class Learning(BaseModel):
    number: str
    body: str


class Overview(BaseModel):
    body: str
    what_label: str
    what: str
    why_label: str
    why: str


class ProjectMeta(BaseModel):
    role: str
    tools: List[str]
    timeline: str
    platform: str
    category: str


class CaseStudyMeta(BaseModel):
    completeness_score: int
    completeness_notes: str
    missing_sections: List[str]
    strongest_section: str
    weakest_section: str
    is_conceptual_project: bool


class CaseStudy(BaseModel):
    title: str
    tagline: str
    badge_tags: List[str]
    overview: Overview
    project_meta: ProjectMeta
    design_process: DesignProcess
    user_research: UserResearch
    personas: List[Persona]
    pain_points: PainPoints
    problem_statement: ProblemStatement
    key_decisions: KeyDecisions
    visual_identity: VisualIdentity
    wireframes: Wireframes
    outcomes: Outcomes
    learnings: List[Learning]
    next_steps: str
    challenges: str
    screenshots: List[str] = Field(default_factory=list)
    meta: CaseStudyMeta


class UploadResponse(BaseModel):
    session_id: str
    first_message: ChatMessage
    analysis: VisionAnalysis


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(ChatMessage):
    pass


class GenerateRequest(BaseModel):
    session_id: str


class CaseStudyResponse(BaseModel):
    session_id: str
    case_study: CaseStudy


class PdfExportRequest(CaseStudy):
    pass
