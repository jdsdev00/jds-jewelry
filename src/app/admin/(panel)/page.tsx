import { DashboardView } from "@/components/admin/dashboard-view";
import { getAdminStats } from "@/lib/queries";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return <DashboardView stats={stats} />;
}
