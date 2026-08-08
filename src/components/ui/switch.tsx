"use client";

import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Texto que lee un lector de pantalla; no se muestra. */
  label: string;
  disabled?: boolean;
  className?: string;
};

/** Interruptor de encendido/apagado con la animación del diseño base. */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-fluid",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-forest" : "bg-line",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm",
          "transition-transform duration-200 ease-fluid",
          checked && "translate-x-4",
        )}
      />
    </button>
  );
}

type SwitchRowProps = SwitchProps & {
  /** Etiqueta visible a la izquierda del interruptor. */
  title: string;
  description?: string;
};

/** Fila con etiqueta a un lado e interruptor al otro. */
export function SwitchRow({
  title,
  description,
  className,
  ...switchProps
}: SwitchRowProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="min-w-0">
        <p className="text-[13px] text-ink">{title}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-ink-soft">{description}</p>
        ) : null}
      </div>
      <Switch {...switchProps} />
    </div>
  );
}
