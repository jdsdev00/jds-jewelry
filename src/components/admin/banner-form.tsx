"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Resolver } from "react-hook-form";

import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/field";
import { Sheet } from "@/components/ui/sheet";
import { SwitchRow } from "@/components/ui/switch";
import { reportInvalid } from "@/lib/form-errors";
import type { BannerWithCategory, Category } from "@/lib/types";
import { bannerSchema, type BannerInput } from "@/lib/validations";

const resolver = zodResolver(bannerSchema) as unknown as Resolver<BannerInput>;

export function bannerToFormValues(banner: BannerWithCategory): BannerInput {
  return {
    text: banner.text,
    imageUrl: banner.image_url ?? "",
    linkCategoryId: banner.link_category_id ?? "",
    startDate: banner.start_date ?? "",
    endDate: banner.end_date ?? "",
    active: banner.active,
  };
}

const EMPTY: BannerInput = {
  text: "",
  imageUrl: "",
  linkCategoryId: "",
  startDate: "",
  endDate: "",
  active: true,
};

type BannerFormProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  initialValues: BannerInput | null;
  onSubmit: (values: BannerInput) => Promise<void>;
};

export function BannerForm({
  open,
  onClose,
  categories,
  initialValues,
  onSubmit,
}: BannerFormProps) {
  const isEditing = initialValues !== null;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BannerInput>({
    resolver,
    defaultValues: initialValues ?? EMPTY,
  });

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar banner" : "Nuevo banner"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="banner-form" loading={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <form
        id="banner-form"
        onSubmit={handleSubmit(onSubmit, reportInvalid)}
        noValidate
        className="space-y-4"
      >
        <Controller
          control={control}
          name="imageUrl"
          render={({ field, fieldState }) => (
            <ImageUploader
              folder="banners"
              label="Imagen del banner (opcional)"
              max={1}
              value={field.value ? [field.value] : []}
              onChange={(urls) => field.onChange(urls[0] ?? "")}
              error={fieldState.error?.message}
            />
          )}
        />

        <TextField
          label="Texto principal"
          placeholder="Ej. 20% off en anillos"
          autoFocus
          error={errors.text?.message}
          {...register("text")}
        />

        <SelectField
          label="Enlaza a"
          hint="Al tocar «Ver», la tienda filtra por esta categoría."
          error={errors.linkCategoryId?.message}
          {...register("linkCategoryId")}
        >
          <option value="">Todo el catálogo</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectField>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Fecha inicio"
            type="date"
            hint={!errors.startDate ? "Opcional" : undefined}
            error={errors.startDate?.message}
            {...register("startDate")}
          />
          <TextField
            label="Fecha fin"
            type="date"
            hint={!errors.endDate ? "Opcional" : undefined}
            error={errors.endDate?.message}
            {...register("endDate")}
          />
        </div>

        <Controller
          control={control}
          name="active"
          render={({ field }) => (
            <SwitchRow
              title="Banner activo"
              description="Se muestra si además está dentro de las fechas"
              label="Banner activo"
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
