"use client";

import { ProductMedia } from "@/components/catalog/product-media";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  TrashIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { ProductView } from "@/lib/products";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

type ProductAdminCardProps = {
  product: ProductView;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
  onMove: (direccion: "arriba" | "abajo") => void;
  /** Desactiva las flechas en los extremos de la lista. */
  canMoveUp: boolean;
  canMoveDown: boolean;
  /** Las flechas solo tienen sentido sobre la lista completa, sin filtrar. */
  reorderEnabled: boolean;
  busy?: boolean;
};

/** Ficha de una pieza dentro del listado del panel. */
export function ProductAdminCard({
  product,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
  canMoveUp,
  canMoveDown,
  reorderEnabled,
  busy,
}: ProductAdminCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-white transition-opacity duration-200 ease-fluid",
        busy && "opacity-60",
        !product.active && "border-dashed",
      )}
    >
      <div className="flex gap-3 p-3.5 pb-0">
        <ProductMedia
          imageUrl={product.images[0]}
          categorySlug={product.categorySlug}
          alt={product.name}
          sizes="56px"
          className="size-14 shrink-0 rounded-[10px]"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-[0.06em] text-ink-soft uppercase">
            {product.categoryName}
          </p>
          <h3 className="mt-0.5 truncate text-[15px] font-medium text-ink">
            {product.name}
          </h3>
          {product.material ? (
            <p className="truncate text-[11px] text-ink-soft">{product.material}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-3.5 py-3">
        <div className="flex items-baseline gap-1.5">
          {product.compareAtPrice !== null ? (
            <span className="text-[11px] text-ink-soft line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
          <span className="text-[15px] font-medium text-forest">
            {formatPrice(product.price)}
          </span>
        </div>
        {product.discountType !== "none" ? (
          <Badge tone={product.onSale ? "oferta" : "neutral"} size="sm">
            {product.onSale ? "Oferta" : "Programada"}
          </Badge>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-line px-3.5 py-3">
        <div className="flex items-center gap-2 text-[11px] text-ink-soft">
          <Switch
            checked={product.active}
            onChange={onToggleActive}
            disabled={busy}
            label={`${product.name}: visible en la tienda`}
          />
          {product.active ? "Activo" : "Inactivo"}
        </div>

        <div className="flex gap-1.5">
          {reorderEnabled ? (
            <>
              <button
                type="button"
                onClick={() => onMove("arriba")}
                disabled={busy || !canMoveUp}
                aria-label={`Subir ${product.name} en el catálogo`}
                className="grid size-8 place-items-center rounded-lg text-ink transition-colors duration-200 ease-fluid hover:bg-surface disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowUpIcon className="size-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => onMove("abajo")}
                disabled={busy || !canMoveDown}
                aria-label={`Bajar ${product.name} en el catálogo`}
                className="grid size-8 place-items-center rounded-lg text-ink transition-colors duration-200 ease-fluid hover:bg-surface disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowDownIcon className="size-[18px]" />
              </button>
            </>
          ) : null}

          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${product.name}`}
            className="grid size-8 place-items-center rounded-lg text-ink transition-colors duration-200 ease-fluid hover:bg-surface"
          >
            <EditIcon className="size-[18px]" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Eliminar ${product.name}`}
            className="grid size-8 place-items-center rounded-lg text-ink transition-colors duration-200 ease-fluid hover:bg-danger-soft hover:text-danger"
          >
            <TrashIcon className="size-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
