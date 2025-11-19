import * as React from "react";
import { cn } from "@/lib/utils";

type BracketProps = {
  direction?: "left" | "right";
  className?: string;
};

function AtixBracket({ direction = "left", className }: BracketProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 33 66"
      className={cn("h-[1.2em] w-auto text-primary", direction === "left" ? "" : "", className)}
      aria-hidden="true"
    >
      <path d="M32.2449 0.235779H16.1883L3.42191 20.972C-1.14064 28.3715 -1.14064 37.7013 3.42191 45.1008L16.1883 65.8371H32.2449L12.313 33.0364L32.2449 0.235779Z" fill="currentColor" />
    </svg>
  );
}

export function Keyword({ children, className, tight = false }: { children: React.ReactNode; className?: string; tight?: boolean }) {
  return (
    <span className={cn("inline-flex items-center align-baseline", tight ? "gap-0" : "gap-2", className)}>
      <AtixBracket direction="left" className={cn(tight && "mr-0")} />
      <span className="inline-block">{children}</span>
      <AtixBracket direction="right" className={cn(tight && "ml-0" , "-scale-x-100")} />
    </span>
  );
}

export { AtixBracket };