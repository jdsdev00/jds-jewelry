import { createBrowserClient } from "@supabase/ssr";

import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente de Supabase para componentes cliente ("use client").
 * Se usa sobre todo para el login y para subir imágenes al Storage.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
