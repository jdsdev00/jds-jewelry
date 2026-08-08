import { CategoriesManager } from "@/components/admin/categories-manager";
import { getCategoriesWithCounts } from "@/lib/queries";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return <CategoriesManager categories={categories} />;
}
