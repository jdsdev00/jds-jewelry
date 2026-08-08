"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-shell";
import { BannerForm, bannerToFormValues } from "@/components/admin/banner-form";
import { DiscountIcon, EditIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Switch } from "@/components/ui/switch";
import { isBannerLive } from "@/lib/banners";
import type { BannerWithCategory, Category } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import type { BannerInput } from "@/lib/validations";
import {
  createBannerAction,
  deleteBannerAction,
  setBannerActiveAction,
  updateBannerAction,
} from "@/app/admin/actions";

const EASE = [0.22, 0.61, 0.36, 1] as const;

type BannersManagerProps = {
  banners: BannerWithCategory[];
  categories: Category[];
};

type EditingState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; banner: BannerWithCategory };

/** Resume la vigencia de un banner en una línea legible. */
function describeSchedule(banner: BannerWithCategory): string {
  const target = banner.category?.name ?? "Todo el catálogo";
  const start = formatDate(banner.start_date);
  const end = formatDate(banner.end_date);

  if (start && end) return `${target} · ${start} — ${end}`;
  if (start) return `${target} · desde el ${start}`;
  if (end) return `${target} · hasta el ${end}`;
  return `${target} · sin fecha límite`;
}

export function BannersManager({ banners, categories }: BannersManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [editing, setEditing] = useState<EditingState>({ mode: "closed" });
  const [pendingDelete, setPendingDelete] = useState<BannerWithCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleSubmit(values: BannerInput) {
    const result =
      editing.mode === "edit"
        ? await updateBannerAction(editing.banner.id, values)
        : await createBannerAction(values);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message ?? "Listo.");
    setEditing({ mode: "closed" });
    refresh();
  }

  async function handleToggle(banner: BannerWithCategory, active: boolean) {
    setBusyId(banner.id);
    const result = await setBannerActiveAction(banner.id, active);
    setBusyId(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Listo.");
    refresh();
  }

  async function handleDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    const result = await deleteBannerAction(pendingDelete.id);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message ?? "Banner eliminado.");
    setPendingDelete(null);
    refresh();
  }

  return (
    <>
      <AdminPageHeader
        title="Ofertas y banners"
        action={
          <Button onClick={() => setEditing({ mode: "create" })}>
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">Nuevo banner</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        }
      />

      <div className="p-4 md:p-6">
        {banners.length > 0 ? (
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {banners.map((banner) => {
                const live = isBannerLive(banner);

                return (
                  <motion.div
                    key={banner.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.26, ease: EASE }}
                    className={
                      busyId === banner.id
                        ? "flex flex-wrap items-center gap-3.5 rounded-2xl border border-line bg-white p-3.5 opacity-60"
                        : "flex flex-wrap items-center gap-3.5 rounded-2xl border border-line bg-white p-3.5"
                    }
                  >
                    <div className="relative grid h-13 w-[70px] shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[#123425] to-forest">
                      {banner.image_url ? (
                        <Image
                          src={banner.image_url}
                          alt=""
                          fill
                          sizes="70px"
                          className="object-cover"
                        />
                      ) : (
                        <DiscountIcon className="size-5 text-gold" />
                      )}
                    </div>

                    <div className="min-w-[160px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium text-ink">
                          {banner.text}
                        </h3>
                        {banner.active && !live ? (
                          <Badge tone="neutral" size="sm">
                            Fuera de fecha
                          </Badge>
                        ) : null}
                        {live ? (
                          <Badge tone="oferta" size="sm">
                            En vivo
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[11px] text-ink-soft">
                        {describeSchedule(banner)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Switch
                        checked={banner.active}
                        disabled={busyId === banner.id}
                        onChange={(active) => void handleToggle(banner, active)}
                        label={`${banner.text}: activo`}
                      />
                      <button
                        type="button"
                        onClick={() => setEditing({ mode: "edit", banner })}
                        aria-label={`Editar ${banner.text}`}
                        className="grid size-8 place-items-center rounded-lg text-ink transition-colors duration-200 ease-fluid hover:bg-surface"
                      >
                        <EditIcon className="size-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(banner)}
                        aria-label={`Eliminar ${banner.text}`}
                        className="grid size-8 place-items-center rounded-lg text-ink transition-colors duration-200 ease-fluid hover:bg-danger-soft hover:text-danger"
                      >
                        <TrashIcon className="size-[18px]" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            icon={<DiscountIcon />}
            title="Aún no hay banners creados."
            description="Un banner anuncia una promoción en la parte alta del catálogo."
            action={
              <Button onClick={() => setEditing({ mode: "create" })}>
                <PlusIcon className="size-4" />
                Crear el primero
              </Button>
            }
          />
        )}
      </div>

      {editing.mode !== "closed" ? (
        <BannerForm
          key={editing.mode === "edit" ? editing.banner.id : "nuevo"}
          open
          onClose={() => setEditing({ mode: "closed" })}
          categories={categories}
          initialValues={
            editing.mode === "edit" ? bannerToFormValues(editing.banner) : null
          }
          onSubmit={handleSubmit}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="¿Eliminar este banner?"
        description={`"${pendingDelete?.text ?? ""}" dejará de mostrarse en la tienda.`}
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
