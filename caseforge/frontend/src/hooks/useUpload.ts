import { useState } from "react";
import { uploadImage } from "@/lib/api";
import type { UploadResponse, ChatMessage, VisionAnalysis } from "@/types";

interface UploadState {
  sessionId?: string;
  analysis?: VisionAnalysis;
  firstMessage?: ChatMessage;
  isUploading: boolean;
  error?: string;
}

export const useUpload = () => {
  const [state, setState] = useState<UploadState>({ isUploading: false });

  const handleUpload = async (file: File) => {
    setState((s) => ({ ...s, isUploading: true, error: undefined }));
    try {
      const payload = await uploadImage(file);
      setState({
        isUploading: false,
        sessionId: payload.session_id,
        analysis: undefined,
        firstMessage: {
          id: "intro",
          role: "assistant",
          content: payload.message || payload.first_question,
        },
      });
      return payload;
    } catch (error) {
      setState((s) => ({ ...s, isUploading: false, error: (error as Error).message }));
      throw error;
    }
  };

  return { ...state, handleUpload };
};
