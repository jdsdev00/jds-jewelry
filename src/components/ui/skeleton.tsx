import { cn } from "@/lib/utils";

/** Bloque gris que ocupa el sitio del contenido mientras carga. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-line/70", className)}
    />
  );
}
