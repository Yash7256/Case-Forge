import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateCaseStudy } from "@/lib/api";
import type { ChatMessage } from "@/types";

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state =
    (location.state as { sessionId?: string; firstMessage?: string; firstQuestion?: string; vision?: Record<string, string> } | null) ||
    {};
  const sessionId = state.sessionId;
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>();

  const initialMessages: ChatMessage[] = useMemo(() => {
    const msgs: ChatMessage[] = [];
    if (state.firstMessage) {
      msgs.push({ id: "intro-1", role: "assistant", content: state.firstMessage });
    }
    if (state.firstQuestion) {
      msgs.push({ id: "intro-2", role: "assistant", content: state.firstQuestion });
    }
    return msgs;
  }, [state.firstMessage, state.firstQuestion]);

  const handleGenerate = async () => {
    if (!sessionId) {
      setError("Upload a design to start a real session.");
      return;
    }
    try {
      setGenerating(true);
      const data = await generateCaseStudy(sessionId);
      navigate("/result", { state: data });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-6 px-4 py-10 md:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Step 2 · Interview</p>
            <h1 className="text-2xl font-semibold text-slate-900">Answer the follow-up questions</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>Restart</Button>
        </div>
        <ChatWindow
          sessionId={sessionId}
          initialMessages={initialMessages}
          onGenerate={handleGenerate}
          generating={generating}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="space-y-4">
        <Card className="bg-white/80">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-2">
              <Badge>Vision analysis</Badge>
              <p className="text-sm text-slate-500">What the AI noticed from your upload</p>
            </div>
            {state.vision ? (
              <dl className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                <div>
                  <dt className="font-semibold">Platform</dt>
                  <dd>{state.vision.platform}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Screen type</dt>
                  <dd>{state.vision.screenType}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Style</dt>
                  <dd>{state.vision.visualStyle}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="font-semibold">Purpose</dt>
                  <dd>{state.vision.purpose}</dd>
                </div>
                {state.vision.notes && (
                  <div className="col-span-2">
                    <dt className="font-semibold">Notes</dt>
                    <dd>{state.vision.notes}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-slate-600">Analysis will appear after upload.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Interview;
