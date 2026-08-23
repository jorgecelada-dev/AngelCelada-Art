"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Obra } from "@/types";
import { generarYSubirVistaAr } from "@/lib/ar/generarYSubirVistaAr";

// Genera la vista AR de todas las obras que aún no la tengan, de una
// sentada, en vez de tener que entrar obra por obra. Secuencial (no en
// paralelo) para no saturar la conexión del navegador — puede tardar
// si hay muchas obras pendientes, por eso muestra progreso.
export default function GenerarTodasVistaArButton({ obras }: { obras: Obra[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [procesando, setProcesando] = useState(false);
  const [progreso, setProgreso] = useState({ hecho: 0, total: 0 });
  const [fallos, setFallos] = useState<string[]>([]);
  const [terminado, setTerminado] = useState(false);

  const pendientes = obras.filter(
    (o) =>
      o.imagen_url &&
      o.ancho_cm &&
      o.alto_cm &&
      !(o.modelo_ar_glb_url && o.modelo_ar_usdz_url)
  );

  if (pendientes.length === 0) return null;

  async function generarTodas() {
    setProcesando(true);
    setTerminado(false);
    setFallos([]);
    setProgreso({ hecho: 0, total: pendientes.length });

    const fallidas: string[] = [];
    for (let i = 0; i < pendientes.length; i++) {
      const obra = pendientes[i];
      try {
        await generarYSubirVistaAr(supabase, obra);
      } catch (err) {
        console.error(err);
        fallidas.push(obra.titulo);
      }
      setProgreso({ hecho: i + 1, total: pendientes.length });
    }

    setFallos(fallidas);
    setProcesando(false);
    setTerminado(true);
    router.refresh();
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-charcoal/10 bg-white/40 p-4">
      <div className="flex-1">
        <p className="text-sm font-medium">
          Vista en AR: {pendientes.length}{" "}
          {pendientes.length === 1 ? "obra sin generar" : "obras sin generar"}
        </p>
        {procesando && (
          <p className="mt-0.5 text-xs text-charcoal/50">
            Generando {progreso.hecho} de {progreso.total}…
          </p>
        )}
        {terminado && fallos.length === 0 && (
          <p className="mt-0.5 text-xs text-sage">
            Listo: todas generadas correctamente.
          </p>
        )}
        {terminado && fallos.length > 0 && (
          <p className="mt-0.5 text-xs text-red-600">
            {fallos.length} no se pudieron generar: {fallos.join(", ")}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={generarTodas}
        disabled={procesando}
        className="btn-secondary text-sm"
      >
        {procesando ? "Generando…" : "Generar vista AR para todas"}
      </button>
    </div>
  );
}
