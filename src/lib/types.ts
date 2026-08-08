/**
 * Tipos que espejan `supabase-schema.sql`.
 *
 * Se mantienen a mano (en vez de generarlos) para que el proyecto no dependa
 * de tener la CLI de Supabase instalada. Si el esquema cambia, este archivo
 * es el único lugar que hay que tocar.
 */

export type DiscountType = "none" | "percent" | "fixed";

export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  position: number;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  material: string | null;
  price: number;
  category_id: string;
  discount_type: DiscountType;
  discount_value: number;
  discount_start: string | null;
  discount_end: string | null;
  /** Columna generada en la base de datos. No considera vigencia por fechas. */
  final_price: number;
  active: boolean;
  /**
   * Orden manual del catálogo: menor número, aparece antes.
   * Opcional porque la columna la agrega `supabase-migracion-2.sql`.
   */
  position?: number;
  created_at: string;
  updated_at: string;
};

/** Producto tal como lo devuelven las consultas del catálogo. */
export type ProductWithRelations = Product & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  images: Pick<ProductImage, "id" | "url" | "position">[];
};

export type Banner = {
  id: string;
  text: string;
  image_url: string | null;
  link_category_id: string | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  created_at: string;
};

export type BannerWithCategory = Banner & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

export type AdminUser = {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

/** Categorías con el conteo de piezas, para el panel. */
export type CategoryWithCount = Category & { productCount: number };

/** Resultado uniforme de los Server Actions del panel. */
export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
