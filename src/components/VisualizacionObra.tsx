"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import NextImage from "next/image";
import type { Entorno, Obra } from "@/types";
import { dibujarCover } from "@/lib/canvas";

const TABS = [
  { key: "salon", label: "Salón" },
  { key: "comedor", label: "Comedor" },
  { key: "oficina", label: "Oficina" },
  { key: "despacho", label: "Despacho" },
] as const;

function getLabel(tipo: Entorno["tipo"]) {
  return TABS.find((tab) => tab.key === tipo)?.label ?? tipo;
}

export default function VisualizacionObra({
  obra,
  entornos,
}: {
  obra: Obra;
  entornos: Entorno[];
}) {
  const [activeTab, setActiveTab] = useState<Entorno["tipo"]>("salon");
  const [loading, setLoading] = useState(true);
  const filtered = useMemo(
    () => entornos.filter((entorno) => entorno.tipo === activeTab),
    [activeTab, entornos]
  );

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 180);
    return () => window.clearTimeout(timer);
  }, [activeTab, obra.id]);

  if (!obra.ancho_cm || !obra.alto_cm) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-charcoal/10 bg-charcoal/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Visualiza esta obra en tu espacio</h2>
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                activeTab === tab.key
                  ? "bg-charcoal text-white"
                  : "bg-white text-charcoal/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-charcoal/10 bg-white p-3">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center text-sm text-charcoal/60">
            Componiendo la vista…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center text-sm text-charcoal/60">
            Aún no hay entornos de este tipo.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filtered.map((entorno) => (
              <div
                key={entorno.id}
                className="min-w-[240px] flex-1 rounded-xl border border-charcoal/10 p-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-charcoal/5">
                  {entorno.imagen_url ? (
                    <NextImage
                      src={entorno.imagen_url}
                      alt={getLabel(entorno.tipo)}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  ) : null}
                  <PreviewCanvas obra={obra} entorno={entorno} />
                </div>
                <p className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-charcoal/60">
                  {getLabel(entorno.tipo)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewCanvas({
  obra,
  entorno,
}: {
  obra: Obra;
  entorno: Entorno;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    setCanvasReady(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 600;
    const height = 450;
    canvas.width = width;
    canvas.height = height;

    const bg = new window.Image();
    bg.src = entorno.imagen_url ?? "";
    bg.onload = () => {
      ctx.clearRect(0, 0, width, height);
      dibujarCover(ctx, bg, 0, 0, width, height);

      const rectX = (Number(entorno.pared_x ?? 20) / 100) * width;
      const rectY = (Number(entorno.pared_y ?? 20) / 100) * height;
      const rectW = (Number(entorno.pared_ancho ?? 60) / 100) * width;
      const rectH = (Number(entorno.pared_alto ?? 60) / 100) * height;

      const scale = Number(entorno.escala_cm_por_px ?? 0.1);

      // Tamaño "real" del cuadro sobre el lienzo, a la escala del entorno.
      let obraW = obra.ancho_cm! / scale;
      let obraH = obra.alto_cm! / scale;

      // Si se sale de la pared, se reduce manteniendo su proporción real
      // (nunca se estira ni se deforma por eje independiente).
      const maxW = rectW * 0.95;
      const maxH = rectH * 0.95;
      const factorReduccion = Math.min(1, maxW / obraW, maxH / obraH);
      obraW *= factorReduccion;
      obraH *= factorReduccion;

      // Si queda demasiado pequeño para verse, se agranda igual de
      // proporcionalmente hasta un mínimo visible.
      const minDim = 50;
      const factorMinimo = Math.max(1, minDim / Math.min(obraW, obraH));
      obraW *= factorMinimo;
      obraH *= factorMinimo;

      const offsetX = rectX + rectW / 2 - obraW / 2;
      const offsetY = rectY + rectH / 2 - obraH / 2;

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 10;
      ctx.translate(offsetX, offsetY);
      ctx.rect(0, 0, obraW, obraH);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fill();
      ctx.restore();

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = obra.imagen_url ?? "";
      img.onload = () => {
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.18)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 8;
        ctx.translate(offsetX, offsetY);
        ctx.beginPath();
        ctx.rect(0, 0, obraW, obraH);
        ctx.clip();
        ctx.drawImage(img, 0, 0, obraW, obraH);
        ctx.restore();

        if (entorno.overlay_luz_url) {
          const overlay = new window.Image();
          overlay.src = entorno.overlay_luz_url;
          overlay.onload = () => {
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.globalCompositeOperation = "multiply";
            dibujarCover(ctx, overlay, 0, 0, width, height);
            ctx.restore();
            setCanvasReady(true);
          };
        } else {
          setCanvasReady(true);
        }
      };
    };

    return () => {
      setCanvasReady(false);
    };
  }, [entorno, obra]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${canvasReady ? "opacity-100" : "opacity-0"}`}
      style={{ pointerEvents: "none" }}
    />
  );
}
