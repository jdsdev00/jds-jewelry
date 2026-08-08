import { MEDIA_BUCKET } from "./env";

/**
 * Traducción entre la URL pública de una imagen y su ruta dentro del bucket.
 *
 * En la base solo se guarda la URL pública, porque es lo que necesita el
 * navegador. Para borrar el archivo hace falta la ruta, así que hay que
 * recuperarla del final de la URL.
 */

const PUBLIC_PREFIX = `/storage/v1/object/public/${MEDIA_BUCKET}/`;

/**
 * `https://xxx.supabase.co/storage/v1/object/public/jewelry-media/products/ab.webp`
 * se convierte en `products/ab.webp`.
 *
 * Devuelve `null` si la URL no apunta a este bucket: puede ser una imagen
 * pegada a mano desde otro sitio, y en ese caso no hay nada que borrar.
 */
export function storagePathFromUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    const index = pathname.indexOf(PUBLIC_PREFIX);
    if (index === -1) return null;

    const path = pathname.slice(index + PUBLIC_PREFIX.length);
    return path === "" ? null : decodeURIComponent(path);
  } catch {
    return null;
  }
}
