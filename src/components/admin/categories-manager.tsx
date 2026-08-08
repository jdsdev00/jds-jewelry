"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-shell";
import { EditIcon, PlusIcon, TagIcon, TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField, TextField } from "@/components/ui/field";
import { Sheet } from "@/components/ui/sheet";
import { reportInvalid } from "@/lib/form-errors";
import type { CategoryWithCount } from "@/lib/types";
import { categorySchema, type CategoryInput } from "@/lib/validations";
import {
  createCategoryAction,
  deleteCategoryAction,
  renameCategoryAction,
} from "@/app/admin/actions";

const EASE = [0.22, 0.61, 0.36, 1] as const;

type CategoriesManagerProps = {
  categories: CategoryWithCount[];
};

type EditingState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; category: CategoryWithCount };

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [editing, setEditing] = useState<EditingState>({ mode: "closed" });
  const [pendingDelete, setPendingDelete] = useState<CategoryWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);
  /** Categoría a la que se mudan las piezas de la que se va a eliminar. */
  const [destino, setDestino] = useState("");

  const otrasCategorias = pendingDelete
    ? categories.filter((categoria) => categoria.id !== pendingDelete.id)
    : [];

  function cancelDelete() {
    setPendingDelete(null);
    setDestino("");
  }

  async function handleDelete() {
    if (!pendingDelete) return;

    const tienePiezas = pendingDelete.productCount > 0;
    if (tienePiezas && !destino) {
      toast.error("Elige a qué categoría mover las piezas.");
      return;
    }

    setDeleting(true);
    const result = await deleteCategoryAction(
      pendingDelete.id,
      tienePiezas ? destino : undefined,
    );
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message ?? "Categoría eliminada.");
    cancelDelete();
    startTransition(() => router.refresh());
  }

  return (
    <>
      <AdminPageHeader
        title="Categorías"
        action={
          <Button onClick={() => setEditing({ mode: "create" })}>
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">Nueva categoría</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        }
      />

      <div className="p-4 md:p-6">
        {categories.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <AnimatePresence initial={false}>
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.26, ease: EASE }}
                  className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 last:border-b-0 md:px-5"
                >
                  <div className="min-w-0">
                    <span className="text-sm text-ink">{category.name}</span>
                    <span className="ml-2 text-[11px] text-ink-soft">
                      {category.productCount}{" "}
                      {category.productCount === 1 ? "pieza" : "piezas"}
                    </span>
                  </div>

                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditing({ mode: "edit", category })}
                      aria-label={`Renombrar ${category.name}`}
                      className="grid size-8 place-items-center rounded-lg text-ink transition-colors duration-200 ease-fluid hover:bg-surface"
                    >
                      <EditIcon className="size-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(category)}
                      aria-label={`Eliminar ${category.name}`}
                      className="grid size-8 place-items-center rounded-lg text-ink transition-colors duration-200 ease-fluid hover:bg-danger-soft hover:text-danger"
                    >
                      <TrashIcon className="size-[18px]" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            icon={<TagIcon />}
            title="Todavía no hay categorías."
            description="Las categorías organizan el catálogo y aparecen como filtros en la tienda."
            action={
              <Button onClick={() => setEditing({ mode: "create" })}>
                <PlusIcon className="size-4" />
                Crear la primera
              </Button>
            }
          />
        )}
      </div>

      {editing.mode !== "closed" ? (
        <CategoryForm
          key={editing.mode === "edit" ? editing.category.id : "nueva"}
          initialName={editing.mode === "edit" ? editing.category.name : ""}
          onClose={() => setEditing({ mode: "closed" })}
          onSaved={() => {
            setEditing({ mode: "closed" });
            startTransition(() => router.refresh());
          }}
          categoryId={editing.mode === "edit" ? editing.category.id : null}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`¿Eliminar "${pendingDelete?.name ?? ""}"?`}
        description={
          (pendingDelete?.productCount ?? 0) > 0
            ? `Esta categoría tiene ${pendingDelete?.productCount} pieza(s). Elige a dónde se mudan; no se borra ninguna.`
            : "Esta acción no se puede deshacer."
        }
        loading={deleting}
        confirmDisabled={
          (pendingDelete?.productCount ?? 0) > 0 &&
          (destino === "" || otrasCategorias.length === 0)
        }
        onConfirm={() => void handleDelete()}
        onCancel={cancelDelete}
      >
        {(pendingDelete?.productCount ?? 0) > 0 ? (
          otrasCategorias.length > 0 ? (
            <SelectField
              label="Mover las piezas a"
              value={destino}
              onChange={(event) => setDestino(event.target.value)}
            >
              <option value="">Elige una categoría...</option>
              {otrasCategorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.name}
                </option>
              ))}
            </SelectField>
          ) : (
            <p className="rounded-lg bg-danger-soft px-3.5 py-2.5 text-xs text-danger">
              Es la única categoría que existe. Crea otra antes de poder mover
              estas piezas.
            </p>
          )
        ) : null}
      </ConfirmDialog>
    </>
  );
}

type CategoryFormProps = {
  categoryId: string | null;
  initialName: string;
  onClose: () => void;
  onSaved: () => void;
};

/** Panel con un solo campo: crear o renombrar una categoría. */
function CategoryForm({
  categoryId,
  initialName,
  onClose,
  onSaved,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: initialName },
  });

  async function onSubmit(values: CategoryInput) {
    const result = categoryId
      ? await renameCategoryAction(categoryId, values)
      : await createCategoryAction(values);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message ?? "Listo.");
    onSaved();
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={categoryId ? "Renombrar categoría" : "Nueva categoría"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="category-form" loading={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit(onSubmit, reportInvalid)} noValidate>
        <TextField
          label="Nombre de la categoría"
          placeholder="Ej. Anillos"
          autoFocus
          hint="Se usa como filtro en la tienda."
          error={errors.name?.message}
          {...register("name")}
        />
      </form>
    </Sheet>
  );
}
