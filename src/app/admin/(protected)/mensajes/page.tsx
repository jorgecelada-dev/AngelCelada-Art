import { createClient } from "@/lib/supabase/server";
import type { MensajeContacto } from "@/types";

export const revalidate = 0;

export default async function MensajesPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("mensajes_contacto")
    .select("*")
    .order("created_at", { ascending: false });

  const mensajes = (data ?? []) as MensajeContacto[];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-serif">
        Mensajes de contacto ({mensajes.length})
      </h1>

      <div className="space-y-4">
        {mensajes.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-charcoal/10 bg-white/50 p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">{m.nombre}</p>
              <p className="text-xs text-charcoal/50">
                {new Date(m.created_at).toLocaleString("es-ES")}
              </p>
            </div>
            <p className="text-sm text-charcoal/60">
              {m.email} {m.telefono && `· ${m.telefono}`}
            </p>
            <p className="mt-3 text-sm">{m.mensaje}</p>
          </div>
        ))}

        {mensajes.length === 0 && (
          <p className="text-charcoal/60">No hay mensajes todavía.</p>
        )}
      </div>
    </div>
  );
}
