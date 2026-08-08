"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import {
  Controller,
  useForm,
  useWatch,
  type Resolver,
} from "react-hook-form";

import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { Sheet } from "@/components/ui/sheet";
import { SwitchRow } from "@/components/ui/switch";
import { reportInvalid } from "@/lib/form-errors";
import { previewFinalPrice, type ProductView } from "@/lib/products";
import type { Category } from "@/lib/types";
import { currency, formatPrice } from "@/lib/currency";
import { productSchema, type ProductInput } from "@/lib/validations";

const EASE = [0.22, 0.61, 0.36, 1] as const;

/**
 * `ProductInput` acepta números o texto en los campos numéricos (los inputs
 * del navegador entregan strings). El resolver valida contra ese mismo
 * esquema; el cast solo alinea los genéricos de react-hook-form.
 */
const resolver = zodResolver(productSchema) as unknown as Resolver<ProductInput>;

function emptyValues(categories: Category[]): ProductInput {
  return {
    name: "",
    categoryId: categories[0]?.id ?? "",
    price: "",
    material: "",
    description: "",
    discountType: "none",
    discountValue: "",
    discountStart: "",
    discountEnd: "",
    active: true,
    images: [],
  };
}

/** Convierte una pieza existente al formato que espera el formulario. */
export function productToFormValues(product: ProductView): ProductInput {
  return {
    name: product.name,
    categoryId: product.categoryId ?? "",
    price: product.basePrice,
    material: product.material ?? "",
    description: product.description ?? "",
    discountType: product.discountType,
    discountValue: product.discountType === "none" ? "" : product.discountValue,
    discountStart: product.discountStart ?? "",
    discountEnd: product.discountEnd ?? "",
    active: product.active,
    images: product.images,
  };
}

type ProductFormProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  /** `null` = crear una pieza nueva. */
  initialValues: ProductInput | null;
  onSubmit: (values: ProductInput) => Promise<void>;
};

export function ProductForm({
  open,
  onClose,
  categories,
  initialValues,
  onSubmit,
}: ProductFormProps) {
  const isEditing = initialValues !== null;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver,
    defaultValues: initialValues ?? emptyValues(categories),
    // Se remonta el formulario en cada apertura (ver `key` en el padre), así
    // que los valores por defecto siempre corresponden a la pieza abierta.
  });

  // La vista previa del precio se recalcula mientras se escribe.
  const discountType = useWatch({ control, name: "discountType" }) ?? "none";
  const price = Number(useWatch({ control, name: "price" })) || 0;
  const discountValue = Number(useWatch({ control, name: "discountValue" })) || 0;
  const hasDiscount = discountType !== "none";
  const preview = previewFinalPrice(price, discountType, discountValue);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar producto" : "Nuevo producto"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          {/* El pie del panel queda fuera del <form>, así que el botón se
              asocia por `form=` en vez de por anidamiento. */}
          <Button type="submit" form="product-form" loading={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <form
        id="product-form"
        onSubmit={handleSubmit(onSubmit, reportInvalid)}
        noValidate
        className="space-y-4"
      >
        <TextField
          label="Nombre de la pieza"
          placeholder="Ej. Anillo Aurora"
          autoFocus
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Categoría"
            error={errors.categoryId?.message}
            {...register("categoryId")}
          >
            {categories.length === 0 ? (
              <option value="">Crea una categoría primero</option>
            ) : null}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>

          <TextField
            label={`Precio base (${currency.symbol})`}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0"
            error={errors.price?.message}
            {...register("price")}
          />
        </div>

        <TextField
          label="Material"
          placeholder="Ej. Oro 18k · Circonia"
          error={errors.material?.message}
          {...register("material")}
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Descuento"
            error={errors.discountType?.message}
            {...register("discountType")}
          >
            <option value="none">Ninguno</option>
            <option value="percent">Porcentaje</option>
            <option value="fixed">Monto fijo</option>
          </SelectField>

          {hasDiscount ? (
            <TextField
              label={discountType === "percent" ? "Valor (%)" : `Valor (${currency.symbol})`}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0"
              error={errors.discountValue?.message}
              {...register("discountValue")}
            />
          ) : null}
        </div>

        <AnimatePresence initial={false}>
          {hasDiscount ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-0.5">
                {price > 0 && discountValue > 0 ? (
                  <div className="flex items-center justify-between rounded-[10px] bg-surface px-3.5 py-3 text-[13px]">
                    <span>Precio final con descuento</span>
                    <span className="text-base font-medium text-forest">
                      {formatPrice(preview)}
                    </span>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="Inicio de la oferta"
                    type="date"
                    hint={!errors.discountStart ? "Opcional" : undefined}
                    error={errors.discountStart?.message}
                    {...register("discountStart")}
                  />
                  <TextField
                    label="Fin de la oferta"
                    type="date"
                    hint={!errors.discountEnd ? "Opcional" : undefined}
                    error={errors.discountEnd?.message}
                    {...register("discountEnd")}
                  />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <TextAreaField
          label="Descripción"
          rows={3}
          placeholder="Detalles de la pieza, tallas disponibles, etc."
          error={errors.description?.message}
          {...register("description")}
        />

        <Controller
          control={control}
          name="images"
          render={({ field, fieldState }) => (
            <ImageUploader
              folder="products"
              value={field.value ?? []}
              onChange={field.onChange}
              max={5}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="active"
          render={({ field }) => (
            <SwitchRow
              title="Pieza activa"
              description="Visible en la tienda"
              label="Pieza activa"
              checked={field.value ?? true}
              onChange={field.onChange}
              className="rounded-[10px] bg-surface px-3.5 py-3"
            />
          )}
        />
      </form>
    </Sheet>
  );
}
