import "server-only";

import { createClient } from "@supabase/supabase-js";

import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente anónimo para las lecturas de la tienda pública.
 *
 * A diferencia del cliente de `server.ts`, este no toca las cookies. Eso
 * importa por dos razones:
 *
 * 1. Sin acceso a cookies, Next puede prerenderizar el catálogo y servirlo
 *    desde caché (ISR) en vez de consultar Supabase en cada visita.
 * 2. El catálogo se ve igual para todo el mundo. Si usara la sesión, la
 *    respuesta cacheada de una administradora podría incluir piezas
 *    inactivas y acabar servida a un cliente cualquiera.
 *
 * Como no hay sesión, RLS lo trata como visitante: solo lo público.
 */
export const publicSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
