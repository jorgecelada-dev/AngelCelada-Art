"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Categoria, Obra } from "@/types";

export default function ObraForm({
  categorias,
  obra,
}: {
  categorias: Categoria[];
  obra?: Obra;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagenFile, setImagenFile] = useState<File | null>(null);

  const esEdicion = Boolean(obra);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      let imagen_url = obra?.imagen_url ?? null;

      if (imagenFile) {
        const nombreArchivo = `${Date.now()}-${imagenFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("obras")
          .upload(nombreArchivo, imagenFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("obras").getPublicUrl(nombreArchivo);

        imagen_url = publicUrl;
      }

      const estado = (fd.get("estado") as string) || "en venta";
      const disponible = estado === "en venta" || estado === "oferta";

      const payload = {
        titulo: fd.get("titulo") as string,
        descripcion: fd.get("descripcion") as string,
        tecnica: fd.get("tecnica") as string,
        medidas: fd.get("medidas") as string,
        ancho_cm: fd.get("ancho_cm") ? Number(fd.get("ancho_cm")) : null,
        alto_cm: fd.get("alto_cm") ? Number(fd.get("alto_cm")) : null,
        anio: fd.get("anio") ? Number(fd.get("anio")) : null,
        fecha_creacion: (fd.get("fecha_creacion") as string) || null,
        precio: Number(fd.get("precio")),
        estado,
        disponible,
        destacada: fd.get("destacada") === "on",
        categoria_id: (fd.get("categoria_id") as string) || null,
        imagen_url,
      };

      if (esEdicion && obra) {
        const { error: updateError } = await supabase
          .from("obras")
          .update(payload)
          .eq("id", obra.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("obras")
          .insert(payload);
        if (insertError) throw insertError;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la obra. Revisa los datos e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium">Título</label>
        <input
          name="titulo"
          defaultValue={obra?.titulo}
          required
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea
          name="descripcion"
          defaultValue={obra?.descripcion ?? ""}
          rows={4}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Técnica</label>
          <input
            name="tecnica"
            defaultValue={obra?.tecnica ?? ""}
            placeholder="Óleo sobre lino, pigmentos naturales…"
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Medidas</label>
          <input
            name="medidas"
            defaultValue={obra?.medidas ?? ""}
            placeholder="80 x 100 cm"
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Ancho real (cm)</label>
          <input
            name="ancho_cm"
            type="number"
            step="0.01"
            defaultValue={obra?.ancho_cm ?? ""}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Alto real (cm)</label>
          <input
            name="alto_cm"
            type="number"
            step="0.01"
            defaultValue={obra?.alto_cm ?? ""}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Año</label>
          <input
            name="anio"
            type="number"
            defaultValue={obra?.anio ?? ""}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha de creación</label>
          <input
            name="fecha_creacion"
            type="date"
            defaultValue={obra?.fecha_creacion ?? ""}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Precio (€)</label>
          <input
            name="precio"
            type="number"
            step="0.01"
            defaultValue={obra?.precio ?? ""}
            required
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select
            name="estado"
            defaultValue={obra?.estado ?? "en venta"}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          >
            <option value="en venta">En venta</option>
            <option value="no se vende">No se vende</option>
            <option value="vendido">Vendido</option>
            <option value="oferta">Oferta</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Categoría</label>
        <select
          name="categoria_id"
          defaultValue={obra?.categoria_id ?? ""}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        >
          <option value="">Sin categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Imagen {esEdicion && "(deja vacío para mantener la actual)"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagenFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
      </div>

      <div className="flex gap-8">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="destacada"
            defaultChecked={obra?.destacada ?? false}
          />
          Mostrar en portada
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Guardando…" : esEdicion ? "Guardar cambios" : "Publicar obra"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
