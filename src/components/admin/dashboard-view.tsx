"use client";

import { AdminPageHeader } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { AdminStats } from "@/lib/queries";

type DashboardViewProps = {
  stats: AdminStats;
};

/** Pantalla de entrada del panel: cifras del catálogo y atajos. */
export function DashboardView({ stats }: DashboardViewProps) {
  return (
    <>
      <AdminPageHeader title="Resumen" />

      <div className="animate-rise p-4 md:p-6">
        <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            label="Piezas totales"
            value={stats.totalProducts}
            hint={
              stats.inactiveProducts > 0
                ? `${stats.inactiveProducts} sin publicar`
                : "Todas visibles"
            }
          />
          <StatCard label="En oferta" value={stats.onSale} />
          <StatCard label="Categorías" value={stats.categories} />
          <StatCard label="Banners activos" value={stats.activeBanners} />
        </div>

        <h2 className="mb-3 text-[13px] tracking-[0.02em] text-ink-soft">
          Atajos
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <Button href="/admin/productos" variant="ghost">
            <PlusIcon className="size-4" />
            Agregar producto
          </Button>
          <Button href="/admin/banners" variant="ghost">
            <PlusIcon className="size-4" />
            Agregar banner
          </Button>
          <Button href="/admin/categorias" variant="ghost">
            <PlusIcon className="size-4" />
            Agregar categoría
          </Button>
        </div>
      </div>
    </>
  );
}
