// Cliente de Supabase para usar en componentes de cliente ("use client").
// Usa la clave pública (anon key), respeta las políticas RLS.
import { createBrowserClient } from "@supabase/ssr";

function createFallbackClient() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: async () => ({ data: null, error: null }),
      update: () => ({
        eq: async () => ({ data: null, error: null }),
      }),
      delete: () => ({
        eq: async () => ({ data: null, error: null }),
      }),
      upsert: async () => ({ data: null, error: null }),
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" }, error: null }),
      }),
    },
  };
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return createFallbackClient();
  }

  return createBrowserClient(url, anonKey);
}
