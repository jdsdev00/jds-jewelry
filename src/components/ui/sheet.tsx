"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

import { CloseIcon } from "@/components/icons";
import { useOverlay } from "@/hooks/use-overlay";
import { cn } from "@/lib/utils";

/**
 * Panel que entra deslizándose desde un borde de la pantalla.
 *
 * Lo usan el menú de la tienda, el formulario de producto y el de banner.
 * En móvil ocupa casi todo el ancho; en pantallas grandes se queda en una
 * columna fija a la derecha.
 */

const EASE = [0.22, 0.61, 0.36, 1] as const;

type SheetProps = {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title?: string;
  /** Oculta el título visualmente pero lo deja para lectores de pantalla. */
  hideTitle?: boolean;
  footer?: ReactNode;
  widthClassName?: string;
  children: ReactNode;
};

export function Sheet({
  open,
  onClose,
  side = "right",
  title,
  hideTitle = false,
  footer,
  widthClassName = "max-w-[420px]",
  children,
}: SheetProps) {
  const containerRef = useOverlay<HTMLDivElement>(open, onClose);
  const offscreen = side === "right" ? "100%" : "-100%";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute inset-0 bg-forest/40 backdrop-blur-[2px]"
          />

          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={{ x: offscreen }}
            animate={{ x: 0 }}
            exit={{ x: offscreen }}
            transition={{ duration: 0.34, ease: EASE }}
            className={cn(
              "absolute inset-y-0 flex w-full flex-col bg-white shadow-2xl outline-none",
              side === "right" ? "right-0" : "left-0",
              widthClassName,
            )}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2
                className={cn(
                  "font-serif text-lg text-forest",
                  hideTitle && "sr-only",
                )}
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar panel"
                className={cn(
                  "-mr-1 ml-auto grid size-9 place-items-center rounded-lg text-ink",
                  "transition-colors duration-200 ease-fluid hover:bg-surface",
                )}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              {children}
            </div>

            {footer ? (
              <div className="flex justify-end gap-2.5 border-t border-line px-5 py-4">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
