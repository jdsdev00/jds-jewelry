import { ImageResponse } from "next/og";

/**
 * Icono para cuando alguien guarda la tienda en la pantalla de inicio del
 * iPhone. Va aparte de `icon.svg` porque Safari no acepta SVG aquí: tiene que
 * ser PNG.
 *
 * Sin esquinas redondeadas ni transparencia a propósito: iOS aplica su propia
 * máscara y, si el icono ya viene recortado, se ve un borde raro.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c2318",
        }}
      >
        {/* La gema del catálogo: un cuadrado girado 45°. */}
        <div
          style={{
            width: 92,
            height: 92,
            background: "#c9a24a",
            borderRadius: 10,
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    size,
  );
}
