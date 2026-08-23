import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/product-card";
import { ChevronLeftIcon, SparkleIcon, WhatsappIcon } from "@/components/icons";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductGallery } from "@/components/product/product-gallery";
import { site, siteUrl, whatsappLink } from "@/lib/site";
import { currency } from "@/lib/currency";
import {
  getProductBySlug,
  getPublishedProductSlugs,
  getRelatedProducts,
} from "@/lib/queries";
import { formatPrice } from "@/lib/currency";

/** Mismo criterio que el catálogo: caché con refresco cada minuto. */
export const revalidate = 60;

/**
 * Deja listas las páginas de las piezas ya publicadas. Las que se agreguen
 * después se generan la primera vez que alguien las visita.
 */
export async function generateStaticParams() {
  const slugs = await getPublishedProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/producto/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Pieza no encontrada" };

  const descripcion =
    product.description ??
    `${product.name} en ${product.material ?? "joyería fina"}. ${site.tagline}`;

  return {
    title: product.name,
    description: descripcion,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} — ${site.name}`,
      description: descripcion,
      url: `${siteUrl}/producto/${product.slug}`,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — ${site.name}`,
      description: descripcion,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage(props: PageProps<"/producto/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  // Una pieza desactivada no existe para el público: RLS ya la esconde, pero
  // se comprueba igual por si un admin llega con la sesión abierta.
  if (!product || !product.active) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);
  const consulta = whatsappLink(
  `Hola ${site.name}, me interesa la pieza "${product.name}" (${formatPrice(product.price)}).\n\n${siteUrl}/producto/${product.slug}`,
);

  /**
   * Datos estructurados para los buscadores. Es lo que permite que Google
   * muestre el precio y la disponibilidad junto al resultado, en vez de un
   * enlace pelado.
   */
  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.length > 0 ? product.images : undefined,
    material: product.material ?? undefined,
    category: product.categoryName,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: currency.code,
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/producto/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // El nombre y la descripción los escribe la administradora, así que se
        // escapa `<` : un `</script>` dentro del texto cerraría la etiqueta
        // antes de tiempo.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datosEstructurados).replace(/</g, "\\u003c"),
        }}
      />

      <header className="sticky top-0 z-20 border-b border-line bg-white/92 backdrop-blur-lg">
        <div className="flex items-center justify-between px-[18px] py-3.5 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] text-forest transition-opacity duration-200 ease-fluid hover:opacity-60"
          >
            <ChevronLeftIcon />
            Catálogo
          </Link>
          <span className="font-serif text-[17px] tracking-[0.03em] text-forest">
            {site.name}
          </span>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[520px] sm:grid sm:max-w-[900px] sm:grid-cols-2 sm:items-start sm:gap-9 sm:px-6 sm:pt-6 md:px-8">
          <ProductGallery product={product} />

          <div className="animate-rise px-[18px] pt-1.5 pb-7 sm:px-0">
            <p className="text-[11px] tracking-[0.14em] text-ink-soft uppercase">
              {product.categoryName}
            </p>
            <h1 className="mt-2 mb-2.5 font-serif text-[26px] leading-tight text-forest sm:text-3xl">
              {product.name}
            </h1>

            <div className="mb-4 flex items-baseline gap-2.5">
              {product.compareAtPrice !== null ? (
                <span className="text-sm text-ink-soft line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              ) : null}
              <span className="text-xl font-medium text-forest">
                {formatPrice(product.price)}
              </span>
            </div>

            {product.material ? (
              <div className="mb-4 flex items-center gap-2 border-b border-line pb-4 text-[13px] text-ink-soft">
                <SparkleIcon className="size-4" />
                <span>{product.material}</span>
              </div>
            ) : null}

            {product.description ? (
              <p className="mb-6 text-sm text-ink">{product.description}</p>
            ) : null}

            {/* Solo aparece si NEXT_PUBLIC_WHATSAPP_NUMBER está configurado. */}
            {consulta ? (
              <a
                href={consulta}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-forest px-5 py-4 text-[13px] tracking-[0.03em] text-white transition-[background-color,transform] duration-200 ease-fluid hover:bg-forest-soft active:scale-[0.97]"
              >
                <WhatsappIcon className="size-[18px]" />
                Consultar &ldquo;{product.name}&rdquo; por WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        {related.length > 0 ? (
          <section className="px-[18px] pt-4 pb-10 md:px-8">
            <h2 className="mb-4 font-serif text-[19px] text-forest">
              También en {product.categoryName}
            </h2>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 md:gap-5.5">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </>
  );
}
