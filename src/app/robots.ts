import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // El panel no tiene nada que indexar y además pide sesión.
      disallow: "/admin",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
