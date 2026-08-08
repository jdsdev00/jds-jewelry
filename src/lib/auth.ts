import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "./supabase/server";
import type { AdminUser } from "./types";

/**
 * Sesión del panel.
 *
 * `proxy.ts` ya bloquea a quien no ha iniciado sesión, pero eso es solo un
 * chequeo optimista sobre la cookie. La autorización de verdad se decide aquí
 * y en las políticas RLS de la base de datos.
 */

export type AdminSession = {
  user: User;
  admin: AdminUser | null;
};

/** Devuelve el usuario y su fila en `admin_users` (null si no es admin). */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id, full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return { user, admin: (admin as AdminUser | null) ?? null };
}

/**
 * Para usar dentro de los Server Actions: corta la ejecución si quien llama
 * no es administrador. Así ninguna acción confía en el formulario que la
 * disparó.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) redirect("/admin/login");
  if (!session.admin) {
    throw new Error("Tu cuenta no tiene permisos de administrador.");
  }

  return session;
}
