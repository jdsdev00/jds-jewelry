import { BannersManager } from "@/components/admin/banners-manager";
import { getAdminBanners, getCategories } from "@/lib/queries";

export default async function AdminBannersPage() {
  const [banners, categories] = await Promise.all([
    getAdminBanners(),
    getCategories(),
  ]);

  return <BannersManager banners={banners} categories={categories} />;
}
