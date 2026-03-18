import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: number;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, maxHeight = 480, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props}>
      <div
        className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
        style={{ maxHeight }}
      >
        {children}
      </div>
    </div>
  )
);

ScrollArea.displayName = "ScrollArea";
