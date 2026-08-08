import type { MetadataRoute } from "next";

import { getSitemapProducts } from "@/lib/queries";
import { siteUrl } from "@/lib/site";

/**
 * Mapa del sitio para los buscadores. Solo entra lo público: el panel queda
 * fuera a propósito (además `robots.ts` lo bloquea).
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await getSitemapProducts();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...productos.map((producto) => ({
      url: `${siteUrl}/producto/${producto.slug}`,
      lastModified: new Date(producto.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
