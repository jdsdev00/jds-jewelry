import { InstagramIcon, WhatsappIcon } from "@/components/icons";
import { LogoMark } from "@/components/ui/logo";
import { instagramUrl, site, whatsappLink } from "@/lib/site";

/** Bloque de cierre con los canales de contacto de la marca. */
export function ContactSection() {
  const whatsapp = whatsappLink(`Hola ${site.name}, me gustaría más información.`);

  return (
    <section
      id="contacto"
      className="mx-[18px] mt-8 rounded-3xl bg-forest px-6 py-11 text-center text-white md:mx-8 md:mt-12 md:px-10 md:py-15"
    >
      <LogoMark tone="gold" size="lg" className="mx-auto mb-4.5" />
      <span className="text-[11px] tracking-[0.22em] text-gold uppercase">
        Contacto
      </span>
      <h2 className="mt-3 mb-2 font-serif text-[25px] leading-tight text-white md:text-3xl">
        ¿Tienes preguntas sobre una pieza?
      </h2>
      <p className="mx-auto mb-6 max-w-[300px] text-[13px] text-white/70">
        Escríbenos y te ayudamos a elegir la joya perfecta para ti.
      </p>

      {/* Cada botón aparece solo si su variable de entorno está configurada. */}
      <div className="mx-auto flex max-w-[280px] flex-col gap-2.5 md:max-w-[440px] md:flex-row">
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2.5 rounded-xl bg-gold px-5 py-3.5 text-[13px] font-medium text-white transition-transform duration-200 ease-fluid hover:bg-gold-dark active:scale-[0.96]"
          >
            <WhatsappIcon className="size-[19px]" />
            Escribir por WhatsApp
          </a>
        ) : null}
        {instagramUrl ? (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/40 px-5 py-3.5 text-[13px] font-medium text-white transition-[background-color,transform] duration-200 ease-fluid hover:bg-white/10 active:scale-[0.96]"
          >
            <InstagramIcon className="size-[19px]" />
            Seguir en Instagram
          </a>
        ) : null}
      </div>
    </section>
  );
}
