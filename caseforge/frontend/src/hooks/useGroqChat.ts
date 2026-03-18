import { useEffect, useState } from "react";
import { sendChat } from "@/lib/api";
import type { ChatMessage } from "@/types";

interface UseGroqChatOptions {
  sessionId?: string;
  firstMessage?: ChatMessage;
  initialMessages?: ChatMessage[];
}

export const useGroqChat = ({ sessionId, firstMessage, initialMessages }: UseGroqChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessages?.length) return initialMessages;
    return firstMessage ? [{ ...firstMessage, id: firstMessage.id || crypto.randomUUID() }] : [];
  });
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (initialMessages?.length) {
      setMessages(initialMessages);
      return;
    }
    if (!firstMessage) return;
    setMessages((prev) => {
      const exists = prev.find((m) => m.content === firstMessage.content && m.role === firstMessage.role);
      if (exists) return prev;
      return [{ ...firstMessage, id: firstMessage.id || crypto.randomUUID() }, ...prev];
    });
  }, [firstMessage, initialMessages]);

  const sendMessage = async (text: string) => {
    if (!sessionId) {
      setError("Start by uploading a design first.");
      return;
    }
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const streamId = crypto.randomUUID();
    setMessages((prev) => [...prev, userMessage, { id: streamId, role: "assistant", content: "" }]);
    setIsSending(true);
    setError(undefined);

    try {
      const assistantMessage = await sendChat(
        { session_id: sessionId, message: text },
        (token) =>
          setMessages((prev) =>
            prev.map((m) => (m.id === streamId ? { ...m, content: (m.content || "") + token } : m))
          )
      );
      setMessages((prev) => prev.map((m) => (m.id === streamId ? assistantMessage : m)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  return { messages, isSending, error, sendMessage };
};
