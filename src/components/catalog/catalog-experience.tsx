"use client";

import { useCallback, useMemo, useState } from "react";

import {
  ALL_FILTER,
  CategoryChips,
  OFFERS_FILTER,
} from "@/components/catalog/category-chips";
import { ContactSection } from "@/components/catalog/contact-section";
import { Hero } from "@/components/catalog/hero";
import { OfferBanner } from "@/components/catalog/offer-banner";
import { ProductGrid } from "@/components/catalog/product-grid";
import { SearchBar } from "@/components/catalog/search-bar";
import { SearchIcon } from "@/components/icons";
import { CatalogHeader } from "@/components/layout/catalog-header";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { SiteFooter } from "@/components/layout/site-footer";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProductView } from "@/lib/products";
import type { BannerWithCategory, Category } from "@/lib/types";
import { normalizeForSearch } from "@/lib/utils";

type CatalogExperienceProps = {
  products: ProductView[];
  categories: Category[];
  banner: BannerWithCategory | null;
};

/**
 * Dueño del estado del catálogo: búsqueda, filtro activo y menús abiertos.
 *
 * El filtrado ocurre en el navegador sobre la lista que ya vino del servidor.
 * Para un catálogo de joyería el volumen es pequeño y así el cambio de filtro
 * es instantáneo, sin ida y vuelta a la red.
 */
export function CatalogExperience({
  products,
  categories,
  banner,
}: CatalogExperienceProps) {
  const [filter, setFilter] = useState<string>(ALL_FILTER);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const hasOffers = useMemo(
    () => products.some((product) => product.onSale),
    [products],
  );

  const visibleProducts = useMemo(() => {
    const needle = normalizeForSearch(query.trim());

    return products.filter((product) => {
      const matchesFilter =
        filter === ALL_FILTER ||
        (filter === OFFERS_FILTER ? product.onSale : product.categorySlug === filter);

      if (!matchesFilter) return false;
      if (!needle) return true;

      const haystack = normalizeForSearch(
        `${product.name} ${product.material ?? ""} ${product.categoryName}`,
      );
      return haystack.includes(needle);
    });
  }, [products, filter, query]);

  const goToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const applyFilter = useCallback(
    (value: string) => {
      // El banner puede apuntar a "ofertas" aunque ninguna pieza tenga un
      // descuento vigente hoy; en ese caso se muestra el catálogo completo en
      // vez de una cuadrícula vacía.
      const target = value === OFFERS_FILTER && !hasOffers ? ALL_FILTER : value;
      setFilter(target);
      goToSection("catalogo");
    },
    [goToSection, hasOffers],
  );

  const sectionTitle =
    filter === ALL_FILTER
      ? "Destacados"
      : filter === OFFERS_FILTER
        ? "En oferta"
        : (categories.find((category) => category.slug === filter)?.name ?? "Piezas");

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-white/92 backdrop-blur-lg">
        <CatalogHeader
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((open) => !open)}
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((open) => !open)}
          onGoToSection={goToSection}
        />
        <SearchBar
          open={searchOpen}
          value={query}
          onChange={setQuery}
          onClose={() => setSearchOpen(false)}
        />
        {categories.length > 0 ? (
          <CategoryChips
            categories={categories}
            active={filter}
            onChange={setFilter}
            showOffers={hasOffers}
          />
        ) : null}
      </header>

      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
        onSelectCategory={applyFilter}
        onGoToSection={goToSection}
      />

      <main className="flex-1">
        <Hero />

        {banner ? <OfferBanner banner={banner} onOpen={applyFilter} /> : null}

        <section id="catalogo" className="px-[18px] pt-2 pb-8 md:px-8 md:pb-11">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-[19px] text-forest">{sectionTitle}</h2>
            {visibleProducts.length > 0 ? (
              <span className="text-[11px] text-ink-soft">
                {visibleProducts.length}{" "}
                {visibleProducts.length === 1 ? "pieza" : "piezas"}
              </span>
            ) : null}
          </div>

          {visibleProducts.length > 0 ? (
            <ProductGrid products={visibleProducts} />
          ) : (
            <EmptyState
              icon={<SearchIcon />}
              title="No encontramos piezas con ese criterio."
              description={
                products.length === 0
                  ? "Todavía no hay piezas publicadas en el catálogo."
                  : "Prueba con otra categoría o cambia lo que escribiste."
              }
            />
          )}
        </section>

        <ContactSection />
      </main>

      <SiteFooter />
    </>
  );
}
