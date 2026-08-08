"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { JewelArt } from "@/components/catalog/jewel-art";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/icons";
import { useOverlay } from "@/hooks/use-overlay";
import { jewelKindFor } from "@/lib/products";

const EASE = [0.22, 0.61, 0.36, 1] as const;
const MIN_SCALE = 1;
const MAX_SCALE = 3;

type LightboxProps = {
  open: boolean;
  onClose: () => void;
  images: string[];
  index: number;
  onIndexChange: (index: number) => void;
  alt: string;
  categorySlug: string;
};

/**
 * Visor a pantalla completa con zoom y arrastre.
 *
 * El transform se escribe directo sobre el nodo mientras se arrastra: si
 * pasara por el estado de React, cada movimiento del dedo dispararía un
 * render y el gesto se sentiría pesado.
 */
export function Lightbox({
  open,
  onClose,
  images,
  index,
  onIndexChange,
  alt,
  categorySlug,
}: LightboxProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  const transform = useRef({ scale: 1, x: 0, y: 0 });
  const drag = useRef<{ active: boolean; startX: number; startY: number }>({
    active: false,
    startX: 0,
    startY: 0,
  });
  /** Punteros activos, para detectar el pellizco de dos dedos. */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);

  const [zoomed, setZoomed] = useState(false);
  const hasMultiple = images.length > 1;

  const applyTransform = useCallback(() => {
    const node = stageRef.current;
    if (!node) return;
    const { scale, x, y } = transform.current;
    node.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    node.style.cursor = scale > 1 ? (drag.current.active ? "grabbing" : "grab") : "zoom-in";
  }, []);

  const resetZoom = useCallback(() => {
    transform.current = { scale: 1, x: 0, y: 0 };
    setZoomed(false);
    applyTransform();
  }, [applyTransform]);

  const setScale = useCallback(
    (next: number) => {
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
      transform.current.scale = clamped;
      if (clamped === MIN_SCALE) {
        transform.current.x = 0;
        transform.current.y = 0;
      }
      setZoomed(clamped > MIN_SCALE);
      applyTransform();
    },
    [applyTransform],
  );

  /**
   * El encuadre se devuelve a su sitio al cerrar y al cambiar de foto, en vez
   * de en un efecto: así el visor siempre se abre a escala 1 sin provocar un
   * render extra en cadena.
   */
  const handleClose = useCallback(() => {
    resetZoom();
    onClose();
  }, [resetZoom, onClose]);

  const containerRef = useOverlay<HTMLDivElement>(open, handleClose);

  const goTo = useCallback(
    (direction: 1 | -1) => {
      if (!hasMultiple) return;
      resetZoom();
      onIndexChange((index + direction + images.length) % images.length);
    },
    [hasMultiple, index, images.length, onIndexChange, resetZoom],
  );

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goTo(1);
      if (event.key === "ArrowLeft") goTo(-1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, goTo]);

  function handleWheel(event: React.WheelEvent) {
    event.preventDefault();
    setScale(transform.current.scale + (event.deltaY < 0 ? 0.2 : -0.2));
  }

  function handleDoubleClick() {
    setScale(transform.current.scale > MIN_SCALE ? MIN_SCALE : 2);
  }

  function distanceBetweenPointers() {
    const [a, b] = Array.from(pointers.current.values());
    if (!a || !b) return 0;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function handlePointerDown(event: React.PointerEvent) {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    (event.target as Element).setPointerCapture?.(event.pointerId);

    if (pointers.current.size === 2) {
      pinchStart.current = {
        distance: distanceBetweenPointers(),
        scale: transform.current.scale,
      };
      drag.current.active = false;
      return;
    }

    if (transform.current.scale > MIN_SCALE) {
      drag.current = {
        active: true,
        startX: event.clientX - transform.current.x,
        startY: event.clientY - transform.current.y,
      };
      applyTransform();
    }
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const distance = distanceBetweenPointers();
      if (distance > 0) {
        setScale(
          (pinchStart.current.scale * distance) / pinchStart.current.distance,
        );
      }
      return;
    }

    if (!drag.current.active) return;
    transform.current.x = event.clientX - drag.current.startX;
    transform.current.y = event.clientY - drag.current.startY;
    applyTransform();
  }

  function handlePointerUp(event: React.PointerEvent) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      drag.current.active = false;
      applyTransform();
    }
  }

  const currentImage = images[index];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${alt}, vista ampliada`}
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="fixed inset-0 z-50 flex touch-none items-center justify-center overflow-hidden bg-[#08140e]/95 outline-none"
          onClick={(event) => {
            if (event.target === event.currentTarget) handleClose();
          }}
        >
          <div className="absolute top-4 right-4 z-10">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar vista ampliada"
              className="grid size-9 place-items-center rounded-full bg-white/12 text-white transition-colors duration-200 ease-fluid hover:bg-white/20"
            >
              <CloseIcon />
            </button>
          </div>

          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={() => goTo(-1)}
                aria-label="Foto anterior"
                className="absolute top-1/2 left-3.5 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white transition-colors duration-200 ease-fluid hover:bg-white/20"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                onClick={() => goTo(1)}
                aria-label="Foto siguiente"
                className="absolute top-1/2 right-3.5 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white transition-colors duration-200 ease-fluid hover:bg-white/20"
              >
                <ChevronRightIcon />
              </button>
            </>
          ) : null}

          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="relative h-[88vw] max-h-[560px] w-[88vw] max-w-[560px] overflow-hidden"
          >
            <div
              ref={stageRef}
              onWheel={handleWheel}
              onDoubleClick={handleDoubleClick}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ willChange: "transform" }}
              className="relative h-full w-full cursor-zoom-in"
            >
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={alt}
                  fill
                  sizes="(min-width: 640px) 560px, 88vw"
                  draggable={false}
                  className="pointer-events-none object-contain select-none"
                />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <JewelArt
                    kind={jewelKindFor(categorySlug)}
                    className="h-1/2 w-1/2"
                  />
                </div>
              )}
            </div>
          </motion.div>

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-[11px] tracking-[0.02em] text-white/70">
            {zoomed
              ? "Arrastra para mover · doble toque para volver"
              : "Pellizca o usa la rueda para acercar"}
            {hasMultiple ? ` · ${index + 1} de ${images.length}` : ""}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
