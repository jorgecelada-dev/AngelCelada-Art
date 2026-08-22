"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Categoria, Entorno, Obra } from "@/types";
import DetalleImagenesManager from "./DetalleImagenesManager";
import { COLORES_OBRA } from "@/lib/colores";
import { calcularAspectoYRotacion } from "@/lib/orientacion";
import { formatearEUR } from "@/lib/precio";

const TIPO_LABEL: Record<Entorno["tipo"], string> = {
  salon: "Salón",
  comedor: "Comedor",
  oficina: "Oficina",
  despacho: "Despacho",
};

const ESTADO_LABEL: Record<string, string> = {
  "en venta": "En venta",
  "no se vende": "No se vende",
  vendido: "Vendida",
  oferta: "En oferta",
};

function formatearCm(valor: number): string {
  return Number(valor.toFixed(2)).toString();
}

// Las fotos nuevas del artista vienen nombradas como "Titulo_37x37.jpg"
// (ancho x alto reales del cuadro, en cm, justo antes de la extensión).
// Si el nombre del archivo sigue ese patrón, se detectan solas.
function extraerMedidasDelNombre(
  nombreArchivo: string
): { ancho: number; alto: number } | null {
  const match = nombreArchivo.match(
    /(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)(?=\.\w+$)/i
  );
  if (!match) return null;
  const ancho = Number(match[1].replace(",", "."));
  const alto = Number(match[2].replace(",", "."));
  if (!ancho || !alto) return null;
  return { ancho, alto };
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

// Bloque plegable reutilizado para agrupar el formulario en secciones en
// vez de una única columna larga. Nativo (details/summary): accesible y
// sin necesitar estado propio para abrir/cerrar.
function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <details
      open
      className="group rounded-xl border border-charcoal/10 bg-white/40"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium marker:content-none">
        {titulo}
        <span className="text-charcoal/40 transition group-open:rotate-180">
          ⌄
        </span>
      </summary>
      <div className="space-y-6 border-t border-charcoal/10 px-5 py-5">
        {children}
      </div>
    </details>
  );
}

export default function ObraForm({
  categorias,
  entornos,
  obra,
}: {
  categorias: Categoria[];
  entornos?: Entorno[];
  obra?: Obra;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [entornosOcultos, setEntornosOcultos] = useState<Set<string>>(
    () => new Set(obra?.entornos_ocultos ?? [])
  );
  const [titulo, setTitulo] = useState(obra?.titulo ?? "");
  const [precio, setPrecio] = useState(obra?.precio?.toString() ?? "");
  const [anchoCm, setAnchoCm] = useState<string>(
    obra?.ancho_cm?.toString() ?? ""
  );
  const [altoCm, setAltoCm] = useState<string>(
    obra?.alto_cm?.toString() ?? ""
  );
  const [medidasDetectadas, setMedidasDetectadas] = useState(false);
  const [orientacion, setOrientacion] = useState(obra?.orientacion ?? "");
  const [estado, setEstadoState] = useState(obra?.estado ?? "en venta");
  const [descuento, setDescuento] = useState(
    obra?.descuento_porcentaje?.toString() ?? ""
  );
  const [visible, setVisible] = useState<boolean>(obra?.visible ?? true);
  const [destacada, setDestacada] = useState<boolean>(obra?.destacada ?? false);
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
    setMedidasDetectadas(false);
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

    const medidas = extraerMedidasDelNombre(file.name);
    if (medidas) {
      setAnchoCm(formatearCm(medidas.ancho));
      setAltoCm(formatearCm(medidas.alto));
      setMedidasDetectadas(true);
    }
  }

  // Misma función que usa la web pública: si hay cm reales rellenados,
  // mandan ellos sobre la orientación forzada y sobre la foto (antes esta
  // previsualización solo miraba la orientación forzada y la foto, así
  // que con obras que ya tenían cm podía verse aquí distinto de cómo
  // acaba saliendo en la web).
  const { aspecto: previewAspecto, necesitaRotarFoto: previewNecesitaRotar } =
    calcularAspectoYRotacion({
      ancho_cm: anchoCm ? Number(anchoCm) : null,
      alto_cm: altoCm ? Number(altoCm) : null,
      orientacion: (orientacion || null) as Obra["orientacion"],
      imagen_ancho_px: previewDims?.width ?? null,
      imagen_alto_px: previewDims?.height ?? null,
    });
  const previewEsVertical = previewAspecto < 1;

  // Si ya hay cm reales y no son iguales, esos mandan siempre sobre
  // "orientacion" (ver calcularAspectoYRotacion), así que rotar de verdad
  // significa intercambiar ancho y alto reales — eso además propaga el
  // giro a toda la web de golpe, porque los cm ya son la fuente de la
  // verdad en todos los sitios (mosaico, "visualiza en tu espacio",
  // ficha...). Pero una obra cuadrada (ancho = alto) sigue siendo
  // cuadrada intercambiados, así que ahí (y sin cm todavía) la única
  // forma de que la foto gire de verdad es alternar "orientacion", que
  // calcularAspectoYRotacion trata como la señal que decide para esos
  // casos.
  function rotarPreview() {
    if (anchoCm && altoCm && Number(anchoCm) !== Number(altoCm)) {
      setAnchoCm(altoCm);
      setAltoCm(anchoCm);
      setMedidasDetectadas(false);
    } else {
      setOrientacion(orientacion === "vertical" ? "horizontal" : "vertical");
    }
  }

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
        entornos_ocultos: Array.from(entornosOcultos),
        color_principal: (fd.get("color_principal") as string) || null,
        disponible,
        destacada: fd.get("destacada") === "on",
        visible,
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
      <div className="grid grid-cols-1 items-start gap-8 max-w-5xl lg:grid-cols-[1fr_320px]">
        {/* En móvil la vista previa va primero (referencia visual antes de
            rellenar); en escritorio pasa a la derecha, fija, y el
            formulario ocupa la columna principal a la izquierda. */}
        <aside className="order-1 space-y-4 lg:sticky lg:top-24 lg:order-2">
          <div className="overflow-hidden rounded-xl border border-charcoal/10 bg-white/40 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-charcoal/40">
              Previsualización
            </p>
            {previewUrl ? (
              <>
                <div
                  className={`relative mx-auto overflow-hidden rounded-xl bg-charcoal/5 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.45)] ${
                    previewEsVertical ? "h-[280px] w-[210px]" : "h-[210px] w-full"
                  }`}
                >
                  <button
                    type="button"
                    onClick={rotarPreview}
                    aria-label="Rotar la orientación de la obra"
                    title={
                      anchoCm && altoCm
                        ? "Rotar (intercambia ancho y alto reales)"
                        : "Rotar orientación"
                    }
                    className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/70 text-cream transition hover:bg-charcoal"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5">
                      <path
                        d="M20 11a8 8 0 10-2.34 6.36M20 11V5M20 11h-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {previewNecesitaRotar ? (
                    // La foto es naturalmente lo contrario de lo forzado: se
                    // rota 90º dentro del recuadro en vez de solo encajarla
                    // (que dejaría márgenes vacíos sin representar bien el
                    // resultado real).
                    <div
                      className="absolute left-1/2 top-1/2"
                      style={{
                        width: previewEsVertical ? 280 : 210,
                        height: previewEsVertical ? 210 : 280,
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
                  {/* Mapa de luces automático: simula un foco de galería
                      (realce arriba a la izquierda + leve viñeta abajo) sobre
                      cualquier imagen, sin necesidad de analizarla. */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(120% 90% at 28% 12%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 55%), radial-gradient(140% 100% at 50% 115%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 60%)",
                      mixBlendMode: "overlay",
                    }}
                  />
                </div>
                <p className="mt-2 text-center text-xs text-charcoal/50">
                  {previewEsVertical ? "Vertical" : "Horizontal"}
                  {previewNecesitaRotar && " — foto rotada para forzar esta orientación"}
                </p>
              </>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-xl bg-charcoal/5 text-xs text-charcoal/40">
                Sube una imagen para previsualizarla
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-charcoal/10 bg-white/40 p-4 text-sm">
            <p className="truncate font-medium">{titulo || "Sin título"}</p>
            <p className="text-charcoal/70">
              {precio ? formatearEUR(Number(precio)) : "Sin precio"}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="rounded-full bg-charcoal/5 px-2.5 py-1 text-xs text-charcoal/60">
                {ESTADO_LABEL[estado] ?? estado}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs ${
                  visible ? "bg-sage/15 text-sage" : "bg-charcoal/5 text-charcoal/50"
                }`}
              >
                {visible ? "Visible" : "Oculta"}
              </span>
              {destacada && (
                <span className="rounded-full bg-clay/15 px-2.5 py-1 text-xs text-clay">
                  Destacada
                </span>
              )}
            </div>
          </div>

          <Seccion titulo="Publicación">
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

            <div className="flex items-center justify-between gap-4 rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3">
              <div>
                <p className="text-sm font-medium">
                  {visible ? "Visible en la web" : "Oculta"}
                </p>
                <p className="mt-0.5 text-xs text-charcoal/50">
                  {visible
                    ? "Se muestra en el mosaico, portada, láminas y su ficha."
                    : "No aparece en ningún sitio de la web ni ocupa espacio en el mosaico, aunque esté destacada."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Ocultar obra" : "Mostrar obra"}
                aria-pressed={visible}
                className={`flex h-10 w-10 flex-none items-center justify-center rounded-full transition ${
                  visible
                    ? "bg-charcoal text-cream"
                    : "bg-charcoal/10 text-charcoal/50"
                }`}
              >
                {visible ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path
                      d="M2 12s3.5-7 10-7c1.7 0 3.15.35 4.36.9M22 12s-3.5 7-10 7c-1.7 0-3.15-.35-4.36-.9M9.9 9.9a3 3 0 104.2 4.2M4.5 4.5l15 15"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="destacada"
                form="formulario-obra"
                checked={destacada}
                onChange={(e) => setDestacada(e.target.checked)}
              />
              Mostrar en portada
            </label>
          </Seccion>

          <div>
            <button
              type="submit"
              form="formulario-obra"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Guardando…" : esEdicion ? "Guardar cambios" : "Publicar obra"}
            </button>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        </aside>

        <form
          id="formulario-obra"
          onSubmit={onSubmit}
          className="order-2 space-y-4 lg:order-1"
        >
          <Seccion titulo="Datos básicos">
            <div>
              <label className="block text-sm font-medium">Título</label>
              <input
                name="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
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
          </Seccion>

          <Seccion titulo="Medidas y orientación">
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
                  onChange={(e) => {
                    setAnchoCm(e.target.value);
                    setMedidasDetectadas(false);
                  }}
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
                  onChange={(e) => {
                    setAltoCm(e.target.value);
                    setMedidasDetectadas(false);
                  }}
                  className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
                />
              </div>
            </div>

            {medidasDetectadas && (
              <p className="-mt-2 text-xs text-sage">
                ✓ Medidas detectadas automáticamente del nombre del archivo.
              </p>
            )}

            <p className="-mt-2 text-xs text-charcoal/50">
              {anchoCm && altoCm
                ? `Se guardará como "Medidas: ${formatearCm(Number(anchoCm))} x ${formatearCm(Number(altoCm))} cm". También es lo que se usa para encajarla en "Visualiza en tu espacio".`
                : 'Rellena ambos campos a mano, o sube una foto nombrada "Titulo_ANCHOxALTO.jpg" para que se rellenen solos.'}
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
                margen que la hace parecer cuadrada). Mira la previsualización
                de la derecha para comprobar el resultado.
              </p>
            </div>
          </Seccion>

          <Seccion titulo="Precio y venta">
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
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
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
          </Seccion>

          <Seccion titulo="Visualización">
            {entornos && entornos.length > 0 && (
              <div>
                <label className="block text-sm font-medium">
                  Entornos donde se puede visualizar
                </label>
                <p className="mt-1 text-xs text-charcoal/50">
                  Desmarca los que no quieras que aparezcan para esta obra en
                  &quot;Visualiza esta obra en tu espacio&quot;.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {entornos.map((entorno) => {
                    const visibleEntorno = !entornosOcultos.has(entorno.id);
                    const repetido =
                      entornos.filter((e) => e.tipo === entorno.tipo).length > 1;
                    const indiceDelTipo =
                      entornos
                        .filter((e) => e.tipo === entorno.tipo)
                        .findIndex((e) => e.id === entorno.id) + 1;
                    return (
                      <label
                        key={entorno.id}
                        className="flex items-center gap-2 rounded-lg border border-charcoal/10 bg-white/60 px-3 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={visibleEntorno}
                          onChange={(e) => {
                            setEntornosOcultos((prev) => {
                              const siguiente = new Set(prev);
                              if (e.target.checked) {
                                siguiente.delete(entorno.id);
                              } else {
                                siguiente.add(entorno.id);
                              }
                              return siguiente;
                            });
                          }}
                        />
                        {entorno.imagen_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={entorno.imagen_url}
                            alt=""
                            className="h-8 w-10 flex-none rounded object-cover"
                          />
                        )}
                        {TIPO_LABEL[entorno.tipo]}
                        {repetido && ` #${indiceDelTipo}`}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">Color principal</label>
              <select
                name="color_principal"
                defaultValue={obra?.color_principal ?? ""}
                className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
              >
                <option value="">Sin especificar</option>
                {COLORES_OBRA.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-charcoal/50">
                Se usa para el filtro de búsqueda por color en /obras.
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
          </Seccion>

        </form>
      </div>

      {obra ? (
        <div className="mt-8 max-w-5xl">
          <DetalleImagenesManager obraId={obra.id} />
        </div>
      ) : (
        <p className="mt-8 max-w-5xl text-xs text-charcoal/50">
          Guarda la obra para poder añadir fotos de detalle.
        </p>
      )}
    </>
  );
}
