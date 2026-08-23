/**
 * Datos de contacto de la marca, leídos de variables de entorno.
 *
 * Si una variable falta o viene vacía, el botón correspondiente no se muestra.
 * Antes había un número de relleno, y eso era peor: la tienda parecía
 * funcionar mientras mandaba a los clientes a un WhatsApp que no existe.
 */

/**
 * Deja el número como lo quiere wa.me: solo dígitos, con código de país.
 * Acepta lo que se escriba: `+1 809 555-1234`, `(809) 555-1234`, etc.
 * Si al número le falta el código de país (10 dígitos en RD), se le antepone
 * el 1.
 */
function normalizePhone(raw: string | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.length === 10 ? `1${digits}` : digits;
}

/** Acepta `usuario`, `@usuario` o la URL completa del perfil. */
function normalizeHandle(raw: string | undefined): string | null {
  const handle = (raw ?? "")
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "");
  return handle === "" ? null : handle;
}

/**
 * Dirección pública del sitio. Hace falta para el sitemap, las etiquetas de
 * compartir y las URLs canónicas: esas tienen que ser absolutas.
 *
 * En Vercel se puede deducir del entorno, así que en producción normalmente no
 * hay que configurar nada.
 */
function resolveSiteUrl(): string {
  const explicita = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicita) return explicita.replace(/\/+$/, "");

  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();

export const site = {
  name: "J.S. Jewelry",
  shortName: "JDS",
  tagline: "Piezas en oro y plata, hechas para durar.",
  description:
    "Catálogo de joyería fina en oro y plata. Anillos, collares, aretes y pulseras, con piezas nuevas y ofertas del momento.",
  whatsappNumber: normalizePhone(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  instagramUser: normalizeHandle(process.env.NEXT_PUBLIC_INSTAGRAM_USER),
} as const;

export const instagramUrl = site.instagramUser
  ? `https://instagram.com/${site.instagramUser}`
  : null;

/** Enlace de WhatsApp con el mensaje ya escrito, o `null` si no hay número. */
export function whatsappLink(message: string): string | null {
  if (!site.whatsappNumber) return null;
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
