import { CatalogExperience } from "@/components/catalog/catalog-experience";
import { getCatalogProducts, getCategories, getLiveBanner } from "@/lib/queries";

/**
 * La página se sirve desde caché y se regenera cada minuto. Además, cada
 * cambio hecho en el panel llama a `revalidatePath("/")`, así que lo que
 * publica la administradora aparece de inmediato; el minuto solo cubre los
 * cambios hechos directo en Supabase y el paso de los días (vigencia de las
 * ofertas y la insignia "Nuevo").
 */
export const revalidate = 60;

/**
 * Catálogo. Los datos se piden en el servidor y el filtrado ocurre en el
 * cliente, así que la primera pintura ya llega con las piezas dentro.
 */
export default async function CatalogPage() {
  const [products, categories, banner] = await Promise.all([
    getCatalogProducts(),
    getCategories(),
    getLiveBanner(),
  ]);

  return (
    <CatalogExperience
      products={products}
      categories={categories}
      banner={banner}
    />
  );
}
