import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface ChatBubbleProps {
  message: ChatMessage;
}

const roleMeta: Record<string, { label: string; tone: string; bubble: string }> = {
  user: {
    label: "You",
    tone: "text-slate-900",
    bubble: "bg-slate-900 text-white",
  },
  assistant: {
    label: "CaseForge AI",
    tone: "text-brand-700",
    bubble: "bg-white text-slate-900 border border-slate-200",
  },
  system: {
    label: "System",
    tone: "text-slate-500",
    bubble: "bg-slate-100 text-slate-700",
  },
};

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const meta = roleMeta[message.role] || roleMeta.assistant;
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}> 
      {!isUser && (
        <div className="mt-1 h-9 w-9 shrink-0 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold">
          CF
        </div>
      )}
      <div className="flex max-w-[75%] flex-col gap-1">
        <span className={cn("text-xs font-semibold uppercase tracking-wide", meta.tone)}>{meta.label}</span>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm shadow-sm transition",
            meta.bubble,
            isUser && "rounded-br-sm"
          )}
        >
          {message.content || "..."}
        </div>
      </div>
      {isUser && (
        <div className="mt-1 h-9 w-9 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
          You
        </div>
      )}
    </div>
  );
};
