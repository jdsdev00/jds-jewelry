import type { JewelKind } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * Ilustración de respaldo para las piezas que todavía no tienen fotos
 * cargadas en el Storage. Mantiene el catálogo presentable mientras la
 * administradora sube el material real.
 */

const ART: Record<JewelKind, React.ReactNode> = {
  ring: (
    <>
      <circle cx="100" cy="128" r="42" fill="none" stroke="#b8944a" strokeWidth="5" />
      <path
        d="M100 50 L122 78 L100 100 L78 78 Z"
        fill="#c9a24a"
        stroke="#9c7f34"
        strokeWidth="1.5"
      />
      <path d="M100 50 L100 100 M78 78 L122 78" stroke="#9c7f34" strokeWidth="1" />
    </>
  ),
  necklace: (
    <>
      <path d="M46 56 Q100 150 154 56" fill="none" stroke="#b8944a" strokeWidth="4" />
      <path
        d="M100 132 L112 150 L100 168 L88 150 Z"
        fill="#c9a24a"
        stroke="#9c7f34"
        strokeWidth="1.5"
      />
    </>
  ),
  earrings: (
    <>
      <circle cx="72" cy="70" r="16" fill="none" stroke="#b8944a" strokeWidth="4" />
      <path
        d="M72 86 L80 118 L72 130 L64 118 Z"
        fill="#c9a24a"
        stroke="#9c7f34"
        strokeWidth="1.2"
      />
      <circle cx="128" cy="70" r="16" fill="none" stroke="#b8944a" strokeWidth="4" />
      <path
        d="M128 86 L136 118 L128 130 L120 118 Z"
        fill="#c9a24a"
        stroke="#9c7f34"
        strokeWidth="1.2"
      />
    </>
  ),
  bracelet: (
    <>
      <ellipse
        cx="100"
        cy="110"
        rx="66"
        ry="34"
        fill="none"
        stroke="#b8944a"
        strokeWidth="5"
      />
      <circle cx="46" cy="104" r="4" fill="#c9a24a" />
      <circle cx="100" cy="76" r="4" fill="#c9a24a" />
      <circle cx="154" cy="104" r="4" fill="#c9a24a" />
    </>
  ),
};

type JewelArtProps = {
  kind: JewelKind;
  className?: string;
};

export function JewelArt({ kind, className }: JewelArtProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={cn("block h-full w-full", className)}
    >
      {ART[kind]}
    </svg>
  );
}
