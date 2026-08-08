import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number | string;
  hint?: string;
  className?: string;
};

/** Tarjeta de cifra para el resumen del panel. */
export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white px-5 py-4.5",
        className,
      )}
    >
      <p className="text-[11px] tracking-[0.08em] text-ink-soft uppercase">
        {label}
      </p>
      <p className="mt-1.5 font-serif text-[28px] leading-none text-forest">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[11px] text-ink-soft">{hint}</p> : null}
    </div>
  );
}
