"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  animate as animarValor,
  type PanInfo,
} from "framer-motion";
import NextImage from "next/image";
import type { Entorno, Obra } from "@/types";
import {
  dibujarCover,
  muestrearTonoAmbiente,
  dibujarSombraSuave,
  aplicarTinteAmbiente,
  FILTRO_INTEGRACION,
} from "@/lib/canvas";

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
  const [slideIndex, setSlideIndex] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  // Ref de callback en vez de useRef + useEffect: el div del carril vive
  // dentro de un AnimatePresence (mode="wait"), así que un efecto atado a
  // "loading" puede disparar antes de que ese nodo exista todavía en el
  // DOM (y no se reintenta luego, dejando trackWidth en 0 para siempre).
  // Con una ref de callback medimos justo cuando el nodo real se monta.
  const trackRef = useCallback((el: HTMLDivElement | null) => {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;
    if (!el) return;
    setTrackWidth(el.offsetWidth);
    const observer = new ResizeObserver(() => setTrackWidth(el.offsetWidth));
    observer.observe(el);
    resizeObserverRef.current = observer;
  }, []);
  // Valor de movimiento compartido entre el arrastre y la navegación por
  // flechas/puntos: si se mezcla `drag="x"` con un prop `animate={{x}}`
  // declarativo, el arrastre se queda con el control del valor y el
  // `animate` deja de aplicarse después del primer render. Con un único
  // MotionValue controlado a mano con animate() no hay ese conflicto.
  const x = useMotionValue(0);
  const filtered = useMemo(
    () => entornos.filter((entorno) => entorno.tipo === activeTab),
    [activeTab, entornos]
  );

  useEffect(() => {
    setLoading(true);
    setSlideIndex(0);
    const timer = window.setTimeout(() => setLoading(false), 180);
    return () => window.clearTimeout(timer);
  }, [activeTab, obra.id]);

  useEffect(() => {
    const controls = animarValor(x, -slideIndex * trackWidth, {
      type: "spring",
      stiffness: 300,
      damping: 32,
    });
    return () => controls.stop();
  }, [slideIndex, trackWidth, x]);

  function irASlide(indice: number) {
    setSlideIndex(Math.max(0, Math.min(indice, filtered.length - 1)));
  }

  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const umbral = trackWidth * 0.2;
    let destino = slideIndex;
    if (info.offset.x < -umbral) {
      destino = slideIndex + 1;
    } else if (info.offset.x > umbral) {
      destino = slideIndex - 1;
    }
    destino = Math.max(0, Math.min(destino, filtered.length - 1));

    if (destino === slideIndex) {
      // No cambia de índice: el arrastre ha dejado "x" a medio camino,
      // así que hay que devolverlo a mano a su posición de reposo (si
      // slideIndex sí cambia, ya lo hace el efecto de arriba).
      animarValor(x, -destino * trackWidth, {
        type: "spring",
        stiffness: 300,
        damping: 32,
      });
    } else {
      setSlideIndex(destino);
    }
  }

  if (!obra.ancho_cm || !obra.alto_cm) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-charcoal/10 bg-charcoal/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Visualiza esta obra en tu espacio</h2>
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <motion.button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              whileTap={{ scale: 0.92 }}
              className={`relative rounded-full px-3 py-1.5 text-sm transition-colors ${
                activeTab === tab.key ? "text-white" : "text-charcoal/70"
              }`}
            >
              {activeTab === tab.key && (
                <motion.span
                  layoutId="tab-activa-entorno"
                  className="absolute inset-0 rounded-full bg-charcoal"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-charcoal/10 bg-white p-3">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[280px] items-center justify-center text-sm text-charcoal/60"
            >
              Componiendo la vista…
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="vacio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[280px] items-center justify-center text-sm text-charcoal/60"
            >
              Aún no hay entornos de este tipo.
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full"
            >
              <div ref={trackRef} className="w-full overflow-hidden">
                <motion.div
                  className="flex"
                  drag={filtered.length > 1 ? "x" : false}
                  dragConstraints={{
                    left: -trackWidth * (filtered.length - 1),
                    right: 0,
                  }}
                  dragElastic={0.12}
                  dragMomentum={false}
                  onDragEnd={onDragEnd}
                  style={{ x }}
                >
                  {filtered.map((entorno) => (
                    <div
                      key={entorno.id}
                      // Nunca "100%": dentro de un flex row sin ancho
                      // propio, un hijo al 100% crea una dependencia
                      // circular con el ancestro (que a su vez depende del
                      // contenido) y algunos navegadores la "resuelven"
                      // agrandando el elemento a un tamaño absurdo.
                      style={{ width: trackWidth }}
                      className="flex-shrink-0 px-1"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-charcoal/5">
                        {entorno.imagen_url ? (
                          <NextImage
                            src={entorno.imagen_url}
                            alt={getLabel(entorno.tipo)}
                            fill
                            className="pointer-events-none object-cover"
                            sizes="(min-width: 768px) 45vw, 100vw"
                            priority
                            draggable={false}
                          />
                        ) : null}
                        <PreviewCanvas obra={obra} entorno={entorno} />
                      </div>
                      <p className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-charcoal/60">
                        {getLabel(entorno.tipo)}
                      </p>
                    </div>
                  ))}
                </motion.div>
              </div>

              {filtered.length > 1 && (
                <>
                  <motion.button
                    type="button"
                    onClick={() => irASlide(slideIndex - 1)}
                    disabled={slideIndex === 0}
                    aria-label="Entorno anterior"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-2 top-1/2 hidden h-10 w-10 -mt-5 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-md transition-opacity hover:bg-white disabled:opacity-0 md:flex"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => irASlide(slideIndex + 1)}
                    disabled={slideIndex === filtered.length - 1}
                    aria-label="Entorno siguiente"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-2 top-1/2 hidden h-10 w-10 -mt-5 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-md transition-opacity hover:bg-white disabled:opacity-0 md:flex"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>

                  <div className="mt-3 flex justify-center gap-1.5">
                    {filtered.map((entorno, i) => (
                      <button
                        key={entorno.id}
                        type="button"
                        onClick={() => irASlide(i)}
                        aria-label={`Ir al entorno ${i + 1}`}
                        className="relative h-1.5 w-5"
                      >
                        <span className="absolute inset-0 rounded-full bg-charcoal/20" />
                        {i === slideIndex && (
                          <motion.span
                            layoutId="dot-activo-entorno"
                            className="absolute inset-0 rounded-full bg-charcoal"
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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

    // Si el usuario cambia de pestaña antes de que terminen de cargar estas
    // imágenes, esta carga queda obsoleta: sin este freno, podría terminar
    // de cargar más tarde y pintar el entorno equivocado sobre el lienzo
    // (que para entonces ya muestra la pestaña recién seleccionada).
    let cancelado = false;

    const width = 600;
    const height = 450;
    canvas.width = width;
    canvas.height = height;

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

      // Color medio de la pared alrededor del hueco, muestreado ANTES de
      // dibujar el cuadro, para poder teñirlo luego con la misma luz.
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
        ctx.drawImage(img, 0, 0, obraW, obraH);
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
            setCanvasReady(true);
          };
        } else {
          setCanvasReady(true);
        }
      };
    };

    return () => {
      cancelado = true;
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
