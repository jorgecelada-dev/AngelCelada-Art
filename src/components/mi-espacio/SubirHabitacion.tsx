"use client";

import { useRef, useState } from "react";
import type { Obra } from "@/types";
import { OBJETOS_REFERENCIA } from "@/lib/referencias";
import EspacioObraViewer from "./EspacioObraViewer";

type Punto = { xPct: number; yPct: number };

type Paso = "guia" | "calibrar" | "posicionar" | "viendo";

export default function SubirHabitacion({ obras }: { obras: Obra[] }) {
  const [paso, setPaso] = useState<Paso>("guia");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoDims, setFotoDims] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const [puntoA, setPuntoA] = useState<Punto | null>(null);
  const [puntoB, setPuntoB] = useState<Punto | null>(null);
  const [punteroActual, setPunteroActual] = useState<Punto | null>(null);
  const [referenciaLabel, setReferenciaLabel] = useState<string>(
    OBJETOS_REFERENCIA[0].label
  );
  const [longitudReal, setLongitudReal] = useState(
    String(OBJETOS_REFERENCIA[0].cm ?? "")
  );
  const [cmPorPxNatural, setCmPorPxNatural] = useState<number | null>(null);

  const [centro, setCentro] = useState<Punto>({ xPct: 50, yPct: 50 });
  const arrastrando = useRef(false);

  function onSeleccionArchivo(file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setFotoDims({ width: img.naturalWidth, height: img.naturalHeight });
      setFotoUrl(url);
      setPaso("calibrar");
    };
    img.src = url;
  }

  function puntoDesdeEvento(e: React.MouseEvent<HTMLDivElement>): Punto | null {
    if (!previewRef.current) return null;
    const rect = previewRef.current.getBoundingClientRect();
    return {
      xPct: ((e.clientX - rect.left) / rect.width) * 100,
      yPct: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }

  function onClickCalibrar(e: React.MouseEvent<HTMLDivElement>) {
    const punto = puntoDesdeEvento(e);
    if (!punto) return;
    if (!puntoA || (puntoA && puntoB)) {
      setPuntoA(punto);
      setPuntoB(null);
    } else {
      setPuntoB(punto);
    }
  }

  function onMoverEnCalibracion(e: React.MouseEvent<HTMLDivElement>) {
    if (!puntoA || puntoB) return;
    setPunteroActual(puntoDesdeEvento(e));
  }

  function aplicarCalibracion() {
    if (!puntoA || !puntoB || !longitudReal || !fotoDims) return;
    const cm = Number(longitudReal);
    if (!cm || cm <= 0) return;

    // Distancia entre los dos puntos convertida a píxeles naturales de la
    // foto (independiente del tamaño en pantalla de la previsualización).
    const dxNatural = ((puntoB.xPct - puntoA.xPct) / 100) * fotoDims.width;
    const dyNatural = ((puntoB.yPct - puntoA.yPct) / 100) * fotoDims.height;
    const distanciaNatural = Math.sqrt(dxNatural ** 2 + dyNatural ** 2);
    if (distanciaNatural <= 0) return;

    setCmPorPxNatural(cm / distanciaNatural);
    setPaso("posicionar");
  }

  function onPointerDownCuadro(e: React.PointerEvent) {
    arrastrando.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMoveCuadro(e: React.PointerEvent) {
    if (!arrastrando.current || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const xPct = Math.min(
      Math.max(((e.clientX - rect.left) / rect.width) * 100, 5),
      95
    );
    const yPct = Math.min(
      Math.max(((e.clientY - rect.top) / rect.height) * 100, 5),
      95
    );
    setCentro({ xPct, yPct });
  }

  function onPointerUpCuadro(e: React.PointerEvent) {
    arrastrando.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  if (paso === "guia") {
    return (
      <div className="max-w-xl">
        <h3 className="mb-3 text-lg font-medium">Antes de subir la foto</h3>
        <ul className="mb-6 space-y-2 text-sm text-charcoal/70">
          <li>• Haz la foto de frente a la pared, no en ángulo.</li>
          <li>
            • Deja el espacio donde quieres ver los cuadros libre de otros
            objetos.
          </li>
          <li>
            • Con buena luz y toda la pared visible, de esquina a esquina si
            puedes.
          </li>
        </ul>
        <label className="btn-primary inline-block cursor-pointer">
          Elegir foto
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onSeleccionArchivo(e.target.files?.[0] ?? null)}
          />
        </label>
        <p className="mt-3 text-xs text-charcoal/40">
          La foto no se sube a ningún sitio, se queda solo en tu navegador.
        </p>
      </div>
    );
  }

  if (!fotoUrl || !fotoDims) return null;

  if (paso === "calibrar") {
    return (
      <div className="max-w-xl">
        <h3 className="mb-2 text-lg font-medium">Calibra el tamaño real</h3>

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
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-3 py-2"
        >
          {OBJETOS_REFERENCIA.map((o) => (
            <option key={o.label} value={o.label}>
              {o.label}
              {o.cm ? ` (${o.cm} cm)` : ""}
            </option>
          ))}
        </select>
        <p className="mb-4 mt-2 text-sm text-charcoal/70">
          Ahora haz clic en los dos extremos de ese objeto en tu foto, lo más
          pegado posible a sus bordes.
        </p>

        <div
          ref={previewRef}
          onClick={onClickCalibrar}
          onMouseMove={onMoverEnCalibracion}
          className="relative w-full cursor-crosshair overflow-hidden rounded-2xl bg-charcoal/5"
          style={{ aspectRatio: `${fotoDims.width} / ${fotoDims.height}` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoUrl}
            alt="Tu foto"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {puntoA && (
            <span
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-clay shadow"
              style={{ left: `${puntoA.xPct}%`, top: `${puntoA.yPct}%` }}
            />
          )}
          {puntoB && (
            <span
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-clay shadow"
              style={{ left: `${puntoB.xPct}%`, top: `${puntoB.yPct}%` }}
            />
          )}
          {/* Línea guía en vivo mientras se busca el segundo punto, para
              apuntar con precisión al borde exacto del objeto. */}
          {puntoA && !puntoB && punteroActual && (
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
          {puntoA && puntoB && (
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

        {puntoA && puntoB && (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-medium">
                ¿Cuánto mide en la realidad (cm)?
              </label>
              <input
                type="number"
                autoFocus
                value={longitudReal}
                onChange={(e) => setLongitudReal(e.target.value)}
                placeholder="80"
                className="mt-1 w-32 rounded-lg border border-charcoal/20 bg-white/60 px-3 py-2"
              />
            </div>
            <button
              type="button"
              onClick={aplicarCalibracion}
              disabled={!longitudReal}
              className="btn-primary text-sm"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    );
  }

  if (paso === "posicionar") {
    return (
      <div className="max-w-xl">
        <h3 className="mb-2 text-lg font-medium">
          Marca dónde quieres el cuadro
        </h3>
        <p className="mb-4 text-sm text-charcoal/70">
          Arrastra el recuadro a la zona de la pared donde quieres ver las
          obras.
        </p>
        <div
          ref={previewRef}
          className="relative w-full touch-none overflow-hidden rounded-2xl bg-charcoal/5"
          style={{ aspectRatio: `${fotoDims.width} / ${fotoDims.height}` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoUrl}
            alt="Tu foto"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            onPointerDown={onPointerDownCuadro}
            onPointerMove={onPointerMoveCuadro}
            onPointerUp={onPointerUpCuadro}
            className="absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-lg border-2 border-dashed border-clay bg-clay/20"
            style={{ left: `${centro.xPct}%`, top: `${centro.yPct}%` }}
          />
        </div>
        <button
          type="button"
          onClick={() => setPaso("viendo")}
          className="btn-primary mt-4 text-sm"
        >
          Ver mis cuadros ahí
        </button>
      </div>
    );
  }

  if (paso === "viendo" && cmPorPxNatural) {
    return (
      <EspacioObraViewer
        fotoUrl={fotoUrl}
        fotoAnchoNatural={fotoDims.width}
        fotoAltoNatural={fotoDims.height}
        centroXPct={centro.xPct}
        centroYPct={centro.yPct}
        cmPorPxNatural={cmPorPxNatural}
        obras={obras}
      />
    );
  }

  return null;
}
