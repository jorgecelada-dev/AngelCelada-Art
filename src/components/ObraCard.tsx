"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Obra } from "@/types";
import { calcularAspectoYRotacion } from "@/lib/orientacion";
import { formatearEUR, precioFinal, tieneDescuentoActivo } from "@/lib/precio";
import BotonFavorito from "./BotonFavorito";

type Rect = { top: number; left: number; width: number; height: number };

function calcularRectExpandido(cardRect: DOMRect, aspecto: number): Rect {
  // Crece de forma clara respecto al tamaño actual de la tarjeta en
  // pantalla (el mosaico ya puede tener tarjetas grandes de por sí).
  const ladoMayorActual = Math.max(cardRect.width, cardRect.height);
  let width = Math.max(ladoMayorActual * 1.5, 380);
  let height = width / aspecto;

  const maxW = Math.min(window.innerWidth * 0.85, 780);
  const maxH = Math.min(window.innerHeight * 0.8, 780);
  if (width > maxW) {
    width = maxW;
    height = width / aspecto;
  }
  if (height > maxH) {
    height = maxH;
    width = height * aspecto;
  }

  const left = Math.max(
    Math.min(window.innerWidth / 2 - width / 2, window.innerWidth - width - 16),
    16
  );
  const top = Math.max(
    Math.min(window.innerHeight / 2 - height / 2, window.innerHeight - height - 16),
    16
  );

  return { top, left, width, height };
}

export default function ObraCard({
  obra,
  variante = "obra",
}: {
  obra: Obra;
  variante?: "obra" | "lamina";
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cargada, setCargada] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const cierreTimeoutRef = useRef<number | null>(null);
  const [tamanoCelda, setTamanoCelda] = useState<{ w: number; h: number } | null>(null);

  const { aspecto, necesitaRotarFoto } = calcularAspectoYRotacion(obra);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !necesitaRotarFoto) return;
    // Para rotar la foto y que cubra toda la celda hace falta saber su
    // forma real en píxeles: en celdas no cuadradas (2x1, 1x2 del bento),
    // un simple recuadro sobredimensionado y rotado no vale, porque al
    // rotar una caja no cuadrada su encaje cambia y la imagen queda
    // recortada de más (efecto "zoom" excesivo).
    const actualizar = () => setTamanoCelda({ w: el.offsetWidth, h: el.offsetHeight });
    actualizar();
    const observer = new ResizeObserver(actualizar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [necesitaRotarFoto]);

  function onMouseEnter() {
    if (cierreTimeoutRef.current) {
      window.clearTimeout(cierreTimeoutRef.current);
      cierreTimeoutRef.current = null;
    }
    if (!cardRef.current) return;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    const cardRect = cardRef.current.getBoundingClientRect();
    timeoutRef.current = window.setTimeout(() => {
      // Misma proporción real (cm) que la tarjeta, para que la vista
      // ampliada no "desencaje" respecto a lo que se ve antes de pasar
      // el ratón.
      setRect(calcularRectExpandido(cardRect, aspecto));
    }, 150);
  }

  function onMouseLeave() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (cierreTimeoutRef.current) window.clearTimeout(cierreTimeoutRef.current);
    // La vista ampliada no seguía el ratón: solo depende de si el ratón
    // sigue sobre la tarjeta pequeña (no tiene sus propios
    // onMouseEnter/onMouseLeave), así que este margen es solo para
    // evitar parpadeos si el cursor sale y vuelve a entrar muy rápido.
    cierreTimeoutRef.current = window.setTimeout(() => {
      setRect(null);
      setCargada(false);
    }, 100);
  }

  const esLamina = variante === "lamina";
  const enOferta = !esLamina && obra.disponible && tieneDescuentoActivo(obra);
  const precioFormateado = esLamina
    ? `${formatearEUR(obra.lamina_precio!)} · Lámina`
    : obra.disponible
    ? formatearEUR(precioFinal(obra))
    : "No disponible";
  const mostrarVendida = !esLamina && !obra.disponible;
  const tieneAr = Boolean(obra.modelo_ar_glb_url && obra.modelo_ar_usdz_url);

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        ref={cardRef}
        href={`/obras/${obra.id}`}
        className={`group relative block h-full w-full overflow-hidden bg-charcoal/5 shadow-sm transition duration-300 hover:shadow-xl ${
          esLamina ? "" : "rounded-lg"
        }`}
      >
        {obra.imagen_url ? (
          necesitaRotarFoto ? (
            // La foto es lo contrario de la proporción real del cuadro (en
            // cm): se rota 90º dentro de un recuadro con el ancho y el
            // alto de la celda intercambiados (esa es la clave: al rotar,
            // esas dimensiones se intercambian de vuelta y encajan exacto
            // en la celda real, sea cuadrada, 2x1 o 1x2).
            tamanoCelda && (
              <div
                className="absolute left-1/2 top-1/2 transition-transform duration-300 group-hover:scale-105"
                style={{
                  width: tamanoCelda.h,
                  height: tamanoCelda.w,
                  transform: "translate(-50%, -50%) rotate(90deg)",
                }}
              >
                <Image
                  src={obra.imagen_url}
                  alt={obra.titulo}
                  fill
                  className="object-cover"
                  sizes="1400px"
                  quality={95}
                />
              </div>
            )
          ) : (
            <Image
              src={obra.imagen_url}
              alt={obra.titulo}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              // Algunas celdas del mosaico ocupan el doble de ancho (2x1),
              // así que se pide bastante más resolución de la que ocuparía
              // una celda de una sola columna para que no se pixelen.
              sizes="(min-width: 1024px) 50vw, (min-width: 640px) 66vw, 100vw"
              quality={95}
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-charcoal/30">
            Sin imagen
          </div>
        )}

        {mostrarVendida && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-charcoal px-3 py-1 text-xs tracking-wide text-cream">
            Vendida
          </span>
        )}
        {enOferta && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-clay px-3 py-1 text-xs font-medium tracking-wide text-cream">
            -{obra.descuento_porcentaje}%
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/85 via-charcoal/35 to-transparent p-4 pt-12">
          <h3 className="font-serif text-cream">{obra.titulo}</h3>
          {esLamina ? (
            <p className="mt-1 flex items-baseline gap-2 text-sm font-medium text-cream/90">
              {enOferta && (
                <span className="text-cream/60 line-through">
                  {formatearEUR(obra.precio)}
                </span>
              )}
              {precioFormateado}
            </p>
          ) : (
            obra.medidas && (
              <p className="mt-1 text-sm font-medium text-cream/90">
                {obra.medidas}
              </p>
            )
          )}
        </div>
      </Link>

      {!esLamina && <BotonFavorito obraId={obra.id} />}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {rect && obra.imagen_url && (
              <motion.div
                key="hover-expandido"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                }}
                className="pointer-events-none z-50 overflow-hidden bg-charcoal/5 shadow-2xl ring-1 ring-charcoal/10"
              >
                <Link href={`/obras/${obra.id}`} className="block h-full w-full">
                  {necesitaRotarFoto ? (
                    // Misma proporción real que la tarjeta: si hace falta rotar
                    // ahí, también hace falta rotar aquí.
                    <div
                      className="absolute left-1/2 top-1/2"
                      style={{
                        width: `${(1 / aspecto) * 100}%`,
                        height: `${aspecto * 100}%`,
                        transform: "translate(-50%, -50%) rotate(90deg)",
                      }}
                    >
                      <Image
                        src={obra.imagen_url}
                        alt={obra.titulo}
                        fill
                        className={`object-contain transition-opacity duration-200 ${
                          cargada ? "opacity-100" : "opacity-0"
                        }`}
                        sizes="780px"
                        quality={100}
                        onLoad={() => setCargada(true)}
                      />
                    </div>
                  ) : (
                    <Image
                      src={obra.imagen_url}
                      alt={obra.titulo}
                      fill
                      className={`object-contain transition-opacity duration-200 ${
                        cargada ? "opacity-100" : "opacity-0"
                      }`}
                      sizes="780px"
                      quality={100}
                      onLoad={() => setCargada(true)}
                    />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-cream px-5 py-4">
                    <h3 className="font-serif text-xl">{obra.titulo}</h3>
                    <p className="mt-1 flex items-baseline gap-2 text-clay">
                      {enOferta && (
                        <span className="text-charcoal/40 line-through">
                          {formatearEUR(obra.precio)}
                        </span>
                      )}
                      {precioFormateado}
                    </p>
                    {obra.medidas && (
                      <p className="mt-1 text-sm text-charcoal/60">
                        {obra.medidas}
                      </p>
                    )}
                  </div>
                </Link>

                {tieneAr && !esLamina && (
                  <Link
                    href={`/mi-espacio?ar=${obra.id}`}
                    className="pointer-events-auto absolute right-4 top-4 z-10 rounded-full bg-cream/95 px-3 py-1.5 text-xs font-medium tracking-wide text-charcoal shadow-md transition hover:bg-cream"
                  >
                    Ver en AR
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
