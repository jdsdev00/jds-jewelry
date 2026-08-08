"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { storagePathFromUrl } from "@/lib/supabase/storage";
import { slugify } from "@/lib/utils";
import {
  bannerSchema,
  categorySchema,
  productSchema,
  type BannerInput,
  type CategoryInput,
  type ProductInput,
} from "@/lib/validations";
import type { ActionResult } from "@/lib/types";

/**
 * Acciones de escritura del panel.
 *
 * Todas siguen el mismo guion: comprobar que quien llama es admin, volver a
 * validar la entrada con el mismo esquema que usó el formulario, escribir, y
 * revalidar las rutas que muestran ese dato.
 */

/** Rutas que dependen de los productos y las categorías. */
function revalidateStore() {
  revalidatePath("/");
  revalidatePath("/producto/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/banners");
}

function failure(error: unknown, fallback: string): ActionResult {
  const message = error instanceof Error ? error.message : fallback;
  return { ok: false, error: message };
}

/**
 * Borra del bucket las imágenes que ya no usa nadie.
 *
 * Hay que llamarla DESPUÉS de haber borrado las filas de la base, porque la
 * comprobación mira el estado ya actualizado. La comprobación existe porque la
 * misma URL puede estar en varias piezas o en un banner: borrar el archivo sin
 * mirar dejaría la otra pieza con una imagen rota.
 *
 * Si falla, no se corta la operación: quedarse con un archivo de más es mucho
 * menos grave que hacer fracasar un guardado que ya se completó.
 */
async function deleteUnreferencedMedia(urls: string[]): Promise<void> {
  const candidatas = [...new Set(urls.filter(Boolean))];
  if (candidatas.length === 0) return;

  try {
    const supabase = await createClient();

    const [enProductos, enBanners] = await Promise.all([
      supabase.from("product_images").select("url").in("url", candidatas),
      supabase.from("banners").select("image_url").in("image_url", candidatas),
    ]);

    const enUso = new Set<string>([
      ...(enProductos.data ?? []).map((row) => row.url as string),
      ...(enBanners.data ?? []).map((row) => row.image_url as string),
    ]);

    const rutas = candidatas
      .filter((url) => !enUso.has(url))
      .map(storagePathFromUrl)
      .filter((ruta): ruta is string => ruta !== null);

    if (rutas.length === 0) return;

    await supabase.storage.from(MEDIA_BUCKET).remove(rutas);
  } catch (error) {
    console.error("No se pudieron borrar imágenes huérfanas:", error);
  }
}

/* --------------------------------------------------------------------------
 * Sesión
 * ------------------------------------------------------------------------ */

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* --------------------------------------------------------------------------
 * Productos
 * ------------------------------------------------------------------------ */

/**
 * Genera un slug libre a partir del nombre. Si "anillo-aurora" ya existe,
 * prueba "anillo-aurora-2", "anillo-aurora-3", etc.
 */
async function uniqueProductSlug(
  name: string,
  ignoreId?: string,
): Promise<string> {
  const supabase = await createClient();
  const base = slugify(name) || "pieza";

  const { data } = await supabase
    .from("products")
    .select("id, slug")
    .like("slug", `${base}%`);

  const taken = new Set(
    (data ?? [])
      .filter((row) => row.id !== ignoreId)
      .map((row) => row.slug as string),
  );

  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

/**
 * Reescribe la galería de una pieza respetando el orden recibido, y limpia del
 * bucket las fotos que se quitaron.
 */
async function replaceProductImages(productId: string, urls: string[]) {
  const supabase = await createClient();

  const { data: previas } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", productId);

  const anteriores = (previas ?? []).map((row) => row.url as string);

  await supabase.from("product_images").delete().eq("product_id", productId);

  if (urls.length > 0) {
    const { error } = await supabase.from("product_images").insert(
      urls.map((url, position) => ({
        product_id: productId,
        url,
        position,
      })),
    );

    if (error) throw new Error(`No se pudieron guardar las fotos: ${error.message}`);
  }

  await deleteUnreferencedMedia(
    anteriores.filter((url) => !urls.includes(url)),
  );
}

function toProductRow(data: ReturnType<typeof productSchema.parse>) {
  const hasDiscount = data.discountType !== "none";
  return {
    name: data.name,
    description: data.description,
    material: data.material,
    price: data.price,
    category_id: data.categoryId,
    discount_type: data.discountType,
    discount_value: hasDiscount ? data.discountValue : 0,
    discount_start: hasDiscount ? data.discountStart : null,
    discount_end: hasDiscount ? data.discountEnd : null,
    active: data.active,
  };
}

export async function createProductAction(
  input: ProductInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = productSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Revisa los campos marcados.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
      };
    }

    const supabase = await createClient();
    const slug = await uniqueProductSlug(parsed.data.name);

    const { data: created, error } = await supabase
      .from("products")
      .insert({ ...toProductRow(parsed.data), slug })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    await replaceProductImages(created.id, parsed.data.images);

    revalidateStore();
    return { ok: true, message: `"${parsed.data.name}" se agregó al catálogo.` };
  } catch (error) {
    return failure(error, "No se pudo crear la pieza.");
  }
}

export async function updateProductAction(
  id: string,
  input: ProductInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = productSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Revisa los campos marcados.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
      };
    }

    const supabase = await createClient();
    const slug = await uniqueProductSlug(parsed.data.name, id);

    const { error } = await supabase
      .from("products")
      .update({ ...toProductRow(parsed.data), slug })
      .eq("id", id);

    if (error) throw new Error(error.message);

    await replaceProductImages(id, parsed.data.images);

    revalidateStore();
    return { ok: true, message: "Cambios guardados." };
  } catch (error) {
    return failure(error, "No se pudo guardar la pieza.");
  }
}

export async function setProductActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ active })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidateStore();
    return {
      ok: true,
      message: active ? "La pieza ya es visible en la tienda." : "La pieza se ocultó.",
    };
  } catch (error) {
    return failure(error, "No se pudo cambiar la visibilidad.");
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const supabase = await createClient();

    // Hay que anotarse las fotos antes: al borrar la pieza, `product_images`
    // cae por cascada y se pierde el rastro de qué archivos quedaron sueltos.
    const { data: fotos } = await supabase
      .from("product_images")
      .select("url")
      .eq("product_id", id);

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);

    await deleteUnreferencedMedia((fotos ?? []).map((row) => row.url as string));

    revalidateStore();
    return { ok: true, message: "Pieza eliminada." };
  } catch (error) {
    return failure(error, "No se pudo eliminar la pieza.");
  }
}

/* --------------------------------------------------------------------------
 * Orden del catálogo
 * ------------------------------------------------------------------------ */

/**
 * Sube o baja una pieza un puesto en el catálogo.
 *
 * En vez de intercambiar dos valores sueltos, se recalcula la posición de toda
 * la lista. Es un poco más de trabajo, pero deja el orden siempre normalizado
 * (0, 1, 2, …) y arregla de paso cualquier empate que hubiera quedado, por
 * ejemplo entre piezas recién creadas.
 */
export async function moveProductAction(
  id: string,
  direccion: "arriba" | "abajo",
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("id")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });

    // 42703 = la columna no existe todavía.
    if (error?.code === "42703") {
      return {
        ok: false,
        error:
          "Falta ejecutar supabase-migracion-2.sql en Supabase para poder ordenar el catálogo.",
      };
    }
    if (error) throw new Error(error.message);

    const ids = (data ?? []).map((row) => row.id as string);
    const desde = ids.indexOf(id);
    if (desde === -1) return { ok: false, error: "No se encontró la pieza." };

    const hasta = direccion === "arriba" ? desde - 1 : desde + 1;
    if (hasta < 0 || hasta >= ids.length) {
      return { ok: true, message: "La pieza ya está en el extremo." };
    }

    [ids[desde], ids[hasta]] = [ids[hasta], ids[desde]];

    const resultados = await Promise.all(
      ids.map((productId, position) =>
        supabase.from("products").update({ position }).eq("id", productId),
      ),
    );

    const fallo = resultados.find((resultado) => resultado.error);
    if (fallo?.error) throw new Error(fallo.error.message);

    revalidateStore();
    return { ok: true, message: "Orden actualizado." };
  } catch (error) {
    return failure(error, "No se pudo cambiar el orden.");
  }
}

/* --------------------------------------------------------------------------
 * Categorías
 * ------------------------------------------------------------------------ */

export async function createCategoryAction(
  input: CategoryInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Escribe un nombre válido para la categoría." };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("categories").insert({
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
    });

    if (error) {
      // 23505 = violación de índice único (nombre o slug repetido).
      if (error.code === "23505") {
        return { ok: false, error: "Ya existe una categoría con ese nombre." };
      }
      throw new Error(error.message);
    }

    revalidateStore();
    return { ok: true, message: `Categoría "${parsed.data.name}" creada.` };
  } catch (error) {
    return failure(error, "No se pudo crear la categoría.");
  }
}

export async function renameCategoryAction(
  id: string,
  input: CategoryInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Escribe un nombre válido para la categoría." };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("categories")
      .update({ name: parsed.data.name, slug: slugify(parsed.data.name) })
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        return { ok: false, error: "Ya existe una categoría con ese nombre." };
      }
      throw new Error(error.message);
    }

    revalidateStore();
    return { ok: true, message: "Categoría actualizada." };
  } catch (error) {
    return failure(error, "No se pudo renombrar la categoría.");
  }
}

/**
 * Elimina una categoría. Si tiene piezas dentro, hay que decir a qué otra
 * categoría se mudan: el esquema usa `on delete restrict`, así que Postgres
 * rechazaría el borrado, y dejar las piezas sin categoría no es opción.
 */
export async function deleteCategoryAction(
  id: string,
  moverAId?: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const supabase = await createClient();

    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    const piezas = count ?? 0;

    if (piezas > 0) {
      if (!moverAId) {
        return {
          ok: false,
          error: `Esta categoría tiene ${piezas} pieza(s). Elige a qué categoría moverlas.`,
        };
      }
      if (moverAId === id) {
        return { ok: false, error: "Elige una categoría distinta." };
      }

      const { error: errorMover } = await supabase
        .from("products")
        .update({ category_id: moverAId })
        .eq("category_id", id);

      if (errorMover) throw new Error(errorMover.message);
    }

    // Los banners que apuntaban aquí quedan en null (enlazan a todo el
    // catálogo), tal como define `on delete set null` en el esquema.
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidateStore();
    return {
      ok: true,
      message:
        piezas > 0
          ? `Categoría eliminada y ${piezas} pieza(s) movidas.`
          : "Categoría eliminada.",
    };
  } catch (error) {
    return failure(error, "No se pudo eliminar la categoría.");
  }
}

/* --------------------------------------------------------------------------
 * Banners
 * ------------------------------------------------------------------------ */

function toBannerRow(data: ReturnType<typeof bannerSchema.parse>) {
  return {
    text: data.text,
    image_url: data.imageUrl,
    link_category_id: data.linkCategoryId,
    start_date: data.startDate,
    end_date: data.endDate,
    active: data.active,
  };
}

export async function createBannerAction(
  input: BannerInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = bannerSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Revisa los campos marcados.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("banners").insert(toBannerRow(parsed.data));

    if (error) throw new Error(error.message);

    revalidateStore();
    return { ok: true, message: "Banner creado." };
  } catch (error) {
    return failure(error, "No se pudo crear el banner.");
  }
}

export async function updateBannerAction(
  id: string,
  input: BannerInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = bannerSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Revisa los campos marcados.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
      };
    }

    const supabase = await createClient();

    const { data: previo } = await supabase
      .from("banners")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase
      .from("banners")
      .update(toBannerRow(parsed.data))
      .eq("id", id);

    if (error) throw new Error(error.message);

    const imagenAnterior = previo?.image_url as string | null | undefined;
    if (imagenAnterior && imagenAnterior !== parsed.data.imageUrl) {
      await deleteUnreferencedMedia([imagenAnterior]);
    }

    revalidateStore();
    return { ok: true, message: "Cambios guardados." };
  } catch (error) {
    return failure(error, "No se pudo guardar el banner.");
  }
}

export async function setBannerActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const supabase = await createClient();
    const { error } = await supabase.from("banners").update({ active }).eq("id", id);

    if (error) throw new Error(error.message);

    revalidateStore();
    return {
      ok: true,
      message: active ? "Banner activado." : "Banner desactivado.",
    };
  } catch (error) {
    return failure(error, "No se pudo cambiar el estado del banner.");
  }
}

export async function deleteBannerAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const supabase = await createClient();

    const { data: previo } = await supabase
      .from("banners")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) throw new Error(error.message);

    const imagen = previo?.image_url as string | null | undefined;
    if (imagen) await deleteUnreferencedMedia([imagen]);

    revalidateStore();
    return { ok: true, message: "Banner eliminado." };
  } catch (error) {
    return failure(error, "No se pudo eliminar el banner.");
  }
}
