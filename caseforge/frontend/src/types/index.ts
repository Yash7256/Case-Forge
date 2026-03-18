export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  created_at?: string;
}

export interface RiskOpportunity {
  severity: string;
  note: string;
}

export interface VisionAnalysis {
  platform: string;
  screenType: string;
  visualStyle: string;
  purpose: string;
  notes?: string;
  screen_type?: string;
  app_category?: string;
  polish_level?: string;
  primary_user_action?: string;
  strengths?: string[];
  risks_and_opportunities?: RiskOpportunity[];
  interview_questions?: string[];
  opening_message?: string;
  first_question?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  usage: string;
}

export interface Typography {
  font_family: string;
  weights_used: string[];
  rationale: string;
}

export interface LogoRedesign {
  discussed: boolean;
  before: string[];
  after: string[];
}

export interface VisualIdentity {
  discussed: boolean;
  intro: string;
  color_palette: ColorSwatch[];
  typography?: Typography;
  logo_redesign: LogoRedesign;
}

export interface ProcessStage {
  number: string;
  label: string;
  body: string;
}

export interface DesignProcess {
  intro: string;
  stages: ProcessStage[];
}

export interface KeyFinding {
  label: string;
  body: string;
}

export interface StandoutQuote {
  text: string;
  attribution: string;
}

export interface UserResearch {
  intro: string;
  method: string;
  participant_count: string;
  key_findings: KeyFinding[];
  standout_quote: StandoutQuote;
}

export interface Persona {
  name: string;
  descriptor: string;
  background: string;
  goals: string[];
  frustrations: string[];
}

export interface PainPoint {
  number: string;
  label: string;
  body: string;
}

export interface PainPoints {
  intro: string;
  points: PainPoint[];
}

export interface Problem {
  number: string;
  label: string;
  body: string;
}

export interface ProblemStatement {
  intro: string;
  problems: Problem[];
}

export interface Decision {
  number: string;
  title: string;
  body: string;
}

export interface KeyDecisions {
  intro: string;
  decisions: Decision[];
}

export interface Wireframes {
  discussed: boolean;
  intro: string;
  fidelity: string;
  screens_count: string;
  notes: string;
}

export interface Metric {
  value: string;
  label: string;
  reason: string;
  is_projected: boolean;
}

export interface Outcomes {
  type: "real" | "projected" | "none";
  intro: string;
  metrics: Metric[];
  qualitative: string;
}

export interface Learning {
  number: string;
  body: string;
}

export interface Overview {
  body: string;
  what_label: string;
  what: string;
  why_label: string;
  why: string;
}

export interface ProjectMeta {
  role: string;
  tools: string[];
  timeline: string;
  platform: string;
  category: string;
}

export interface CaseStudyMeta {
  completeness_score: number;
  completeness_notes: string;
  missing_sections: string[];
  strongest_section: string;
  weakest_section: string;
  is_conceptual_project: boolean;
}

export interface CaseStudy {
  title: string;
  tagline: string;
  badge_tags: string[];
  overview: Overview;
  project_meta: ProjectMeta;
  design_process: DesignProcess;
  user_research: UserResearch;
  personas: Persona[];
  pain_points: PainPoints;
  problem_statement: ProblemStatement;
  key_decisions: KeyDecisions;
  visual_identity: VisualIdentity;
  wireframes: Wireframes;
  outcomes: Outcomes;
  learnings: Learning[];
  next_steps: string;
  challenges: string;
  screenshots?: string[];
  meta: CaseStudyMeta;
}

export interface UploadResponse {
  session_id: string;
  message: string;
  first_question: string;
  vision?: VisionAnalysis;
}

export interface ChatPayload {
  session_id: string;
  message: string;
}

export interface CaseStudyResponse {
  session_id: string;
  case_study: CaseStudy;
}
