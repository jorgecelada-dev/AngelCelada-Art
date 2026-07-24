// Cliente de Supabase para usar en componentes de cliente ("use client").
// Usa la clave pública (anon key), respeta las políticas RLS.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
