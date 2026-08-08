/**
 * Lee y valida las variables de entorno de Supabase una sola vez.
 * Falla temprano y con un mensaje claro si falta configuración, en vez de
 * reventar más adelante con un "fetch failed" difícil de rastrear.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Agrégala en .env.local (en la raíz del proyecto) y reinicia el servidor.`,
    );
  }
  return value;
}

export const supabaseUrl = required(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const supabaseAnonKey = required(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/** Bucket único donde viven las fotos de piezas y banners. */
export const MEDIA_BUCKET = "jewelry-media";
