import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 *
 * Hay que crear uno nuevo por request: nunca compartir la instancia entre
 * peticiones, porque lleva la sesión del usuario en las cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Los Server Components no pueden escribir cookies. El refresco de
          // sesión lo cubre `proxy.ts`, así que aquí se puede ignorar.
        }
      },
    },
  });
}
