"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

import { CloseIcon, SearchIcon } from "@/components/icons";

const EASE = [0.22, 0.61, 0.36, 1] as const;

type SearchBarProps = {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
};

/** Buscador que se despliega bajo el header al tocar la lupa. */
export function SearchBar({ open, value, onChange, onClose }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.26, ease: EASE }}
          className="overflow-hidden border-b border-line"
        >
          <div className="flex items-center gap-2.5 bg-surface px-[18px] py-3.5 md:px-8">
            <SearchIcon className="shrink-0 text-ink-soft" />
            <input
              ref={inputRef}
              type="search"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") onClose();
              }}
              placeholder="Buscar por nombre o material..."
              aria-label="Buscar piezas"
              className="w-full flex-1 bg-transparent text-sm text-ink placeholder:text-ink-soft focus:outline-none"
            />
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Borrar búsqueda"
                className="shrink-0 rounded-full p-1 text-ink-soft transition-colors duration-200 ease-fluid hover:text-ink"
              >
                <CloseIcon className="size-4" />
              </button>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
