import { todayISO } from "./utils";
import type { DiscountType, ProductWithRelations } from "./types";

/**
 * Forma que consumen los componentes del catálogo.
 *
 * La UI nunca ve las columnas crudas de la base: recibe el precio ya resuelto
 * y las insignias ya decididas. Así el descuento se calcula en un solo lugar.
 */
export type ProductView = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  material: string | null;
  categoryId: string | null;
  categoryName: string;
  categorySlug: string;
  /** Precio que se le cobra hoy al cliente. */
  price: number;
  /** Precio tachado. `null` cuando no hay oferta vigente. */
  compareAtPrice: number | null;
  onSale: boolean;
  isNew: boolean;
  images: string[];
  active: boolean;
  /** Orden manual dentro del catálogo. */
  position: number;

  /* Campos crudos del descuento. La tienda no los usa; el panel los necesita
     para volver a llenar el formulario de edición sin otra consulta. */
  basePrice: number;
  discountType: DiscountType;
  discountValue: number;
  discountStart: string | null;
  discountEnd: string | null;
};

/** Una pieza se marca como "Nuevo" durante sus primeros 30 días. */
const NEW_WINDOW_DAYS = 30;

/**
 * `final_price` es una columna generada que ignora `discount_start` y
 * `discount_end`. La vigencia por fechas se decide aquí.
 */
export function isDiscountLive(
  product: Pick<
    ProductWithRelations,
    "discount_type" | "discount_value" | "discount_start" | "discount_end"
  >,
  today = todayISO(),
): boolean {
  if (product.discount_type === "none") return false;
  if (Number(product.discount_value) <= 0) return false;
  if (product.discount_start && product.discount_start > today) return false;
  if (product.discount_end && product.discount_end < today) return false;
  return true;
}

function isRecent(createdAt: string, today = todayISO()): boolean {
  const created = new Date(createdAt).getTime();
  const now = new Date(`${today}T23:59:59`).getTime();
  const days = (now - created) / 86_400_000;
  return days <= NEW_WINDOW_DAYS;
}

export function toProductView(
  product: ProductWithRelations,
  today = todayISO(),
): ProductView {
  const onSale = isDiscountLive(product, today);
  const basePrice = Number(product.price);
  const finalPrice = Number(product.final_price);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    material: product.material,
    categoryId: product.category?.id ?? null,
    categoryName: product.category?.name ?? "Sin categoría",
    categorySlug: product.category?.slug ?? "sin-categoria",
    price: onSale ? finalPrice : basePrice,
    compareAtPrice: onSale ? basePrice : null,
    onSale,
    // Si está en oferta, esa insignia manda: no se apilan dos.
    isNew: !onSale && isRecent(product.created_at, today),
    images: [...product.images]
      .sort((a, b) => a.position - b.position)
      .map((image) => image.url),
    active: product.active,
    // Cae en 0 mientras `supabase-migracion-2.sql` no se haya ejecutado.
    position: product.position ?? 0,

    basePrice,
    discountType: product.discount_type,
    discountValue: Number(product.discount_value),
    discountStart: product.discount_start,
    discountEnd: product.discount_end,
  };
}

/**
 * Precio final de una pieza tal como lo calcularía la base de datos.
 * Se usa para la vista previa en vivo del formulario del panel.
 */
export function previewFinalPrice(
  price: number,
  discountType: "none" | "percent" | "fixed",
  discountValue: number,
): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  if (discountType === "percent") {
    return Math.round((price - (price * discountValue) / 100) * 100) / 100;
  }
  if (discountType === "fixed") {
    return Math.max(0, Math.round((price - discountValue) * 100) / 100);
  }
  return price;
}

/** Categorías del diseño base, para elegir la ilustración de respaldo. */
export type JewelKind = "ring" | "necklace" | "earrings" | "bracelet";

/**
 * Deduce qué ilustración usar cuando una pieza todavía no tiene fotos.
 * Se apoya en el slug de la categoría y cae en "ring" si no reconoce nada.
 */
export function jewelKindFor(categorySlug: string): JewelKind {
  if (categorySlug.startsWith("colla")) return "necklace";
  if (categorySlug.startsWith("arete")) return "earrings";
  if (categorySlug.startsWith("pulser")) return "bracelet";
  return "ring";
}
