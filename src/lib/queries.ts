import "server-only";

import { publicSupabase } from "./supabase/public";
import { createClient } from "./supabase/server";
import { toProductView, type ProductView } from "./products";
import { todayISO } from "./utils";
import type {
  BannerWithCategory,
  Category,
  CategoryWithCount,
  ProductWithRelations,
} from "./types";

/**
 * Consultas de lectura.
 *
 * Las de la tienda usan el cliente anónimo (`publicSupabase`), así que no
 * dependen de cookies y sus páginas se pueden servir desde caché. Las del
 * panel usan el cliente con sesión, porque necesitan que RLS reconozca a la
 * administradora para devolver también las piezas inactivas.
 */

const PRODUCT_COLUMNS = `
  id, name, slug, description, material, price, category_id,
  discount_type, discount_value, discount_start, discount_end,
  final_price, active, created_at, updated_at,
  category:categories ( id, name, slug ),
  images:product_images ( id, url, position )
` as const;

/*
 * Orden del catálogo, usado tanto en la tienda como en el panel: primero lo
 * que la administradora colocó arriba (`position` ascendente) y, a igualdad de
 * posición, lo más reciente. Una pieza nueva entra con posición 0, así que
 * aparece al principio hasta que se reordene.
 */

/** Código de PostgREST para "esa columna no existe". */
const COLUMNA_INEXISTENTE = "42703";

/**
 * `products.position` la agrega `supabase-migracion-2.sql`.
 *
 * Se comprueba una vez por proceso si la migración ya corrió, para que la
 * aplicación funcione tanto antes como después de aplicarla y desplegar el
 * código no dependa del orden. Cuando la migración esté aplicada en todos los
 * entornos, esta detección y la rama sin orden manual se pueden borrar.
 */
let hayColumnaPosition: boolean | null = null;

async function soportaOrdenManual(): Promise<boolean> {
  if (hayColumnaPosition !== null) return hayColumnaPosition;

  const { error } = await publicSupabase
    .from("products")
    .select("position")
    .limit(1);

  hayColumnaPosition = error?.code !== COLUMNA_INEXISTENTE;

  if (!hayColumnaPosition) {
    console.warn(
      "Falta ejecutar supabase-migracion-2.sql: el catálogo se ordena por fecha " +
        "y el reordenamiento manual del panel está desactivado.",
    );
  }

  return hayColumnaPosition;
}

/** Columnas a pedir, con `position` solo si la base ya la tiene. */
async function productSelect(): Promise<string> {
  return (await soportaOrdenManual())
    ? `${PRODUCT_COLUMNS}, position`
    : PRODUCT_COLUMNS;
}

/** Para que el panel oculte las flechas de orden si la migración no corrió. */
export async function supportsManualOrder(): Promise<boolean> {
  return soportaOrdenManual();
}

const BANNER_SELECT = `
  id, text, image_url, link_category_id, start_date, end_date, active, created_at,
  category:categories ( id, name, slug )
` as const;

/* --------------------------------------------------------------------------
 * Tienda pública
 * ------------------------------------------------------------------------ */

/** Las categorías son de lectura pública; las usan tanto la tienda como el panel. */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await publicSupabase
    .from("categories")
    .select("id, name, slug, created_at")
    .order("name", { ascending: true });

  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`);
  return data ?? [];
}

export async function getCatalogProducts(): Promise<ProductView[]> {
  const ordenManual = await soportaOrdenManual();

  let consulta = publicSupabase
    .from("products")
    .select(await productSelect())
    .eq("active", true);

  if (ordenManual) consulta = consulta.order("position", { ascending: true });

  const { data, error } = await consulta.order("created_at", {
    ascending: false,
  });

  if (error) throw new Error(`No se pudo cargar el catálogo: ${error.message}`);

  const today = todayISO();
  return ((data ?? []) as unknown as ProductWithRelations[]).map((product) =>
    toProductView(product, today),
  );
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  const { data, error } = await publicSupabase
    .from("products")
    .select(await productSelect())
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`No se pudo cargar la pieza: ${error.message}`);
  if (!data) return null;

  return toProductView(data as unknown as ProductWithRelations);
}

/** Otras piezas de la misma categoría, para el pie del detalle. */
export async function getRelatedProducts(
  categoryId: string | null,
  excludeId: string,
  limit = 4,
): Promise<ProductView[]> {
  if (!categoryId) return [];

  const { data, error } = await publicSupabase
    .from("products")
    .select(await productSelect())
    .eq("active", true)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .limit(limit);

  if (error) return [];

  const today = todayISO();
  return ((data ?? []) as unknown as ProductWithRelations[]).map((product) =>
    toProductView(product, today),
  );
}

/** Slugs de las piezas publicadas, para prerenderizar sus páginas. */
export async function getPublishedProductSlugs(): Promise<string[]> {
  const { data, error } = await publicSupabase
    .from("products")
    .select("slug")
    .eq("active", true);

  // Si falla, se devuelven cero rutas: las páginas se generarán bajo demanda
  // en vez de tumbar el build.
  if (error) return [];
  return (data ?? []).map((row) => row.slug as string);
}

/** Slug y última edición de cada pieza publicada, para el sitemap. */
export async function getSitemapProducts(): Promise<
  { slug: string; updatedAt: string }[]
> {
  const { data, error } = await publicSupabase
    .from("products")
    .select("slug, updated_at")
    .eq("active", true);

  if (error) return [];
  return (data ?? []).map((row) => ({
    slug: row.slug as string,
    updatedAt: row.updated_at as string,
  }));
}

/** Banner destacado del momento: activo y dentro de su rango de fechas. */
export async function getLiveBanner(): Promise<BannerWithCategory | null> {
  const today = todayISO();

  // Los dos `.or()` se combinan con AND: "empieza hoy o antes (o no tiene
  // fecha de inicio)" Y "termina hoy o después (o no tiene fecha de fin)".
  const { data, error } = await publicSupabase
    .from("banners")
    .select(BANNER_SELECT)
    .eq("active", true)
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as BannerWithCategory;
}

/* --------------------------------------------------------------------------
 * Panel administrador
 * ------------------------------------------------------------------------ */

/** Incluye las piezas inactivas: RLS las deja pasar solo si eres admin. */
export async function getAdminProducts(): Promise<ProductView[]> {
  const supabase = await createClient();
  const ordenManual = await soportaOrdenManual();

  let consulta = supabase.from("products").select(await productSelect());
  if (ordenManual) consulta = consulta.order("position", { ascending: true });

  const { data, error } = await consulta.order("created_at", {
    ascending: false,
  });

  if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`);

  const today = todayISO();
  return ((data ?? []) as unknown as ProductWithRelations[]).map((product) =>
    toProductView(product, today),
  );
}

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, created_at, products(count)")
    .order("name", { ascending: true });

  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`);

  type Row = Category & { products: { count: number }[] };
  return ((data ?? []) as unknown as Row[]).map(({ products, ...category }) => ({
    ...category,
    productCount: products?.[0]?.count ?? 0,
  }));
}

export async function getAdminBanners(): Promise<BannerWithCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select(BANNER_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`No se pudieron cargar los banners: ${error.message}`);
  return (data ?? []) as unknown as BannerWithCategory[];
}

export type AdminStats = {
  totalProducts: number;
  onSale: number;
  categories: number;
  activeBanners: number;
  inactiveProducts: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const [products, categories, banners] = await Promise.all([
    getAdminProducts(),
    getCategories(),
    getAdminBanners(),
  ]);

  return {
    totalProducts: products.length,
    onSale: products.filter((product) => product.onSale).length,
    categories: categories.length,
    activeBanners: banners.filter((banner) => banner.active).length,
    inactiveProducts: products.filter((product) => !product.active).length,
  };
}
