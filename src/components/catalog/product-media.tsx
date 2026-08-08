import Image from "next/image";

import { JewelArt } from "@/components/catalog/jewel-art";
import { jewelKindFor } from "@/lib/products";
import { cn } from "@/lib/utils";

type ProductMediaProps = {
  imageUrl?: string;
  categorySlug: string;
  alt: string;
  /** Tamaños que se le pasan a `next/image` para elegir la resolución. */
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Proporción del recuadro. Cuadrado por defecto, como en el diseño. */
  aspect?: string;
};

/**
 * Recuadro de imagen de una pieza. Si hay foto la muestra optimizada; si no,
 * cae en la ilustración de la categoría sobre el fondo degradado.
 */
export function ProductMedia({
  imageUrl,
  categorySlug,
  alt,
  sizes = "(min-width: 900px) 25vw, 50vw",
  priority = false,
  className,
  aspect = "aspect-square",
}: ProductMediaProps) {
  return (
    <div
      className={cn(
        "jewel-backdrop relative overflow-hidden",
        aspect,
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <JewelArt
            kind={jewelKindFor(categorySlug)}
            className="h-[56%] w-[56%]"
          />
        </div>
      )}
    </div>
  );
}
