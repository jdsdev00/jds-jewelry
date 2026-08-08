"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

import { TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useOverlay } from "@/hooks/use-overlay";

/**
 * Modal de confirmación para acciones que no se pueden deshacer.
 * Se usa antes de borrar piezas, categorías y banners.
 */

const EASE = [0.22, 0.61, 0.36, 1] as const;

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /** Bloquea la confirmación hasta que falte algo por decidir. */
  confirmDisabled?: boolean;
  /** Contenido extra entre el texto y los botones, p. ej. un desplegable. */
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loading = false,
  confirmDisabled = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const containerRef = useOverlay<HTMLDivElement>(open, onCancel);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-60 grid place-items-center p-5">
          <motion.button
            type="button"
            aria-label="Cancelar"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute inset-0 bg-forest/45 backdrop-blur-[2px]"
          />

          <motion.div
            ref={containerRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="relative w-full max-w-[340px] rounded-2xl bg-white p-6 text-center shadow-2xl outline-none"
          >
            <div className="mx-auto mb-3.5 grid size-11 place-items-center rounded-full bg-danger-soft text-danger">
              <TrashIcon />
            </div>
            <h3 id="confirm-title" className="font-serif text-[17px] text-ink">
              {title}
            </h3>
            <p id="confirm-description" className="mt-1.5 text-[13px] text-ink-soft">
              {description}
            </p>

            {children ? <div className="mt-4 text-left">{children}</div> : null}

            <div className="mt-5 flex gap-2.5">
              <Button variant="ghost" fullWidth onClick={onCancel} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={onConfirm}
                loading={loading}
                disabled={confirmDisabled}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
