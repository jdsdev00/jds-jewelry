/**
 * Compresión de fotos en el navegador, antes de subirlas al Storage.
 *
 * Una foto de celular ronda los 4 MB y 4000 px de ancho, cuando la tarjeta del
 * catálogo la muestra a unos 200 px y el visor ampliado a 560 px. Reducirla
 * antes de subir baja el consumo de almacenamiento y de transferencia, y sobre
 * todo hace que subir cinco fotos desde el celular con datos móviles no sea una
 * espera eterna.
 */

/** Lado mayor de la imagen final. Cubre de sobra el visor a pantalla completa. */
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.82;

/** Formatos que no conviene tocar: perderían la animación o la transparencia. */
const SKIP_TYPES = ["image/gif", "image/svg+xml"];

export type CompressionResult = {
  file: File;
  /** Bytes originales, para poder informar cuánto se ahorró. */
  originalSize: number;
};

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Devuelve una versión reducida de la imagen, o el archivo original si
 * comprimirlo no ayuda (ya es pequeño, el formato no se debe tocar, o el
 * resultado pesaría más).
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  if (SKIP_TYPES.includes(file.type) || !file.type.startsWith("image/")) {
    return { file, originalSize };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Si el navegador no puede decodificarla, que la suba tal cual y que sea
    // el servidor quien la rechace si hace falta.
    return { file, originalSize };
  }

  try {
    const largestSide = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, MAX_DIMENSION / largestSide);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    if (!context) return { file, originalSize };

    // Fondo blanco: si el original era un PNG con transparencia, al pasar a
    // WebP con calidad quedaría un borde negro.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);

    // Si el navegador no soporta WebP o el resultado no mejora, se queda el
    // original: comprimir nunca debe empeorar las cosas.
    if (!blob || blob.type !== "image/webp" || blob.size >= originalSize) {
      return { file, originalSize };
    }

    const name = file.name.replace(/\.[^.]+$/, "") || "foto";
    return {
      file: new File([blob], `${name}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      }),
      originalSize,
    };
  } finally {
    bitmap.close();
  }
}

/** Formatea bytes de forma legible: `3.2 MB`. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
