import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { NoAccessScreen } from "@/components/admin/no-access-screen";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Panel administrador",
  robots: { index: false, follow: false },
};

/**
 * Puerta de entrada al panel.
 *
 * `proxy.ts` ya redirige a quien no tiene sesión; aquí se confirma además que
 * el usuario esté en `admin_users`. Sin esa fila, RLS le negaría cada
 * escritura, así que es mejor decírselo de una vez.
 */
export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const session = await getAdminSession();

  if (!session) redirect("/admin/login");

  if (!session.admin) {
    return <NoAccessScreen email={session.user.email ?? ""} />;
  }

  const adminName =
    session.admin.full_name?.trim() || session.user.email || "Administradora";

  return <AdminShell adminName={adminName}>{children}</AdminShell>;
}
