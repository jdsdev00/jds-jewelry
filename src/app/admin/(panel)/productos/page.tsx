import { ProductsManager } from "@/components/admin/products-manager";
import {
  getAdminProducts,
  getCategories,
  supportsManualOrder,
} from "@/lib/queries";

export default async function AdminProductsPage() {
  const [products, categories, ordenManual] = await Promise.all([
    getAdminProducts(),
    getCategories(),
    supportsManualOrder(),
  ]);

  return (
    <ProductsManager
      products={products}
      categories={categories}
      canReorder={ordenManual}
    />
  );
}
