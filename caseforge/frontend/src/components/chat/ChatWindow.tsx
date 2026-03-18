import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "./ChatBubble";
import { TypingIndicator } from "./TypingIndicator";
import { useGroqChat } from "@/hooks/useGroqChat";
import type { ChatMessage } from "@/types";

interface ChatWindowProps {
  sessionId?: string;
  firstMessage?: ChatMessage;
  initialMessages?: ChatMessage[];
  onGenerate?: () => void;
  generating?: boolean;
}

export const ChatWindow = ({ sessionId, firstMessage, initialMessages, onGenerate, generating }: ChatWindowProps) => {
  const [input, setInput] = useState("");
  const { messages, isSending, error, sendMessage } = useGroqChat({ sessionId, firstMessage, initialMessages });
  const endRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input.trim());
    setInput("");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div className="flex h-full flex-col gap-4">
      <ScrollArea className="flex-1 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner" maxHeight={520}>
        <div className="flex min-h-full flex-col justify-end gap-4">
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}
          {isSending && <TypingIndicator />}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-glass">
        <div className="flex gap-3">
          <Input
            value={input}
            placeholder="Answer in detail to build a stronger case study..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} loading={isSending} disabled={!sessionId}>
            Send
          </Button>
          {onGenerate && (
            <Button variant="outline" onClick={onGenerate} loading={generating} disabled={!sessionId}>
              Generate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
