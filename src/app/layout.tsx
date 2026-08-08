import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Toaster } from "sonner";

import { site, siteUrl } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  // Sin esto, cualquier ruta relativa que se use en metadatos (imágenes de
  // compartir, canónicas) se rompe al publicarse.
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — Catálogo`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  // Lo que ve alguien cuando le pasan el enlace por WhatsApp o Instagram.
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "es_DO",
    url: siteUrl,
    title: `${site.name} — Catálogo`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Catálogo`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0c2318",
  // El diseño está pensado a un solo ancho lógico; el zoom queda habilitado
  // por accesibilidad.
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${jost.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              fontFamily: "var(--font-jost)",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
