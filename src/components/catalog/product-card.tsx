import Link from "next/link";

import { ProductMedia } from "@/components/catalog/product-media";
import { Badge } from "@/components/ui/badge";
import type { ProductView } from "@/lib/products";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: ProductView;
  /** Adelanta la carga de la foto en las primeras piezas visibles. */
  priority?: boolean;
  className?: string;
};

/** Tarjeta de una pieza en la cuadrícula del catálogo. */
export function ProductCard({ product, priority, className }: ProductCardProps) {
  return (
    <Link
      href={`/producto/${product.slug}`}
      className={cn(
        "group block overflow-hidden rounded-2xl bg-white text-left",
        "shadow-[0_1px_2px_rgba(12,35,24,0.05),0_0_0_1px_var(--color-line)]",
        "transition-[transform,box-shadow] duration-200 ease-fluid",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(12,35,24,0.09),0_0_0_1px_var(--color-line)]",
        "active:scale-[0.97]",
        className,
      )}
    >
      <div className="relative">
        <ProductMedia
          imageUrl={product.images[0]}
          categorySlug={product.categorySlug}
          alt={product.name}
          priority={priority}
          sizes="(min-width: 900px) 22vw, (min-width: 640px) 30vw, 45vw"
          className="transition-transform duration-500 ease-fluid group-hover:scale-[1.03]"
        />
        {product.onSale ? (
          <Badge tone="oferta" size="sm" className="absolute top-2.5 left-2.5">
            Oferta
          </Badge>
        ) : product.isNew ? (
          <Badge tone="nuevo" size="sm" className="absolute top-2.5 left-2.5">
            Nuevo
          </Badge>
        ) : null}
      </div>

      <div className="px-3.5 pt-3 pb-4">
        <p className="text-[9px] tracking-[0.1em] text-ink-soft uppercase">
          {product.categoryName}
        </p>
        <h3 className="mt-1.5 font-sans text-[15px] font-medium text-ink">
          {product.name}
        </h3>
        {product.material ? (
          <p className="mt-0.5 mb-2 text-[11px] text-ink-soft">{product.material}</p>
        ) : (
          <div className="mb-2" />
        )}
        <div className="flex flex-wrap items-baseline gap-1.5">
          {product.compareAtPrice !== null ? (
            <span className="text-[11px] text-ink-soft line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
          <span className="text-sm font-medium text-forest">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
