import { toast } from "sonner";
import type { FieldErrors } from "react-hook-form";

/**
 * Qué hacer cuando la validación bloquea el envío de un formulario.
 *
 * Sin esto, un error en un campo que está oculto (por ejemplo, el valor del
 * descuento cuando el descuento está en "Ninguno") deja el botón de guardar
 * sin reacción visible: react-hook-form no llama al `onSubmit` y el mensaje
 * de error no se pinta en ninguna parte. Aquí siempre se avisa.
 */
export function reportInvalid(errors: FieldErrors) {
  const first = Object.values(errors).find((error) => error?.message);
  const message =
    typeof first?.message === "string"
      ? first.message
      : "Revisa los campos marcados.";

  toast.error(message);

  if (process.env.NODE_ENV !== "production") {
    console.warn("Formulario inválido:", errors);
  }
}
