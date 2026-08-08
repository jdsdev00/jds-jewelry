"use client";

import { Sheet } from "@/components/ui/sheet";
import type { Category } from "@/lib/types";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  /** Aplica un filtro y desplaza hasta la cuadrícula. */
  onSelectCategory: (slug: string) => void;
  /** Desplaza a una sección de la página. */
  onGoToSection: (id: string) => void;
};

const SECTIONS = [
  { id: "catalogo", label: "Catálogo" },
  { id: "ofertas", label: "Ofertas" },
  { id: "contacto", label: "Contacto" },
];

/** Menú lateral de la tienda en móvil. */
export function MobileDrawer({
  open,
  onClose,
  categories,
  onSelectCategory,
  onGoToSection,
}: MobileDrawerProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      title="Menú"
      hideTitle
      widthClassName="max-w-[300px]"
    >
      <nav className="flex flex-col">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => {
              onGoToSection(section.id);
              onClose();
            }}
            className="border-b border-line py-3.5 text-left text-[15px] text-ink transition-colors duration-200 ease-fluid hover:text-forest"
          >
            {section.label}
          </button>
        ))}

        {categories.length > 0 ? (
          <>
            <p className="mt-4 mb-0.5 text-[11px] tracking-[0.14em] text-ink-soft uppercase">
              Categorías
            </p>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  onSelectCategory(category.slug);
                  onClose();
                }}
                className="border-b border-line py-3.5 text-left text-[15px] text-ink transition-colors duration-200 ease-fluid hover:text-forest"
              >
                {category.name}
              </button>
            ))}
          </>
        ) : null}
      </nav>
    </Sheet>
  );
}
