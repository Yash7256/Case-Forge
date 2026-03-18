import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CaseStudy } from "@/types";

interface Props {
  data: CaseStudy;
}

export const CaseStudyPreview = ({ data }: Props) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 pb-2">
            {data.badge_tags.map((tag) => (
              <Badge key={tag} variant="subtle">
                {tag}
              </Badge>
            ))}
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">{data.title}</h2>
          <p className="text-lg text-slate-700">{data.tagline}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge>{data.project_meta.role}</Badge>
            {data.project_meta.tools.map((tool) => (
              <Badge key={tool} variant="subtle">
                {tool}
              </Badge>
            ))}
            <Badge variant="subtle">
              {data.project_meta.platform} · {data.project_meta.category}
            </Badge>
            <Badge variant="subtle">Timeline: {data.project_meta.timeline}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
          <p>{data.overview.body}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                {data.overview.what_label}
              </p>
              <p>{data.overview.what}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                {data.overview.why_label}
              </p>
              <p>{data.overview.why}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.user_research.key_findings.length > 0 && (
        <Card>
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">User Research</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-3">{data.user_research.intro}</p>
            <p className="text-xs text-slate-500 mb-3">
              Method: {data.user_research.method} | Participants: {data.user_research.participant_count}
            </p>
            {data.user_research.key_findings.map((finding, idx) => (
              <div key={idx} className="mb-2 rounded-lg bg-slate-50 p-3">
                <p className="text-sm font-semibold">{finding.label}</p>
                <p className="text-sm text-slate-700">{finding.body}</p>
              </div>
            ))}
            {data.user_research.standout_quote.text && (
              <blockquote className="mt-3 border-l-2 border-slate-300 pl-3 italic text-slate-600">
                "{data.user_research.standout_quote.text}" —{" "}
                {data.user_research.standout_quote.attribution}
              </blockquote>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">Design Process</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">{data.design_process.intro}</p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {data.design_process.stages.map((stage) => (
              <div
                key={stage.number}
                className="rounded-lg border-l-2 border-indigo-500 pl-3"
              >
                <p className="text-xs font-semibold uppercase text-indigo-600">
                  {stage.number} — {stage.label}
                </p>
                <p className="text-sm text-slate-700">{stage.body}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.problem_statement.problems.length > 0 && (
        <Card>
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Problem Statement</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-3">{data.problem_statement.intro}</p>
            {data.problem_statement.problems.map((problem) => (
              <div
                key={problem.number}
                className="mb-2 rounded-lg border-l-2 border-red-400 bg-red-50 p-3"
              >
                <p className="text-sm font-semibold">
                  {problem.number}. {problem.label}
                </p>
                <p className="text-sm text-slate-700">{problem.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.key_decisions.decisions.length > 0 && (
        <Card>
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Key Design Decisions</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-3">{data.key_decisions.intro}</p>
            {data.key_decisions.decisions.map((decision) => (
              <div
                key={decision.number}
                className="mb-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 p-3"
              >
                <p className="text-sm font-semibold">
                  {decision.number}. {decision.title}
                </p>
                <p className="text-sm text-slate-700">{decision.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Challenges</h3>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">{data.challenges}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Next Steps</h3>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">{data.next_steps}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold">Outcomes</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-3">{data.outcomes.intro}</p>
          {data.outcomes.metrics.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {data.outcomes.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg px-3 py-1 font-semibold ${
                    metric.is_projected ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {metric.value} {metric.label}
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-slate-700">{data.outcomes.qualitative}</p>
        </CardContent>
      </Card>

      {data.learnings.length > 0 && (
        <Card>
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Learnings</h3>
          </CardHeader>
          <CardContent>
            {data.learnings.map((learning) => (
              <p key={learning.number} className="mb-2 text-sm text-slate-700">
                <span className="font-semibold">{learning.number}.</span> {learning.body}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {data.meta && (
        <div className="text-xs text-slate-400 text-center">
          Completeness: {data.meta.completeness_score}% | {data.meta.completeness_notes}
        </div>
      )}
    </div>
  );
};
