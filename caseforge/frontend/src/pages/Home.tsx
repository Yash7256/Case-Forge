import { useNavigate } from "react-router-dom";
import { UploadZone } from "@/components/upload/UploadZone";
import { Card, CardContent } from "@/components/ui/card";
import { useUpload } from "@/hooks/useUpload";
import type { UploadResponse } from "@/types";

const Home = () => {
  const navigate = useNavigate();
  const { handleUpload, isUploading, error } = useUpload();

  const onUploaded = (payload: UploadResponse) => {
    navigate("/interview", {
      state: {
        sessionId: payload.session_id,
        firstMessage: payload.message,
        firstQuestion: payload.first_question,
        vision: payload.vision,
      },
    });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-4 text-center">
        <p className="mx-auto w-fit rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-700 shadow">AI case studies in minutes</p>
        <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">Upload a mockup. Get a polished UX case study.</h1>
        <p className="text-lg text-slate-600 md:text-xl">
          CaseForge interviews you like a senior UX reviewer, then generates a publication-ready PDF with design analysis, decisions, and outcomes.
        </p>
      </div>

      <Card className="overflow-hidden border-none bg-gradient-to-br from-white to-slate-50 shadow-xl">
        <CardContent className="p-8">
          <UploadZone onUploaded={onUploaded} onUpload={handleUpload} onError={(msg) => console.error(msg)} isUploading={isUploading} />
          {error && <p className="pt-3 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </main>
  );
};

export default Home;
