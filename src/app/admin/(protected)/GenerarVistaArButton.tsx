"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Obra } from "@/types";
import { generarYSubirVistaAr } from "@/lib/ar/generarYSubirVistaAr";

// Genera y sube los ficheros .glb/.usdz para el modo "Ver en AR" de
// /mi-espacio. Acción independiente del formulario principal (como
// DeleteObraButton): actúa sobre los datos ya guardados de la obra, no
// sobre ediciones pendientes en el formulario.
export default function GenerarVistaArButton({ obra }: { obra: Obra }) {
  const supabase = createClient();
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [glbUrl, setGlbUrl] = useState(obra.modelo_ar_glb_url);
  const [usdzUrl, setUsdzUrl] = useState(obra.modelo_ar_usdz_url);

  const listo = Boolean(glbUrl && usdzUrl);
  const puedeGenerar = Boolean(obra.imagen_url && obra.ancho_cm && obra.alto_cm);

  async function generar() {
    setGenerando(true);
    setError(null);
    try {
      const { glbUrl: nuevoGlbUrl, usdzUrl: nuevoUsdzUrl } =
        await generarYSubirVistaAr(supabase, obra);
      setGlbUrl(nuevoGlbUrl);
      setUsdzUrl(nuevoUsdzUrl);
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo generar la vista AR. Comprueba tu conexión e inténtalo de nuevo."
      );
    } finally {
      setGenerando(false);
    }
  }

  if (!puedeGenerar) {
    return (
      <div className="rounded-lg border border-charcoal/10 bg-charcoal/5 px-4 py-3 text-xs text-charcoal/50">
        Añade una imagen y las medidas en cm para poder generar la vista AR.
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Vista en AR</p>
          <p className="mt-0.5 text-xs text-charcoal/50">
            {listo
              ? 'Lista: aparece como opción en "Tu espacio" → Ver en AR.'
              : 'Aún no generada: no aparece en el modo AR de "Tu espacio".'}
          </p>
        </div>
        {listo && (
          <span className="flex-none rounded-full bg-sage/15 px-2.5 py-1 text-xs text-sage">
            Lista
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={generar}
        disabled={generando}
        className="btn-secondary w-full text-center text-sm"
      >
        {generando ? "Generando…" : listo ? "Regenerar vista AR" : "Generar vista AR"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
