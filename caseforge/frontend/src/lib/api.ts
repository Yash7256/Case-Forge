import axios from "axios";
import type { CaseStudyResponse, ChatPayload, ChatMessage, UploadResponse, CaseStudy } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

const api = axios.create({
  baseURL: API_URL,
});

async function checkedFetch(url: string, options: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[${res.status}] ${err || res.statusText}`);
  }
  return res;
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await checkedFetch(`${API_URL}/upload`, { method: "POST", body: formData });
  return res.json();
};

export const sendChat = async (
  payload: ChatPayload,
  onToken?: (token: string) => void
): Promise<ChatMessage> => {
  const res = await checkedFetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.body) throw new Error("No response body");
  
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    if (onToken) onToken(chunk);
  }

  return { id: crypto.randomUUID(), role: "assistant", content: full };
};

export const generateCaseStudy = async (sessionId: string): Promise<CaseStudyResponse> => {
  const res = await checkedFetch(`${API_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  return res.json();
};

export const exportPdf = async (caseStudy: CaseStudy): Promise<Blob> => {
  const res = await checkedFetch(`${API_URL}/export/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(caseStudy),
  });
  return res.blob();
};

export default api;
