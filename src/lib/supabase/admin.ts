// Cliente "admin" con la clave de servicio (Service Role).
// SOLO se usa en el servidor (Route Handlers / Server Actions), nunca en el
// cliente. Se salta las políticas RLS, así que hay que usarlo con cuidado:
// solo para operaciones que ya hemos validado (formulario de contacto,
// creación de pedidos desde el webhook de Stripe, acciones del panel admin
// tras comprobar que el usuario está autenticado).
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function createFallbackClient() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
        }),
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
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" }, error: null }),
      }),
    },
  };
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.warn("Supabase admin client not configured; using fallback client.");
    return createFallbackClient() as unknown as ReturnType<typeof createSupabaseClient>;
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
