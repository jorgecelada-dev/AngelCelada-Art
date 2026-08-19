"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Categoria, Obra } from "@/types";
import DetalleImagenesManager from "./DetalleImagenesManager";

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
  const [orientacion, setOrientacion] = useState(obra?.orientacion ?? "");
  const [estado, setEstadoState] = useState(obra?.estado ?? "en venta");
  const [descuento, setDescuento] = useState(
    obra?.descuento_porcentaje?.toString() ?? ""
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    obra?.imagen_url ?? null
  );
  const [previewDims, setPreviewDims] = useState<{
    width: number;
    height: number;
  } | null>(
    obra?.imagen_ancho_px && obra?.imagen_alto_px
      ? { width: obra.imagen_ancho_px, height: obra.imagen_alto_px }
      : null
  );

  async function onImagenChange(file: File | null) {
    setImagenFile(file);
    if (!file) {
      setPreviewUrl(obra?.imagen_url ?? null);
      setPreviewDims(
        obra?.imagen_ancho_px && obra?.imagen_alto_px
          ? { width: obra.imagen_ancho_px, height: obra.imagen_alto_px }
          : null
      );
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    try {
      setPreviewDims(await leerDimensionesImagen(file));
    } catch {
      setPreviewDims(null);
    }
  }

  const previewNaturalEsVertical = previewDims
    ? previewDims.height > previewDims.width
    : null;

  const previewEsVertical =
    orientacion === "vertical"
      ? true
      : orientacion === "horizontal"
      ? false
      : Boolean(previewNaturalEsVertical);

  // Si se fuerza una orientación contraria a la real de la foto, hay que
  // rotarla en la previsualización para que se vea de verdad así.
  const previewNecesitaRotar =
    previewNaturalEsVertical !== null &&
    previewNaturalEsVertical !== previewEsVertical;

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
        const dimensiones = previewDims ?? (await leerDimensionesImagen(imagenFile));
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
      const descuento_porcentaje =
        estado === "oferta" && fd.get("descuento_porcentaje")
          ? Number(fd.get("descuento_porcentaje"))
          : null;

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
        descuento_porcentaje,
        lamina_precio: fd.get("lamina_precio")
          ? Number(fd.get("lamina_precio"))
          : null,
        disponible,
        destacada: fd.get("destacada") === "on",
        categoria_id: (fd.get("categoria_id") as string) || null,
        imagen_url,
        imagen_ancho_px,
        imagen_alto_px,
        orientacion: (fd.get("orientacion") as string) || null,
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
    <>
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

      <div>
        <label className="block text-sm font-medium">
          Orientación de la obra
        </label>
        <select
          name="orientacion"
          value={orientacion}
          onChange={(e) => setOrientacion(e.target.value)}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        >
          <option value="">Automática (según la foto)</option>
          <option value="horizontal">Forzar horizontal</option>
          <option value="vertical">Forzar vertical</option>
        </select>
        <p className="mt-1 text-xs text-charcoal/50">
          Solo hace falta tocarlo si la foto subida no refleja bien cómo es
          la obra en realidad (ej. una obra horizontal fotografiada con
          margen que la hace parecer cuadrada). Afecta a cómo se rota al
          verla ampliada.
        </p>

        {previewUrl && (
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-charcoal/60">
              Previsualización ({previewEsVertical ? "vertical" : "horizontal"})
              {previewNecesitaRotar && " — foto rotada para forzar esta orientación"}
            </p>
            <div
              className={`relative overflow-hidden rounded-xl border border-charcoal/10 bg-charcoal/5 ${
                previewEsVertical
                  ? "h-[213px] w-40"
                  : "h-48 w-64"
              }`}
            >
              {previewNecesitaRotar ? (
                // La foto es naturalmente lo contrario de lo forzado: se
                // rota 90º dentro del recuadro en vez de solo encajarla
                // (que dejaría márgenes vacíos sin representar bien el
                // resultado real).
                <div
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: previewEsVertical ? 213 : 192,
                    height: previewEsVertical ? 160 : 256,
                    transform: "translate(-50%, -50%) rotate(90deg)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Previsualización de la obra"
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Previsualización de la obra"
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          </div>
        )}
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
            value={estado}
            onChange={(e) => setEstadoState(e.target.value)}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          >
            <option value="en venta">En venta</option>
            <option value="no se vende">No se vende</option>
            <option value="vendido">Vendido</option>
            <option value="oferta">Oferta</option>
          </select>
        </div>
      </div>

      {estado === "oferta" && (
        <div>
          <label className="block text-sm font-medium">Descuento</label>
          <select
            name="descuento_porcentaje"
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          >
            <option value="">Sin descuento (solo etiqueta "Oferta")</option>
            <option value="5">5%</option>
            <option value="10">10%</option>
            <option value="15">15%</option>
            <option value="20">20%</option>
            <option value="30">30%</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">
          Precio de la lámina (€, opcional)
        </label>
        <input
          name="lamina_precio"
          type="number"
          step="0.01"
          min="0"
          placeholder="Ej. 25-50 · déjalo vacío para no vender lámina"
          defaultValue={obra?.lamina_precio ?? ""}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
        <p className="mt-1 text-xs text-charcoal/50">
          Si lo rellenas, en la ficha de la obra se podrá comprar también una
          copia impresa a este precio, aunque el original ya esté vendido.
        </p>
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
          onChange={(e) => onImagenChange(e.target.files?.[0] ?? null)}
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

      {obra ? (
        <div className="mt-8 max-w-2xl">
          <DetalleImagenesManager obraId={obra.id} />
        </div>
      ) : (
        <p className="mt-8 max-w-2xl text-xs text-charcoal/50">
          Guarda la obra para poder añadir fotos de detalle.
        </p>
      )}
    </>
  );
}
