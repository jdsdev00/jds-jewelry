"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-shell";
import { ProductAdminCard } from "@/components/admin/product-admin-card";
import {
  ProductForm,
  productToFormValues,
} from "@/components/admin/product-form";
import { GemIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField, TextField } from "@/components/ui/field";
import type { ProductView } from "@/lib/products";
import type { Category } from "@/lib/types";
import { normalizeForSearch } from "@/lib/utils";
import type { ProductInput } from "@/lib/validations";
import {
  createProductAction,
  deleteProductAction,
  moveProductAction,
  setProductActiveAction,
  updateProductAction,
} from "@/app/admin/actions";

const EASE = [0.22, 0.61, 0.36, 1] as const;

type ProductsManagerProps = {
  products: ProductView[];
  categories: Category[];
  /** Falso mientras no se haya ejecutado supabase-migracion-2.sql. */
  canReorder: boolean;
};

type EditingState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; product: ProductView };

export function ProductsManager({
  products,
  categories,
  canReorder,
}: ProductsManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todo");
  const [statusFilter, setStatusFilter] = useState("todo");

  const [editing, setEditing] = useState<EditingState>({ mode: "closed" });
  const [pendingDelete, setPendingDelete] = useState<ProductView | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = normalizeForSearch(query.trim());

    return products.filter((product) => {
      if (categoryFilter !== "todo" && product.categoryId !== categoryFilter) {
        return false;
      }
      if (statusFilter === "activos" && !product.active) return false;
      if (statusFilter === "inactivos" && product.active) return false;
      if (statusFilter === "oferta" && product.discountType === "none") return false;
      if (!needle) return true;

      return normalizeForSearch(
        `${product.name} ${product.material ?? ""} ${product.categoryName}`,
      ).includes(needle);
    });
  }, [products, query, categoryFilter, statusFilter]);

  /** Refresca los datos del servidor tras una escritura exitosa. */
  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleSubmit(values: ProductInput) {
    const result =
      editing.mode === "edit"
        ? await updateProductAction(editing.product.id, values)
        : await createProductAction(values);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message ?? "Listo.");
    setEditing({ mode: "closed" });
    refresh();
  }

  async function handleMove(
    product: ProductView,
    direccion: "arriba" | "abajo",
  ) {
    setBusyId(product.id);
    const result = await moveProductAction(product.id, direccion);
    setBusyId(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    refresh();
  }

  async function handleToggleActive(product: ProductView, active: boolean) {
    setBusyId(product.id);
    const result = await setProductActiveAction(product.id, active);
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
    const result = await deleteProductAction(pendingDelete.id);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message ?? "Pieza eliminada.");
    setPendingDelete(null);
    refresh();
  }

  const noCategories = categories.length === 0;

  /**
   * Las flechas de orden solo aparecen con la lista completa a la vista. Con
   * un filtro puesto, "subir una posición" mueve la pieza respecto a otras que
   * no se están viendo, y el resultado desconcierta.
   */
  const sinFiltrar =
    query.trim() === "" && categoryFilter === "todo" && statusFilter === "todo";
  const puedeReordenar = canReorder && sinFiltrar;

  return (
    <>
      <AdminPageHeader
        title="Productos"
        action={
          <Button
            onClick={() => setEditing({ mode: "create" })}
            disabled={noCategories}
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">Nuevo producto</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        }
      />

      <div className="p-4 md:p-6">
        {noCategories ? (
          <div className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-[13px] text-danger">
            Crea al menos una categoría antes de agregar piezas.
          </div>
        ) : null}

        <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-start">
          <TextField
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
            icon={<SearchIcon className="size-[15px]" />}
            wrapperClassName="sm:w-56"
          />

          <div className="flex gap-2.5">
            <SelectField
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filtrar por categoría"
              wrapperClassName="flex-1 sm:w-48"
            >
              <option value="todo">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filtrar por estado"
              wrapperClassName="flex-1 sm:w-40"
            >
              <option value="todo">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
              <option value="oferta">Con descuento</option>
            </SelectField>
          </div>
        </div>

        {visible.length > 0 && canReorder && !sinFiltrar ? (
          <p className="mb-3 text-[11px] text-ink-soft">
            Quita los filtros para poder reordenar las piezas del catálogo.
          </p>
        ) : null}

        {visible.length > 0 ? (
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.28, ease: EASE }}
                >
                  <ProductAdminCard
                    product={product}
                    busy={busyId === product.id}
                    reorderEnabled={puedeReordenar}
                    canMoveUp={index > 0}
                    canMoveDown={index < visible.length - 1}
                    onMove={(direccion) => void handleMove(product, direccion)}
                    onEdit={() => setEditing({ mode: "edit", product })}
                    onDelete={() => setPendingDelete(product)}
                    onToggleActive={(active) =>
                      void handleToggleActive(product, active)
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            icon={<GemIcon />}
            title={
              products.length === 0
                ? "Todavía no hay piezas cargadas."
                : "No hay productos con ese criterio."
            }
            description={
              products.length === 0
                ? "Agrega la primera pieza para que aparezca en la tienda."
                : "Prueba con otro filtro o cambia lo que escribiste."
            }
            action={
              products.length === 0 && !noCategories ? (
                <Button onClick={() => setEditing({ mode: "create" })}>
                  <PlusIcon className="size-4" />
                  Agregar la primera pieza
                </Button>
              ) : null
            }
          />
        )}
      </div>

      {editing.mode !== "closed" ? (
        <ProductForm
          // Remontar el formulario en cada apertura evita arrastrar los
          // valores de la pieza anterior.
          key={editing.mode === "edit" ? editing.product.id : "nuevo"}
          open
          onClose={() => setEditing({ mode: "closed" })}
          categories={categories}
          initialValues={
            editing.mode === "edit" ? productToFormValues(editing.product) : null
          }
          onSubmit={handleSubmit}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`¿Eliminar "${pendingDelete?.name ?? ""}"?`}
        description="Se borran también sus fotos y no hay forma de recuperarlas. Si solo quieres quitarla de la tienda por ahora, cierra esto y usa el interruptor de la tarjeta."
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
