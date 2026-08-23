
"use client";

import { SearchIcon } from "@/components/icons";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
// c

type CatalogHeaderProps = {
  searchOpen: boolean;
  onToggleSearch: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onGoToSection: (id: string) => void;
};

const NAV_LINKS = [
  { id: "catalogo", label: "Catálogo" },
  { id: "ofertas", label: "Ofertas" },
  { id: "contacto", label: "Contacto" },
];


export function CatalogHeader({
  searchOpen,
  onToggleSearch,
  menuOpen,
  onToggleMenu,
  onGoToSection,
}: CatalogHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-[#042B26] px-[18px] py-3.5 md:grid md:grid-cols-3 md:px-8 md:py-1">
      <div className="flex items-center md:justify-self-start">
        <Logo />
      </div>

      <nav className="hidden gap-8 text-[13px] tracking-[0.03em] text-[#D5B36B] md:flex md:justify-center md:justify-self-center">
        {NAV_LINKS.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => onGoToSection(link.id)}
            className="transition-opacity duration-200 ease-fluid hover:opacity-70"
          >
            {link.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-5 md:justify-self-end">
        <button
          type="button"
          onClick={onToggleSearch}
          aria-label="Buscar"
          aria-expanded={searchOpen}
          className="text-[#D5B36B] transition-opacity duration-200 ease-fluid active:opacity-50"
        >
          <SearchIcon />
        </button>

        <button
          type="button"
          onClick={onToggleMenu}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          className="flex w-5 flex-col gap-1 md:hidden"
        >
          <span
            className={cn(
              "block h-0.5 bg-[#D5B36B] transition-transform duration-250 ease-fluid",
              menuOpen && "translate-y-1.5 rotate-45",
            )}
          />
          <span
            className={cn(
              "block h-0.5 bg-[#D5B36B] transition-opacity duration-200 ease-fluid",
              menuOpen && "opacity-0",
            )}
          />
          <span
            className={cn(
              "block h-0.5 bg-[#D5B36B] transition-transform duration-250 ease-fluid",
              menuOpen && "-translate-y-1.5 -rotate-45",
            )}
          />
        </button>
      </div>
    </div>
  );
}