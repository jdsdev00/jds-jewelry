import { site } from "@/lib/site";

/** Encabezado editorial del catálogo. */
export function Hero() {
  return (
    <section className="px-[18px] pt-7 pb-2.5 md:px-8 md:pt-11">
      <span className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">
        Catálogo
      </span>
      <h1 className="mt-1.5 font-serif text-[27px] leading-tight text-forest md:text-[35px]">
        Encuentra tu joya
      </h1>
      <p className="mt-1.5 max-w-[420px] text-[13px] text-ink-soft">
        {site.tagline} Explora por categoría o mira las ofertas del momento.
      </p>
    </section>
  );
}
