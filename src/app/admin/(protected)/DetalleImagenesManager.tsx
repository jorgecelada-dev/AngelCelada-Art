"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ObraDetalle } from "@/types";

export default function DetalleImagenesManager({ obraId }: { obraId: string }) {
  const supabase = createClient();
  const [detalles, setDetalles] = useState<ObraDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function recargar() {
    const { data } = await supabase
      .from("obra_detalles")
      .select("*")
      .eq("obra_id", obraId)
      .order("orden");
    setDetalles((data ?? []) as ObraDetalle[]);
  }

  useEffect(() => {
    recargar().finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obraId]);

  async function onSubirImagenes(files: FileList | null) {
    if (!files || files.length === 0) return;
    setSubiendo(true);
    setError(null);

    try {
      let siguienteOrden =
        detalles.length > 0 ? Math.max(...detalles.map((d) => d.orden)) + 1 : 0;

      for (const file of Array.from(files)) {
        const nombreArchivo = `detalle/${obraId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("obras")
          .upload(nombreArchivo, file);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("obras").getPublicUrl(nombreArchivo);

        const { error: insertError } = await supabase.from("obra_detalles").insert({
          obra_id: obraId,
          imagen_url: publicUrl,
          orden: siguienteOrden,
          tamano: "1x1",
        });
        if (insertError) throw insertError;

        siguienteOrden += 1;
      }

      await recargar();
    } catch (err) {
      console.error(err);
      setError("No se pudieron subir algunas imágenes. Inténtalo de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  async function onCambiarTamano(id: string, tamano: "1x1" | "1x2") {
    setDetalles((prev) =>
      prev.map((d) => (d.id === id ? { ...d, tamano } : d))
    );
    await supabase.from("obra_detalles").update({ tamano }).eq("id", id);
  }

  async function onEliminar(id: string) {
    setDetalles((prev) => prev.filter((d) => d.id !== id));
    await supabase.from("obra_detalles").delete().eq("id", id);
  }

  async function onMover(id: string, direccion: -1 | 1) {
    const indice = detalles.findIndex((d) => d.id === id);
    const indiceVecino = indice + direccion;
    if (indice === -1 || indiceVecino < 0 || indiceVecino >= detalles.length) {
      return;
    }

    const actual = detalles[indice];
    const vecino = detalles[indiceVecino];
    const nuevos = [...detalles];
    nuevos[indice] = { ...actual, orden: vecino.orden };
    nuevos[indiceVecino] = { ...vecino, orden: actual.orden };
    nuevos.sort((a, b) => a.orden - b.orden);
    setDetalles(nuevos);

    await Promise.all([
      supabase
        .from("obra_detalles")
        .update({ orden: vecino.orden })
        .eq("id", actual.id),
      supabase
        .from("obra_detalles")
        .update({ orden: actual.orden })
        .eq("id", vecino.id),
    ]);
  }

  return (
    <div className="rounded-xl border border-charcoal/10 bg-white/40 p-5">
      <h3 className="text-sm font-medium">Detalles de la obra</h3>
      <p className="mt-1 text-xs text-charcoal/50">
        Fotos de cerca, del proceso o de acabados. Se muestran en la ficha
        pública de la obra, en columnas de 3. Elige "cuadrada" o "alargada"
        para cada una.
      </p>

      <div className="mt-4">
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={subiendo}
          onChange={(e) => onSubirImagenes(e.target.files)}
          className="w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3 text-sm"
        />
        {subiendo && (
          <p className="mt-1 text-xs text-charcoal/50">Subiendo…</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      {!cargando && detalles.length > 0 && (
        <ul className="mt-4 space-y-2">
          {detalles.map((detalle, i) => (
            <li
              key={detalle.id}
              className="flex items-center gap-3 rounded-lg border border-charcoal/10 bg-white/60 p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detalle.imagen_url}
                alt=""
                className="h-16 w-16 rounded-md object-cover"
              />

              <select
                value={detalle.tamano}
                onChange={(e) =>
                  onCambiarTamano(detalle.id, e.target.value as "1x1" | "1x2")
                }
                className="rounded-lg border border-charcoal/20 bg-white px-2 py-1 text-xs"
              >
                <option value="1x1">Cuadrada</option>
                <option value="1x2">Alargada</option>
              </select>

              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMover(detalle.id, -1)}
                  disabled={i === 0}
                  className="rounded-md px-2 py-1 text-xs text-charcoal/60 hover:bg-charcoal/5 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMover(detalle.id, 1)}
                  disabled={i === detalles.length - 1}
                  className="rounded-md px-2 py-1 text-xs text-charcoal/60 hover:bg-charcoal/5 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onEliminar(detalle.id)}
                  className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
