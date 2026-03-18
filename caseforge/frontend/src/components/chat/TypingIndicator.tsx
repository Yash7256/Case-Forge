export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 text-slate-500">
      <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500 [animation-delay:120ms]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500 [animation-delay:240ms]" />
      <span className="text-xs font-medium">CaseForge is thinking...</span>
    </div>
  );
};
