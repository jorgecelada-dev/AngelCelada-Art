import { createClient } from "@/lib/supabase/server";
import CambiarContrasenaEmail from "./CambiarContrasenaEmail";
import CambiarContrasenaDirecta from "./CambiarContrasenaDirecta";

export default async function AjustesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-lg">
      <h1 className="mb-2 text-2xl font-serif">Ajustes</h1>
      <p className="mb-8 text-sm text-charcoal/60">
        Sesión iniciada como{" "}
        <span className="font-medium text-charcoal">{user?.email}</span>
      </p>

      <div className="space-y-8">
        <section className="rounded-xl border border-charcoal/10 bg-white/60 p-5">
          <h2 className="mb-1 text-lg font-medium">Cambiar tu contraseña</h2>
          <p className="mb-4 text-sm text-charcoal/60">
            Te enviamos un email a <strong>{user?.email}</strong> con un
            enlace para crear una contraseña nueva.
          </p>
          <CambiarContrasenaEmail email={user?.email ?? ""} />
        </section>

        <section className="rounded-xl border border-charcoal/10 bg-white/60 p-5">
          <h2 className="mb-1 text-lg font-medium">
            Cambiar una contraseña directamente
          </h2>
          <p className="mb-4 text-sm text-charcoal/60">
            Para cuando no es cómodo pasar por el email — por ejemplo, para
            ayudar al otro a entrar si no tiene el correo a mano.
          </p>
          <CambiarContrasenaDirecta />
        </section>
      </div>
    </div>
  );
}
