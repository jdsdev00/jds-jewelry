"use client";

import { useEffect, useRef } from "react";

import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Filtro especial que junta todas las piezas con descuento vigente. */
export const OFFERS_FILTER = "ofertas";
export const ALL_FILTER = "todo";

type CategoryChipsProps = {
  categories: Category[];
  active: string;
  onChange: (value: string) => void;
  /** Oculta el chip de ofertas cuando no hay ninguna pieza rebajada. */
  showOffers?: boolean;
};

/**
 * Fila de filtros con scroll horizontal. Al cambiar de filtro, el chip activo
 * se acomoda dentro de la vista para que no quede escondido en el borde.
 */
export function CategoryChips({
  categories,
  active,
  onChange,
  showOffers = true,
}: CategoryChipsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chip = listRef.current?.querySelector<HTMLElement>(
      `[data-filter="${active}"]`,
    );
    chip?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  const options = [
    { value: ALL_FILTER, label: "Todo" },
    ...categories.map((category) => ({
      value: category.slug,
      label: category.name,
    })),
    ...(showOffers ? [{ value: OFFERS_FILTER, label: "Ofertas" }] : []),
  ];

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Filtrar por categoría"
      className="no-scrollbar flex gap-2 overflow-x-auto border-b border-line px-[18px] py-3.5 md:px-8"
    >
      {options.map((option) => {
        const isActive = option.value === active;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-filter={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs tracking-[0.03em] whitespace-nowrap",
              "transition-[background-color,border-color,color,transform] duration-200 ease-fluid",
              "active:scale-95",
              isActive
                ? "border-forest bg-forest text-white"
                : "border-line text-ink hover:border-ink-soft",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
