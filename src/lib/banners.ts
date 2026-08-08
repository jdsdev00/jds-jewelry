import type { Banner } from "./types";
import { todayISO } from "./utils";

/**
 * Un banner se ve en la tienda si está activo y hoy cae dentro de su rango.
 * Las fechas vacías significan "sin límite" por ese lado.
 */
export function isBannerLive(
  banner: Pick<Banner, "active" | "start_date" | "end_date">,
  today = todayISO(),
): boolean {
  if (!banner.active) return false;
  if (banner.start_date && banner.start_date > today) return false;
  if (banner.end_date && banner.end_date < today) return false;
  return true;
}
