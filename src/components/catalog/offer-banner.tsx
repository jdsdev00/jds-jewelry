"use client";

import Image from "next/image";

import type { BannerWithCategory } from "@/lib/types";

type OfferBannerProps = {
  banner: BannerWithCategory;
  /** Salta al catálogo con la categoría del banner ya aplicada. */
  onOpen: (categorySlug: string) => void;
};

/**
 * Franja de promoción vigente. Si el banner apunta a una categoría, el botón
 * filtra el catálogo por ella; si no, muestra las ofertas.
 */
export function OfferBanner({ banner, onOpen }: OfferBannerProps) {
  const targetSlug = banner.category?.slug ?? "ofertas";

  return (
    <div
      id="ofertas"
      className="relative mx-[18px] my-4.5 flex items-center justify-between gap-3 overflow-hidden rounded-2xl bg-forest px-5 py-4.5 text-white md:mx-8 md:my-6 md:px-8 md:py-6"
    >
      {banner.image_url ? (
        <>
          <Image
            src={banner.image_url}
            alt=""
            fill
            sizes="(min-width: 900px) 60vw, 100vw"
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/80 to-forest/30" />
        </>
      ) : null}

      <div className="relative min-w-0">
        <span className="mb-1 block text-[10px] tracking-[0.14em] text-gold uppercase">
          Oferta
        </span>
        <h2 className="font-serif text-lg text-white md:text-xl">{banner.text}</h2>
      </div>

      <button
        type="button"
        onClick={() => onOpen(targetSlug)}
        className="relative shrink-0 rounded-full border border-white/55 px-4 py-2.5 text-[11px] tracking-[0.1em] uppercase transition-[background-color,transform] duration-200 ease-fluid hover:bg-white/15 active:scale-95"
      >
        Ver
      </button>
    </div>
  );
}
