import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Marcas diacríticas que deja NFD al descomponer letras acentuadas. */
const DIACRITICS = /[̀-ͯ]/g;

/** Une clases de Tailwind resolviendo conflictos (la última gana). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convierte un nombre en un slug apto para URL: "Anillo Aurora" -> "anillo-aurora". */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Fecha de hoy como `YYYY-MM-DD`, comparable con las columnas `date`. */
export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

const MONTHS_SHORT = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/** Formatea `2026-08-01` como `1 ago 2026`, sin sorpresas de zona horaria. */
export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
}

/** Normaliza texto para buscar sin importar acentos ni mayúsculas. */
export function normalizeForSearch(input: string): string {
  return input.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}
