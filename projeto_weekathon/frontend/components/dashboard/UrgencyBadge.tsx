"use client";

import { URGENCY_CONFIG, type UrgencyLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  urgency: UrgencyLevel;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

export default function UrgencyBadge({ urgency, size = "md", showDot = true }: Props) {
  const cfg = URGENCY_CONFIG[urgency];

  const sizeClass = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  }[size];

  const dotSize = { sm: "w-1.5 h-1.5", md: "w-2 h-2", lg: "w-2.5 h-2.5" }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold border",
        cfg.bg,
        cfg.color,
        cfg.border,
        sizeClass,
      )}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full flex-shrink-0",
            cfg.dot,
            dotSize,
            cfg.pulse && "animate-pulse",
          )}
        />
      )}
      {cfg.label}
    </span>
  );
}
