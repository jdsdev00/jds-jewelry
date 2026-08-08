import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

type LogoMarkProps = {
  /** `dark` para fondos claros, `gold` para el verde de la marca. */
  tone?: "dark" | "gold";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "size-8 text-[12px]",
  md: "size-[34px] text-[13px]",
  lg: "size-11 text-base",
} as const;

/** Monograma "JDS" dentro de un círculo. */
export function LogoMark({ tone = "dark", size = "md", className }: LogoMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full border font-serif",
        tone === "gold" ? "border-gold text-gold" : "border-forest text-forest",
        SIZES[size],
        className,
      )}
    >
      {site.shortName}
    </span>
  );
}

type LogoProps = {
  tone?: "dark" | "light";
  className?: string;
};

/** Monograma + nombre de la marca. */
export function Logo({ tone = "dark", className }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark tone={tone === "light" ? "gold" : "dark"} size={tone === "light" ? "sm" : "md"} />
      <span
        className={cn(
          "font-serif tracking-[0.03em]",
          tone === "light" ? "text-base text-white" : "text-lg text-forest",
        )}
      >
        {site.name}
      </span>
    </span>
  );
}
