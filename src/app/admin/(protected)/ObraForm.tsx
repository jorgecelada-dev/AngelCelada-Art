"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Categoria, Obra } from "@/types";

function formatearCm(valor: number): string {
  return Number(valor.toFixed(2)).toString();
}

function leerDimensionesImagen(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

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
  const [anchoCm, setAnchoCm] = useState<string>(
    obra?.ancho_cm?.toString() ?? ""
  );
  const [altoCm, setAltoCm] = useState<string>(
    obra?.alto_cm?.toString() ?? ""
  );

  const esEdicion = Boolean(obra);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      let imagen_url = obra?.imagen_url ?? null;
      let imagen_ancho_px = obra?.imagen_ancho_px ?? null;
      let imagen_alto_px = obra?.imagen_alto_px ?? null;

      if (imagenFile) {
        const dimensiones = await leerDimensionesImagen(imagenFile);
        imagen_ancho_px = dimensiones.width;
        imagen_alto_px = dimensiones.height;

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

      const anchoCm = fd.get("ancho_cm") ? Number(fd.get("ancho_cm")) : null;
      const altoCm = fd.get("alto_cm") ? Number(fd.get("alto_cm")) : null;
      // "Medidas" siempre se calcula a partir del ancho/alto real del
      // cuadro (nunca del tamaño en píxeles de la foto), para que no
      // puedan desincronizarse entre sí.
      const medidas =
        anchoCm && altoCm
          ? `${formatearCm(anchoCm)} x ${formatearCm(altoCm)} cm`
          : null;

      const payload = {
        titulo: fd.get("titulo") as string,
        descripcion: fd.get("descripcion") as string,
        tecnica: fd.get("tecnica") as string,
        medidas,
        ancho_cm: anchoCm,
        alto_cm: altoCm,
        anio: fd.get("anio") ? Number(fd.get("anio")) : null,
        fecha_creacion: (fd.get("fecha_creacion") as string) || null,
        precio: Number(fd.get("precio")),
        estado,
        disponible,
        destacada: fd.get("destacada") === "on",
        categoria_id: (fd.get("categoria_id") as string) || null,
        imagen_url,
        imagen_ancho_px,
        imagen_alto_px,
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

      <div>
        <label className="block text-sm font-medium">Técnica</label>
        <input
          name="tecnica"
          defaultValue={obra?.tecnica ?? ""}
          placeholder="Óleo sobre lino, pigmentos naturales…"
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">
            Ancho real del cuadro (cm)
          </label>
          <input
            name="ancho_cm"
            type="number"
            step="0.01"
            value={anchoCm}
            onChange={(e) => setAnchoCm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Alto real del cuadro (cm)
          </label>
          <input
            name="alto_cm"
            type="number"
            step="0.01"
            value={altoCm}
            onChange={(e) => setAltoCm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
      </div>

      <p className="-mt-2 text-xs text-charcoal/50">
        {anchoCm && altoCm
          ? `Se guardará como "Medidas: ${formatearCm(Number(anchoCm))} x ${formatearCm(Number(altoCm))} cm". También es lo que se usa para encajarla en "Visualiza en tu espacio".`
          : "Rellena ambos campos para calcular las medidas que se mostrarán."}
      </p>

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
        <label className="block text-sm font-medium">Colección</label>
        <select
          name="categoria_id"
          defaultValue={obra?.categoria_id ?? ""}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        >
          <option value="">Sin colección</option>
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
