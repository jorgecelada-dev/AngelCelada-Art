// Cliente "admin" con la clave de servicio (Service Role).
// SOLO se usa en el servidor (Route Handlers / Server Actions), nunca en el
// cliente. Se salta las políticas RLS, así que hay que usarlo con cuidado:
// solo para operaciones que ya hemos validado (formulario de contacto,
// creación de pedidos desde el webhook de Stripe, acciones del panel admin
// tras comprobar que el usuario está autenticado).
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
