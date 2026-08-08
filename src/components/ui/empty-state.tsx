import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** Mensaje para listas vacías o búsquedas sin resultados. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-1 grid size-11 place-items-center rounded-full bg-surface text-ink-soft">
          {icon}
        </div>
      ) : null}
      <p className="text-[15px] text-ink">{title}</p>
      {description ? (
        <p className="max-w-xs text-[13px] text-ink-soft">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
