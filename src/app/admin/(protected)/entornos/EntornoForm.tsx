"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Entorno } from "@/types";
import { OBJETOS_REFERENCIA } from "@/lib/referencias";

// El PreviewCanvas público dibuja siempre sobre un lienzo lógico de
// 600x450 (ver VisualizacionObra.tsx), así que la escala cm/px se debe
// calibrar en ese mismo espacio, no en los píxeles reales de la foto
// subida ni en el tamaño en pantalla de esta previsualización. Como esta
// previsualización mantiene la misma proporción 4:3, convertir % del
// contenedor a píxeles de ese lienzo es una simple regla de tres por eje.
const CANVAS_LOGICO_ANCHO = 600;
const CANVAS_LOGICO_ALTO = 450;

// Misma cuenta exacta que hace PreviewCanvas en la web pública (ver
// VisualizacionObra.tsx): el cuadro se centra dentro del rectángulo de
// pared, a su tamaño real según la escala, reducido si no cabe en el 95%
// del rectángulo y agrandado si quedaría demasiado pequeño para verse.
// Replicarla aquí permite previsualizar en vivo cómo quedaría una obra
// real, en vez de tener que adivinarlo o probarlo en la ficha pública.
function calcularCajaMuestra(params: {
  paredX: number;
  paredY: number;
  paredAncho: number;
  paredAlto: number;
  escalaCmPorPx: number;
  anchoObraCm: number;
  altoObraCm: number;
}) {
  const width = CANVAS_LOGICO_ANCHO;
  const height = CANVAS_LOGICO_ALTO;
  const rectX = (params.paredX / 100) * width;
  const rectY = (params.paredY / 100) * height;
  const rectW = (params.paredAncho / 100) * width;
  const rectH = (params.paredAlto / 100) * height;

  if (!params.escalaCmPorPx || !params.anchoObraCm || !params.altoObraCm) {
    return null;
  }

  let obraW = params.anchoObraCm / params.escalaCmPorPx;
  let obraH = params.altoObraCm / params.escalaCmPorPx;

  const maxW = rectW * 0.95;
  const maxH = rectH * 0.95;
  const factorReduccion = Math.min(1, maxW / obraW, maxH / obraH);
  obraW *= factorReduccion;
  obraH *= factorReduccion;

  const minDim = 50;
  const factorMinimo = Math.max(1, minDim / Math.min(obraW, obraH));
  obraW *= factorMinimo;
  obraH *= factorMinimo;

  const offsetX = rectX + rectW / 2 - obraW / 2;
  const offsetY = rectY + rectH / 2 - obraH / 2;

  return {
    leftPct: (offsetX / width) * 100,
    topPct: (offsetY / height) * 100,
    widthPct: (obraW / width) * 100,
    heightPct: (obraH / height) * 100,
    fueReducida: factorReduccion < 1,
    fueAgrandada: factorMinimo > 1,
  };
}

type Punto = { xPct: number; yPct: number };

const TIPOS = [
  { key: "salon", label: "Salón" },
  { key: "comedor", label: "Comedor" },
  { key: "oficina", label: "Oficina" },
  { key: "despacho", label: "Despacho" },
] as const;

export default function EntornoForm({ entorno }: { entorno?: Entorno }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);

  const [paredX, setParedX] = useState(entorno?.pared_x ?? 20);
  const [paredY, setParedY] = useState(entorno?.pared_y ?? 20);
  const [paredAncho, setParedAncho] = useState(entorno?.pared_ancho ?? 60);
  const [paredAlto, setParedAlto] = useState(entorno?.pared_alto ?? 60);
  const [escalaCmPorPx, setEscalaCmPorPx] = useState(
    entorno?.escala_cm_por_px ?? 0.1
  );

  // Obra "de prueba" solo para la vista previa: no se guarda, es para ver
  // en vivo si un cuadro de ese tamaño quedaría bien con la pared y la
  // escala configuradas.
  const [muestraAncho, setMuestraAncho] = useState(80);
  const [muestraAlto, setMuestraAlto] = useState(100);

  const cajaMuestra = useMemo(
    () =>
      calcularCajaMuestra({
        paredX,
        paredY,
        paredAncho,
        paredAlto,
        escalaCmPorPx,
        anchoObraCm: muestraAncho,
        altoObraCm: muestraAlto,
      }),
    [paredX, paredY, paredAncho, paredAlto, escalaCmPorPx, muestraAncho, muestraAlto]
  );

  const previewRef = useRef<HTMLDivElement>(null);
  const [calibrando, setCalibrando] = useState(false);
  const [puntoA, setPuntoA] = useState<Punto | null>(null);
  const [puntoB, setPuntoB] = useState<Punto | null>(null);
  const [punteroActual, setPunteroActual] = useState<Punto | null>(null);
  const [referenciaLabel, setReferenciaLabel] = useState<string>(
    OBJETOS_REFERENCIA[0].label
  );
  const [longitudReal, setLongitudReal] = useState(
    String(OBJETOS_REFERENCIA[0].cm ?? "")
  );

  function puntoDesdeEvento(e: React.MouseEvent<HTMLDivElement>): Punto | null {
    if (!previewRef.current) return null;
    const rect = previewRef.current.getBoundingClientRect();
    return {
      xPct: ((e.clientX - rect.left) / rect.width) * 100,
      yPct: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }

  function onClickPreview(e: React.MouseEvent<HTMLDivElement>) {
    if (!calibrando) return;
    const punto = puntoDesdeEvento(e);
    if (!punto) return;

    if (!puntoA || (puntoA && puntoB)) {
      setPuntoA(punto);
      setPuntoB(null);
    } else {
      setPuntoB(punto);
    }
  }

  function onMoverPreview(e: React.MouseEvent<HTMLDivElement>) {
    if (!calibrando || !puntoA || puntoB) return;
    setPunteroActual(puntoDesdeEvento(e));
  }

  function aplicarCalibracion() {
    if (!puntoA || !puntoB || !longitudReal) return;
    const cm = Number(longitudReal);
    if (!cm || cm <= 0) return;

    // Distancia entre los dos puntos convertida al espacio lógico del
    // canvas público (600x450), cada eje con su propia escala.
    const dxCanvas = ((puntoB.xPct - puntoA.xPct) / 100) * CANVAS_LOGICO_ANCHO;
    const dyCanvas = ((puntoB.yPct - puntoA.yPct) / 100) * CANVAS_LOGICO_ALTO;
    const distanciaPxCanvas = Math.sqrt(dxCanvas ** 2 + dyCanvas ** 2);

    if (distanciaPxCanvas <= 0) return;

    setEscalaCmPorPx(Number((cm / distanciaPxCanvas).toFixed(4)));
    setCalibrando(false);
    setPuntoA(null);
    setPuntoB(null);
    setLongitudReal("");
  }

  const esEdicion = Boolean(entorno);

  const previewUrl = useMemo(() => {
    if (imagenFile) return URL.createObjectURL(imagenFile);
    return entorno?.imagen_url ?? null;
  }, [imagenFile, entorno?.imagen_url]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      let imagen_url = entorno?.imagen_url ?? null;
      let overlay_luz_url = entorno?.overlay_luz_url ?? null;

      if (imagenFile) {
        const nombreArchivo = `entornos/${Date.now()}-${imagenFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("obras")
          .upload(nombreArchivo, imagenFile);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("obras").getPublicUrl(nombreArchivo);
        imagen_url = publicUrl;
      }

      if (overlayFile) {
        const nombreArchivo = `entornos/overlay-${Date.now()}-${overlayFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("obras")
          .upload(nombreArchivo, overlayFile);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("obras").getPublicUrl(nombreArchivo);
        overlay_luz_url = publicUrl;
      }

      const payload = {
        tipo: fd.get("tipo") as string,
        orden: fd.get("orden") ? Number(fd.get("orden")) : 0,
        pared_x: Number(fd.get("pared_x")),
        pared_y: Number(fd.get("pared_y")),
        pared_ancho: Number(fd.get("pared_ancho")),
        pared_alto: Number(fd.get("pared_alto")),
        escala_cm_por_px: escalaCmPorPx,
        imagen_url,
        overlay_luz_url,
      };

      if (esEdicion && entorno) {
        const { error: updateError } = await supabase
          .from("entornos")
          .update(payload)
          .eq("id", entorno.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("entornos")
          .insert(payload);
        if (insertError) throw insertError;
      }

      router.push("/admin/entornos");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo guardar el entorno. Revisa los datos e inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Tipo de espacio</label>
          <select
            name="tipo"
            defaultValue={entorno?.tipo ?? "salon"}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          >
            {TIPOS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Orden</label>
          <input
            name="orden"
            type="number"
            defaultValue={entorno?.orden ?? 0}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Foto del espacio {esEdicion && "(deja vacío para mantener la actual)"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagenFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">
          Marca todo el hueco de pared disponible (no el tamaño del cuadro)
        </p>
        <p className="mb-2 text-xs text-charcoal/60">
          El rectángulo naranja debe cubrir toda la zona de pared libre
          donde podría colgarse algo — no el tamaño de una obra en
          concreto. El cuadro real se centra dentro y se dibuja a su
          tamaño verdadero según la escala; si el rectángulo queda más
          pequeño que el cuadro, este se encoge para caber y deja de verse
          a su tamaño real. El recuadro blanco de abajo es una obra de
          prueba para comprobarlo en vivo.
        </p>
        <div
          ref={previewRef}
          onClick={onClickPreview}
          onMouseMove={onMoverPreview}
          className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-charcoal/10 bg-charcoal/5 ${
            calibrando ? "cursor-crosshair" : ""
          }`}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Previsualización del entorno"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-charcoal/40">
              Sube una foto para previsualizar
            </div>
          )}
          {!calibrando && (
            <div
              className="absolute border-2 border-clay bg-clay/20"
              style={{
                left: `${paredX}%`,
                top: `${paredY}%`,
                width: `${paredAncho}%`,
                height: `${paredAlto}%`,
              }}
            />
          )}

          {!calibrando && cajaMuestra && (
            <div
              className="absolute flex items-center justify-center border-2 border-dashed border-white bg-white/40 text-center text-[10px] font-medium leading-tight text-charcoal shadow"
              style={{
                left: `${cajaMuestra.leftPct}%`,
                top: `${cajaMuestra.topPct}%`,
                width: `${cajaMuestra.widthPct}%`,
                height: `${cajaMuestra.heightPct}%`,
              }}
            >
              {muestraAncho}×{muestraAlto}
            </div>
          )}

          {calibrando && puntoA && (
            <span
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-clay shadow"
              style={{ left: `${puntoA.xPct}%`, top: `${puntoA.yPct}%` }}
            />
          )}
          {calibrando && puntoB && (
            <span
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-clay shadow"
              style={{ left: `${puntoB.xPct}%`, top: `${puntoB.yPct}%` }}
            />
          )}
          {calibrando && puntoA && !puntoB && punteroActual && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              <line
                x1={`${puntoA.xPct}%`}
                y1={`${puntoA.yPct}%`}
                x2={`${punteroActual.xPct}%`}
                y2={`${punteroActual.yPct}%`}
                stroke="#C97C5D"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            </svg>
          )}
          {calibrando && puntoA && puntoB && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              <line
                x1={`${puntoA.xPct}%`}
                y1={`${puntoA.yPct}%`}
                x2={`${puntoB.xPct}%`}
                y2={`${puntoB.yPct}%`}
                stroke="#C97C5D"
                strokeWidth={2}
              />
            </svg>
          )}
        </div>

        <div className="mt-3 rounded-lg border border-charcoal/10 bg-white/60 p-3">
          <p className="mb-2 text-sm font-medium">
            Obra de prueba (solo para esta vista previa, no se guarda)
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-charcoal/60">
                Ancho (cm)
              </label>
              <input
                type="number"
                value={muestraAncho}
                onChange={(e) => setMuestraAncho(Number(e.target.value))}
                className="mt-1 w-24 rounded-lg border border-charcoal/20 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-charcoal/60">
                Alto (cm)
              </label>
              <input
                type="number"
                value={muestraAlto}
                onChange={(e) => setMuestraAlto(Number(e.target.value))}
                className="mt-1 w-24 rounded-lg border border-charcoal/20 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
          {cajaMuestra?.fueReducida && (
            <p className="mt-2 text-xs text-clay">
              ⚠ El rectángulo de pared es más pequeño que esta obra a su
              tamaño real: se está encogiendo para caber. Agranda el
              rectángulo si quieres que se vea a su tamaño verdadero.
            </p>
          )}
          {cajaMuestra?.fueAgrandada && (
            <p className="mt-2 text-xs text-charcoal/60">
              A esta escala, una obra de {muestraAncho}×{muestraAlto} cm
              quedaría demasiado pequeña para verse bien, así que se
              agranda un poco por debajo de su tamaño real.
            </p>
          )}
        </div>

        <div className="mt-3 rounded-lg border border-charcoal/10 bg-white/60 p-3">
          {!calibrando ? (
            <button
              type="button"
              onClick={() => {
                setCalibrando(true);
                setPuntoA(null);
                setPuntoB(null);
              }}
              className="btn-secondary text-sm"
              disabled={!previewUrl}
            >
              📏 Calibrar escala con un objeto conocido
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">
                  ¿Qué vas a medir en la foto?
                </label>
                <select
                  value={referenciaLabel}
                  onChange={(e) => {
                    const ref = OBJETOS_REFERENCIA.find(
                      (o) => o.label === e.target.value
                    );
                    setReferenciaLabel(e.target.value);
                    if (ref?.cm) setLongitudReal(String(ref.cm));
                    setPuntoA(null);
                    setPuntoB(null);
                  }}
                  className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white px-3 py-2 text-sm"
                >
                  {OBJETOS_REFERENCIA.map((o) => (
                    <option key={o.label} value={o.label}>
                      {o.label}
                      {o.cm ? ` (${o.cm} cm)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {!puntoB ? (
                <p className="text-sm text-charcoal/70">
                  Haz clic en los dos extremos de ese objeto en la foto, lo
                  más pegado posible a sus bordes.{" "}
                  <button
                    type="button"
                    onClick={() => setCalibrando(false)}
                    className="underline"
                  >
                    Cancelar
                  </button>
                </p>
              ) : (
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="block text-sm font-medium">
                      ¿Cuánto mide en la realidad (cm)?
                    </label>
                    <input
                      type="number"
                      autoFocus
                      value={longitudReal}
                      onChange={(e) => setLongitudReal(e.target.value)}
                      placeholder="200"
                      className="mt-1 w-32 rounded-lg border border-charcoal/20 bg-white/60 px-3 py-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={aplicarCalibracion}
                    disabled={!longitudReal}
                    className="btn-primary text-sm"
                  >
                    Aplicar
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalibrando(false)}
                    className="text-sm underline"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">
            Posición X de la pared (%)
          </label>
          <input
            name="pared_x"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={paredX}
            onChange={(e) => setParedX(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Posición Y de la pared (%)
          </label>
          <input
            name="pared_y"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={paredY}
            onChange={(e) => setParedY(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">
            Ancho de la pared (%)
          </label>
          <input
            name="pared_ancho"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={paredAncho}
            onChange={(e) => setParedAncho(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Alto de la pared (%)
          </label>
          <input
            name="pared_alto"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={paredAlto}
            onChange={(e) => setParedAlto(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Escala (cm reales por píxel)
        </label>
        <input
          name="escala_cm_por_px"
          type="number"
          step="0.0001"
          value={escalaCmPorPx}
          onChange={(e) => setEscalaCmPorPx(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
        <p className="mt-1 text-xs text-charcoal/50">
          Se rellena sola al usar &ldquo;Calibrar escala&rdquo; arriba. Si
          prefieres ponerla a mano: mide en la foto, en píxeles, el ancho de
          un objeto del que sepas la medida real (por ejemplo un sofá de 200
          cm) y divide su tamaño real en cm entre esa medida en píxeles.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Overlay de luz (opcional
          {esEdicion && ", deja vacío para mantener el actual"})
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setOverlayFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
        <p className="mt-1 text-xs text-charcoal/50">
          Imagen opcional con sombras/luz de la habitación que se superpone
          sobre la obra para integrarla mejor visualmente.
        </p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Guardando…" : esEdicion ? "Guardar cambios" : "Añadir entorno"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
