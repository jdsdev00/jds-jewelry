import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

/**
 * Tarjeta que se ve al compartir el enlace de la tienda por WhatsApp,
 * Instagram o cualquier otra parte.
 *
 * Se genera en vez de usar una foto de producto a propósito: así la vista
 * previa se ve igual de bien aunque el catálogo esté vacío o cambien las
 * piezas destacadas. Las páginas de producto sí usan su propia foto.
 */

export const alt = `${site.name} — Catálogo de joyería`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 25%, #163d27 0%, #0c2318 65%)",
          color: "#ffffff",
          // Se usa la tipografía por defecto del generador: cargar las fuentes
          // de la marca obligaría a incrustar los archivos, y para una tarjeta
          // de vista previa no compensa.
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 104,
            height: 104,
            borderRadius: "50%",
            border: "2px solid #c9a24a",
            color: "#c9a24a",
            fontSize: 38,
            letterSpacing: 2,
          }}
        >
          {site.shortName}
        </div>

        <div
          style={{
            marginTop: 38,
            fontSize: 74,
            letterSpacing: 2,
          }}
        >
          {site.name}
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 30,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          {site.tagline}
        </div>

        <div
          style={{
            marginTop: 44,
            fontSize: 21,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#c9a24a",
          }}
        >
          Anillos · Collares · Aretes · Pulseras
        </div>
      </div>
    ),
    size,
  );
}
