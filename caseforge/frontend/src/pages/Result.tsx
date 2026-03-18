import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CaseStudyPreview } from "@/components/preview/CaseStudyPreview";
import { exportPdf } from "@/lib/api";
import type { CaseStudy, CaseStudyResponse } from "@/types";

const fallbackCase: CaseStudy = {
  title: "Placeholder Project",
  tagline: "Illustrative case study for preview",
  badge_tags: ["Mobile App", "Redesign", "UX Design"],
  overview: {
    body: "Describe the project goals, scope, and business context.",
    what_label: "What",
    what: "A brief description of what was designed",
    why_label: "Why",
    why: "The core motivation behind the project",
  },
  project_meta: {
    role: "Product Designer",
    tools: ["Figma", "Notion"],
    timeline: "6 weeks",
    platform: "Web",
    category: "SaaS",
  },
  design_process: {
    intro: "The design process followed a human-centered approach.",
    stages: [
      { number: "01", label: "DISCOVER", body: "Sketches, workshops, and prioritization." },
      { number: "02", label: "DEFINE", body: "Affinity mapping and HMW statements." },
      { number: "03", label: "IDEATE", body: "Low-fi exploration to validate flows." },
      { number: "04", label: "DESIGN", body: "Interactive prototypes for usability testing." },
    ],
  },
  user_research: {
    intro: "Research approach and participant details.",
    method: "Interviews",
    participant_count: "Not mentioned",
    key_findings: [],
    standout_quote: { text: "", attribution: "" },
  },
  personas: [],
  pain_points: {
    intro: "Pain points identified during research.",
    points: [],
  },
  problem_statement: {
    intro: "Problems identified with the current solution.",
    problems: [],
  },
  key_decisions: {
    intro: "Key decisions made during the design process.",
    decisions: [
      { number: "01", title: "Navigation redesign", body: "Redesigned the navigation to improve discoverability." },
      { number: "02", title: "Onboarding flow", body: "Simplified onboarding to reduce drop-off rates." },
    ],
  },
  visual_identity: {
    discussed: false,
    intro: "Visual direction not discussed.",
    color_palette: [],
    logo_redesign: { discussed: false, before: [], after: [] },
  },
  wireframes: {
    discussed: false,
    intro: "Wireframing approach.",
    fidelity: "Lo-fi",
    screens_count: "Not mentioned",
    notes: "",
  },
  outcomes: {
    type: "none",
    intro: "No outcome data available.",
    metrics: [],
    qualitative: "Not discussed in this project.",
  },
  learnings: [
    { number: "01", body: "Iterate early with users; align with engineering weekly." },
    { number: "02", body: "Document decisions and their rationale for future reference." },
  ],
  next_steps: "Scale to more personas and add analytics dashboards.",
  challenges: "Technical constraints and timeline pressure.",
  screenshots: [],
  meta: {
    completeness_score: 50,
    completeness_notes: "Placeholder data — complete the interview for full case study.",
    missing_sections: [],
    strongest_section: "",
    weakest_section: "",
    is_conceptual_project: false,
  },
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as CaseStudyResponse | null) || undefined;
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string>();

  const caseStudy = useMemo(() => state?.case_study ?? fallbackCase, [state]);

  useEffect(() => {
    if (!state) {
      // allow preview without real data
      return;
    }
  }, [state]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await exportPdf(caseStudy);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${caseStudy.title.replace(/\s+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Step 3 · Case Study</p>
          <h1 className="text-2xl font-semibold text-slate-900">Ready to export</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/interview", { state })}>
            Back to chat
          </Button>
          <Button onClick={handleDownload} loading={downloading}>
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <CaseStudyPreview data={caseStudy} />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
};

export default Result;
