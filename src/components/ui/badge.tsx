import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BadgeTone = "oferta" | "nuevo" | "neutral" | "inactivo";

const TONES: Record<BadgeTone, string> = {
  oferta: "bg-gold text-white",
  nuevo: "bg-forest text-white",
  neutral: "bg-surface text-ink-soft",
  inactivo: "bg-line text-ink-soft",
};

type BadgeProps = {
  tone?: BadgeTone;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
};

/** Etiqueta corta: "Oferta", "Nuevo", "Inactivo". */
export function Badge({
  tone = "neutral",
  size = "md",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[10px] font-medium tracking-[0.04em] uppercase",
        size === "sm" ? "px-2 py-[3px] text-[9px]" : "px-2.5 py-1 text-[10px]",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
