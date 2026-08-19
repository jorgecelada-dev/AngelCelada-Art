"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ContenidoSobreMi } from "@/types";

const ID_FIJO = "00000000-0000-0000-0000-000000000001";

const TEXTO_POR_DEFECTO = {
  historia:
    "Escribe aquí de dónde vienes, cómo empezaste a pintar y qué te llevó a especializarte en arte orgánico. Este es el espacio para conectar emocionalmente con quien visita la web: qué sientes al crear, qué momento de tu vida marcó tu forma de pintar, y por qué eliges materiales naturales.",
  background:
    "Formación, exposiciones, premios o menciones relevantes, colaboraciones, años de trayectoria. Puedes usar una lista breve si prefieres un formato de currículum artístico.",
  tecnicas:
    "Describe el proceso: qué pigmentos naturales usas (tierras, óxidos, carbón vegetal, resinas), sobre qué superficies pintas (lino, madera, papel artesanal), y qué hace único tu proceso creativo frente al arte convencional.",
};

export default function SobreMiForm({
  contenido,
}: {
  contenido: ContenidoSobreMi | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGuardado(false);

    const fd = new FormData(e.currentTarget);

    try {
      const { error: upsertError } = await supabase
        .from("contenido_sobre_mi")
        .upsert({
          id: ID_FIJO,
          historia: (fd.get("historia") as string) || null,
          background: (fd.get("background") as string) || null,
          tecnicas: (fd.get("tecnicas") as string) || null,
          updated_at: new Date().toISOString(),
        });
      if (upsertError) throw upsertError;

      setGuardado(true);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium">Mi historia</label>
        <textarea
          name="historia"
          defaultValue={contenido?.historia ?? TEXTO_POR_DEFECTO.historia}
          rows={5}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Background</label>
        <textarea
          name="background"
          defaultValue={contenido?.background ?? TEXTO_POR_DEFECTO.background}
          rows={4}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Técnicas y materiales
        </label>
        <textarea
          name="tecnicas"
          defaultValue={contenido?.tecnicas ?? TEXTO_POR_DEFECTO.tecnicas}
          rows={4}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Guardando…" : "Guardar cambios"}
      </button>

      {guardado && (
        <p className="text-sm text-sage">Guardado correctamente.</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
