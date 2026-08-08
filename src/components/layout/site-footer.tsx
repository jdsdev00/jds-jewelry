import { site } from "@/lib/site";

/**
 * Pie de la tienda. No enlaza al panel a propósito: el acceso de la
 * administradora se entra escribiendo /admin, no se anuncia a los clientes.
 */
export function SiteFooter() {
  return (
    <footer className="px-[18px] pt-6 pb-9 text-center md:px-8">
      <p className="text-[11px] tracking-[0.01em] text-ink-soft">
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}
