/**
 * Grupo de rutas de la tienda pública.
 *
 * El header cambia entre el catálogo y el detalle de una pieza, así que cada
 * página monta el suyo. Aquí solo va la caja que las sostiene.
 */
export default function StoreLayout({ children }: LayoutProps<"/">) {
  return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
}
