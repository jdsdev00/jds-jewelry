/**
 * Moneda del catálogo.
 *
 * Los precios se guardan en la base como un número sin moneda
 * (`products.price numeric(10,2)`), así que todo el catálogo está en una sola
 * moneda a la vez. Cambiar `NEXT_PUBLIC_CURRENCY` cambia cómo se muestran los
 * precios, NO los convierte: si algún día se pasa a dólares, hay que reescribir
 * los importes en el panel.
 *
 * Para ofrecer las dos monedas a la vez haría falta guardar la tasa de cambio
 * y una moneda base; se dejó preparado el catálogo de monedas para ese momento.
 */

export type CurrencyCode = "DOP" | "USD";

type Currency = {
  code: CurrencyCode;
  /** Prefijo que se ve junto al precio. */
  symbol: string;
  /** Nombre completo, para etiquetas del panel. */
  name: string;
};

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  DOP: { code: "DOP", symbol: "RD$", name: "Peso dominicano" },
  USD: { code: "USD", symbol: "US$", name: "Dólar estadounidense" },
};

function resolveCurrency(raw: string | undefined): Currency {
  const code = raw?.trim().toUpperCase();
  if (code && code in CURRENCIES) return CURRENCIES[code as CurrencyCode];
  return CURRENCIES.DOP;
}

/** Moneda activa. Peso dominicano salvo que se indique otra cosa. */
export const currency = resolveCurrency(process.env.NEXT_PUBLIC_CURRENCY);

/**
 * Formatea un importe con el símbolo de la moneda activa: `RD$8,500`.
 *
 * Se agrupa con `en-US` a propósito (coma para los miles, punto para los
 * decimales, igual que se escriben los precios en República Dominicana) en vez
 * de dejarlo al locale del entorno: así el servidor y el navegador producen
 * exactamente el mismo texto y React no se queja al hidratar.
 */
export function formatPrice(value: number): string {
  const hasCents = Math.round(value * 100) % 100 !== 0;
  const amount = value.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${currency.symbol}${amount}`;
}
