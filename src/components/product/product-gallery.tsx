"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { ProductMedia } from "@/components/catalog/product-media";
import { ZoomInIcon } from "@/components/icons";
import { Lightbox } from "@/components/product/lightbox";
import { Badge } from "@/components/ui/badge";
import type { ProductView } from "@/lib/products";
import { cn } from "@/lib/utils";

const EASE = [0.22, 0.61, 0.36, 1] as const;

type ProductGalleryProps = {
  product: ProductView;
};

/** Foto principal, miniaturas y acceso al visor ampliado. */
export function ProductGallery({ product }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { images } = product;
  const hasThumbs = images.length > 1;

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label={`Ampliar foto de ${product.name}`}
        className="relative block w-full cursor-zoom-in overflow-hidden sm:rounded-2xl"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <ProductMedia
              imageUrl={images[index]}
              categorySlug={product.categorySlug}
              alt={product.name}
              priority
              sizes="(min-width: 640px) 450px, 100vw"
            />
          </motion.div>
        </AnimatePresence>

        {product.onSale ? (
          <Badge tone="oferta" className="absolute top-3.5 left-3.5">
            Oferta
          </Badge>
        ) : product.isNew ? (
          <Badge tone="nuevo" className="absolute top-3.5 left-3.5">
            Nuevo
          </Badge>
        ) : null}
      </button>

      <div className="flex items-center gap-2 px-[18px] pt-3 text-[11px] text-forest sm:px-0">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5">
          <ZoomInIcon className="size-[15px]" />
          Toca la imagen para hacer zoom
        </span>
      </div>

      {hasThumbs ? (
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-[18px] py-3.5 sm:px-0">
          {images.map((image, position) => (
            <button
              key={image}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Ver foto ${position + 1}`}
              aria-current={position === index}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-[10px]",
                "transition-[box-shadow,transform] duration-200 ease-fluid active:scale-95",
                position === index
                  ? "shadow-[0_0_0_2px_var(--color-forest)]"
                  : "shadow-[0_0_0_1px_var(--color-line)]",
              )}
            >
              <ProductMedia
                imageUrl={image}
                categorySlug={product.categorySlug}
                alt=""
                sizes="64px"
              />
            </button>
          ))}
        </div>
      ) : null}

      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={images}
        index={index}
        onIndexChange={setIndex}
        alt={product.name}
        categorySlug={product.categorySlug}
      />
    </div>
  );
}
