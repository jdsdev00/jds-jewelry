"use client";

import { AnimatePresence, motion } from "motion/react";

import { ProductCard } from "@/components/catalog/product-card";
import type { ProductView } from "@/lib/products";

const EASE = [0.22, 0.61, 0.36, 1] as const;

type ProductGridProps = {
  products: ProductView[];
};

/**
 * Cuadrícula del catálogo. Las tarjetas entran, salen y se reacomodan con
 * animación al cambiar de filtro, en vez de saltar de golpe.
 */
export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 md:gap-5.5">
      <AnimatePresence mode="popLayout" initial={false}>
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{
              duration: 0.32,
              ease: EASE,
              // Escalona solo las primeras para que la entrada se sienta
              // encadenada sin retrasar el resto de la página.
              delay: Math.min(index, 7) * 0.035,
            }}
          >
            <ProductCard product={product} priority={index < 4} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
