import { z } from "zod";

/**
 * Un solo juego de esquemas para los dos lados de cada formulario:
 * react-hook-form los usa en el navegador y los Server Actions los vuelven a
 * aplicar en el servidor. Nunca se confía solo en la validación del cliente.
 *
 * IMPORTANTE: estos esquemas tienen que aceptar su propia salida.
 * react-hook-form no le pasa al `onSubmit` lo que hay escrito en los campos,
 * sino lo que devolvió Zod al validarlos, y eso es lo que viaja al servidor.
 * Si un campo transformara `""` en `null` y luego rechazara `null`, el
 * guardado fallaría siempre en la segunda validación.
 */

/** Campo de texto opcional: tanto "" como null se guardan como null. */
const optionalText = z
  .union([z.string(), z.null()])
  .transform((value) => {
    const trimmed = (value ?? "").trim();
    return trimmed === "" ? null : trimmed;
  });

/** Campo de fecha opcional en formato `YYYY-MM-DD`. */
const optionalDate = z
  .union([z.string(), z.null()])
  .transform((value) => {
    const trimmed = (value ?? "").trim();
    return trimmed === "" ? null : trimmed;
  })
  .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Usa el formato AAAA-MM-DD",
  });

/**
 * Los `<input type="number">` entregan strings, así que se aceptan ambos y se
 * normalizan a número.
 *
 * `whenEmpty` decide qué pasa con el campo vacío: `NaN` para exigirlo (cae en
 * el mensaje de error) o un número para darlo por bueno. Esto último importa
 * en los campos que se ocultan según otra opción del formulario: si un campo
 * escondido exigiera valor, el guardado fallaría sin que se vea el porqué.
 */
function numeric(missingMessage: string, whenEmpty = Number.NaN) {
  return z
    .union([z.number(), z.string()])
    .transform((value) => {
      if (typeof value === "number") return value;
      const trimmed = value.trim();
      return trimmed === "" ? whenEmpty : Number(trimmed);
    })
    .pipe(z.number({ error: missingMessage }));
}

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Escribe tu correo")
    .email("Ese correo no parece válido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});

export type LoginInput = z.input<typeof loginSchema>;

export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(80, "El nombre no puede pasar de 80 caracteres"),
    categoryId: z.string().min(1, "Elige una categoría"),
    price: numeric("Escribe un precio").pipe(
      z
        .number()
        .min(0, "El precio no puede ser negativo")
        .max(1_000_000, "Ese precio parece demasiado alto"),
    ),
    material: optionalText,
    description: optionalText,
    discountType: z.enum(["none", "percent", "fixed"]),
    // Vacío cuenta como 0: el campo se oculta cuando no hay descuento. Que el
    // valor sea obligatorio con descuento lo exige el `superRefine` de abajo.
    discountValue: numeric("Escribe cuánto es el descuento", 0).pipe(
      z.number().min(0, "El descuento no puede ser negativo"),
    ),
    discountStart: optionalDate,
    discountEnd: optionalDate,
    active: z.boolean(),
    /** URLs ya subidas al Storage, en el orden en que se muestran. */
    images: z.array(z.string()).max(5, "Máximo 5 fotos por pieza"),
  })
  .superRefine((data, ctx) => {
    if (data.discountType !== "none" && data.discountValue <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Escribe cuánto es el descuento",
      });
    }
    if (data.discountType === "percent" && data.discountValue > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Un porcentaje no puede pasar de 100",
      });
    }
    if (data.discountType === "fixed" && data.discountValue > data.price) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "El descuento no puede superar el precio base",
      });
    }
    if (
      data.discountStart &&
      data.discountEnd &&
      data.discountStart > data.discountEnd
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["discountEnd"],
        message: "La fecha final debe ir después de la inicial",
      });
    }
  });

export type ProductInput = z.input<typeof productSchema>;
export type ProductOutput = z.output<typeof productSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(40, "El nombre no puede pasar de 40 caracteres"),
});

export type CategoryInput = z.input<typeof categorySchema>;

export const bannerSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(3, "Escribe el texto del banner")
      .max(70, "El texto no puede pasar de 70 caracteres"),
    imageUrl: optionalText,
    /** "" significa "todo el catálogo". */
    linkCategoryId: optionalText,
    startDate: optionalDate,
    endDate: optionalDate,
    active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "La fecha final debe ir después de la inicial",
      });
    }
  });

export type BannerInput = z.input<typeof bannerSchema>;
export type BannerOutput = z.output<typeof bannerSchema>;
