"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Entorno, Obra } from "@/types";
import {
  dibujarCover,
  muestrearTonoAmbiente,
  dibujarSombraSuave,
  aplicarTinteAmbiente,
  FILTRO_INTEGRACION,
} from "@/lib/canvas";
import { formatearEUR, precioFinal } from "@/lib/precio";

const TABS = [
  { key: "salon", label: "Salón" },
  { key: "comedor", label: "Comedor" },
  { key: "oficina", label: "Oficina" },
  { key: "despacho", label: "Despacho" },
] as const;

export default function EspacioEjemploViewer({
  entornos,
  obras,
}: {
  entornos: Entorno[];
  obras: Obra[];
}) {
  const tiposDisponibles = TABS.filter((t) =>
    entornos.some((e) => e.tipo === t.key)
  );
  const [tipo, setTipo] = useState<Entorno["tipo"] | null>(
    tiposDisponibles[0]?.key ?? null
  );
  const entornosDelTipo = useMemo(
    () => entornos.filter((e) => e.tipo === tipo),
    [entornos, tipo]
  );
  const [entornoId, setEntornoId] = useState<string | null>(
    entornosDelTipo[0]?.id ?? null
  );
  const entorno =
    entornosDelTipo.find((e) => e.id === entornoId) ?? entornosDelTipo[0];

  if (!tipo || !entorno) {
    return (
      <p className="text-sm text-charcoal/60">
        Todavía no hay espacios de ejemplo subidos. Prueba a subir tu propia
        habitación.
      </p>
    );
  }

  const obrasVisibles = obras.filter(
    (obra) => !obra.entornos_ocultos?.includes(entorno.id)
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {tiposDisponibles.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTipo(t.key);
              const primero = entornos.find((e) => e.tipo === t.key);
              setEntornoId(primero?.id ?? null);
            }}
            className={`rounded-full px-4 py-2 text-sm transition ${
              tipo === t.key
                ? "bg-charcoal text-cream"
                : "bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {entornosDelTipo.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {entornosDelTipo.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEntornoId(e.id)}
              className={`h-14 w-20 flex-none overflow-hidden rounded-lg border-2 ${
                e.id === entorno.id ? "border-clay" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={e.imagen_url ?? ""}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <CicladorObras entorno={entorno} obras={obrasVisibles} />
    </div>
  );
}

function CicladorObras({
  entorno,
  obras,
}: {
  entorno: Entorno;
  obras: Obra[];
}) {
  const [indice, setIndice] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setIndice(0);
  }, [entorno.id]);

  const obra = obras[indice] ?? null;

  useEffect(() => {
    if (!obra) return;
    setVisible(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 900;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    let cancelado = false;

    const bg = new window.Image();
    bg.crossOrigin = "anonymous";
    bg.src = entorno.imagen_url ?? "";
    bg.onload = () => {
      if (cancelado) return;
      ctx.clearRect(0, 0, width, height);
      dibujarCover(ctx, bg, 0, 0, width, height);

      const rectX = (Number(entorno.pared_x ?? 20) / 100) * width;
      const rectY = (Number(entorno.pared_y ?? 20) / 100) * height;
      const rectW = (Number(entorno.pared_ancho ?? 60) / 100) * width;
      const rectH = (Number(entorno.pared_alto ?? 60) / 100) * height;

      const escala = Number(entorno.escala_cm_por_px ?? 0.1);

      let obraW = obra.ancho_cm! / escala;
      let obraH = obra.alto_cm! / escala;

      const maxW = rectW * 0.95;
      const maxH = rectH * 0.95;
      const factorReduccion = Math.min(1, maxW / obraW, maxH / obraH);
      obraW *= factorReduccion;
      obraH *= factorReduccion;

      const minDim = 60;
      const factorMinimo = Math.max(1, minDim / Math.min(obraW, obraH));
      obraW *= factorMinimo;
      obraH *= factorMinimo;

      const offsetX = rectX + rectW / 2 - obraW / 2;
      const offsetY = rectY + rectH / 2 - obraH / 2;

      const tonoAmbiente = muestrearTonoAmbiente(
        ctx,
        offsetX,
        offsetY,
        obraW,
        obraH
      );

      dibujarSombraSuave(ctx, offsetX, offsetY, obraW, obraH);

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = obra.imagen_url ?? "";
      img.onload = () => {
        if (cancelado) return;
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.beginPath();
        ctx.rect(0, 0, obraW, obraH);
        ctx.clip();
        ctx.filter = FILTRO_INTEGRACION;
        dibujarCover(ctx, img, 0, 0, obraW, obraH);
        ctx.restore();

        aplicarTinteAmbiente(ctx, offsetX, offsetY, obraW, obraH, tonoAmbiente);

        if (entorno.overlay_luz_url) {
          const overlay = new window.Image();
          overlay.crossOrigin = "anonymous";
          overlay.src = entorno.overlay_luz_url;
          overlay.onload = () => {
            if (cancelado) return;
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.globalCompositeOperation = "multiply";
            dibujarCover(ctx, overlay, 0, 0, width, height);
            ctx.restore();
            setVisible(true);
          };
        } else {
          setVisible(true);
        }
      };
    };

    return () => {
      cancelado = true;
    };
  }, [entorno, obra]);

  if (obras.length === 0) {
    return (
      <p className="text-sm text-charcoal/60">
        Todavía no hay obras con medidas reales para mostrar aquí.
      </p>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-charcoal/5">
        <canvas
          ref={canvasRef}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        />

        <button
          type="button"
          onClick={() =>
            setIndice((i) => (i - 1 + obras.length) % obras.length)
          }
          aria-label="Obra anterior"
          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setIndice((i) => (i + 1) % obras.length)}
          aria-label="Siguiente obra"
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
        >
          ›
        </button>
      </div>

      {obra && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <div>
            <p className="font-serif text-lg">{obra.titulo}</p>
            <p className="text-charcoal/60">{obra.medidas}</p>
          </div>
          <p className="font-medium text-clay">
            {formatearEUR(precioFinal(obra))}
          </p>
        </div>
      )}
    </div>
  );
}
