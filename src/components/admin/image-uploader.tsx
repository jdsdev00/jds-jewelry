"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { CloseIcon, ImageIcon, SpinnerIcon } from "@/components/icons";
import { compressImage, formatBytes } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

/**
 * Subida de fotos al Storage de Supabase.
 *
 * Los archivos van directo del navegador al bucket, sin pasar por el servidor
 * de Next: las políticas de Storage ya exigen que quien sube esté en
 * `admin_users`. Al formulario solo llegan las URLs públicas resultantes.
 *
 * Antes de subir, cada foto se reduce en el navegador (ver `lib/image.ts`).
 */

/**
 * Tope generoso: se mide sobre el archivo original, y como después se
 * comprime, lo que acaba en el bucket es mucho menos. Sirve para frenar un
 * archivo enorme por error, no para exigirle a nadie que redimensione a mano.
 */
const MAX_SIZE_MB = 15;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type ImageUploaderProps = {
  folder: "products" | "banners";
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
  error?: string;
};

export function ImageUploader({
  folder,
  value,
  onChange,
  max = 5,
  label = "Imágenes",
  error,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ actual: number; total: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);

  const remaining = max - value.length;

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;

    if (remaining <= 0) {
      toast.error(`Ya llegaste al máximo de ${max} ${max === 1 ? "foto" : "fotos"}.`);
      return;
    }

    const accepted: File[] = [];
    for (const file of files.slice(0, remaining)) {
      if (!ACCEPTED.includes(file.type)) {
        toast.error(`"${file.name}" no es una imagen válida (usa JPG, PNG o WebP).`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" pesa más de ${MAX_SIZE_MB} MB.`);
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const uploaded: string[] = [];
    let bytesAntes = 0;
    let bytesDespues = 0;

    try {
      for (const [index, original] of accepted.entries()) {
        setProgress({ actual: index + 1, total: accepted.length });

        const { file, originalSize } = await compressImage(original);
        bytesAntes += originalSize;
        bytesDespues += file.size;

        const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${folder}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, file, {
            // Las fotos nunca se reemplazan en su sitio (cada subida genera un
            // nombre nuevo), así que se pueden cachear mucho tiempo.
            cacheControl: "31536000",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          toast.error(`No se pudo subir "${original.name}": ${uploadError.message}`);
          continue;
        }

        const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
        const ahorro =
          bytesAntes > bytesDespues
            ? ` (${formatBytes(bytesAntes)} → ${formatBytes(bytesDespues)})`
            : "";
        toast.success(
          (uploaded.length === 1
            ? "Foto subida"
            : `${uploaded.length} fotos subidas`) + ahorro,
        );
      }
    } finally {
      setUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    // Solo se quita del formulario; el archivo se queda en el bucket para no
    // romper otra pieza que apunte a la misma URL.
    onChange(value.filter((_, position) => position !== index));
  }

  function makePrimary(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [moved] = next.splice(index, 1);
    onChange([moved, ...next]);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-ink-soft">{label}</span>
        <span className="text-[11px] text-ink-soft">
          {value.length} de {max}
        </span>
      </div>

      {value.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="group jewel-backdrop relative aspect-square overflow-hidden rounded-[10px] border border-line"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />

              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Quitar foto"
                className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-forest/70 text-white transition-colors duration-200 ease-fluid hover:bg-danger"
              >
                <CloseIcon className="size-3.5" />
              </button>

              {index === 0 ? (
                <span className="absolute bottom-1 left-1 rounded-md bg-forest/80 px-1.5 py-0.5 text-[9px] tracking-wide text-white uppercase">
                  Principal
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makePrimary(index)}
                  className="absolute inset-x-1 bottom-1 rounded-md bg-white/85 py-1 text-[9px] tracking-wide text-forest uppercase opacity-0 transition-opacity duration-200 ease-fluid group-hover:opacity-100 focus-visible:opacity-100"
                >
                  Hacer principal
                </button>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {remaining > 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void uploadFiles(Array.from(event.dataTransfer.files));
          }}
          disabled={uploading}
          className={cn(
            "flex w-full flex-col items-center gap-2 rounded-[10px] border-[1.5px] border-dashed px-4 py-6",
            "text-xs text-ink-soft transition-colors duration-200 ease-fluid",
            "disabled:cursor-wait",
            dragging ? "border-forest-soft bg-surface" : "border-line hover:border-ink-soft",
            error && "border-danger",
          )}
        >
          {uploading ? (
            <>
              <SpinnerIcon className="size-[22px]" />
              {progress && progress.total > 1
                ? `Optimizando y subiendo ${progress.actual} de ${progress.total}...`
                : "Optimizando y subiendo..."}
            </>
          ) : (
            <>
              <ImageIcon className="size-[22px]" />
              <span>
                Arrastra {max === 1 ? "una imagen" : "imágenes"} aquí o haz clic
                para subir
              </span>
              <span className="text-[11px]">
                JPG, PNG o WebP · se optimizan solas al subir
              </span>
            </>
          )}
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple={max > 1}
        className="hidden"
        onChange={(event) => void uploadFiles(Array.from(event.target.files ?? []))}
      />

      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
