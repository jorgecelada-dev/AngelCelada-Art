"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Obra } from "@/types";
import { calcularAspectoYRotacion } from "@/lib/orientacion";
import { formatearEUR, precioFinal, tieneDescuentoActivo } from "@/lib/precio";

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

  const { aspecto, necesitaRotarFoto } = calcularAspectoYRotacion(obra);

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
    // Pequeño margen antes de cerrar: da tiempo a que el cursor llegue
    // desde la tarjeta pequeña hasta la vista ampliada sin que se cierre
    // de golpe por el hueco entre ambas.
    cierreTimeoutRef.current = window.setTimeout(() => {
      setRect(null);
      setCargada(false);
    }, 150);
  }

  const esLamina = variante === "lamina";
  const enOferta = !esLamina && obra.disponible && tieneDescuentoActivo(obra);
  const precioFormateado = esLamina
    ? `${formatearEUR(obra.lamina_precio!)} · Lámina`
    : obra.disponible
    ? formatearEUR(precioFinal(obra))
    : "No disponible";
  const mostrarVendida = !esLamina && !obra.disponible;

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        ref={cardRef}
        href={`/obras/${obra.id}`}
        className="group relative block h-full w-full overflow-hidden rounded-lg bg-charcoal/5 shadow-sm transition duration-300 hover:shadow-xl"
      >
        {obra.imagen_url ? (
          necesitaRotarFoto ? (
            // La foto es lo contrario de la proporción real del cuadro (en
            // cm): se rota 90º y se sobredimensiona centrada para que
            // siga cubriendo toda la celda del mosaico sea cual sea su
            // forma, en vez de recortarla mal o dejarla mal orientada.
            <div
              className="absolute left-1/2 top-1/2 transition-transform duration-300 group-hover:scale-105"
              style={{
                width: "300%",
                height: "300%",
                transform: "translate(-50%, -50%) rotate(90deg)",
              }}
            >
              <Image
                src={obra.imagen_url}
                alt={obra.titulo}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                quality={95}
              />
            </div>
          ) : (
            <Image
              src={obra.imagen_url}
              alt={obra.titulo}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
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
          <p className="mt-1 flex items-baseline gap-2 text-sm font-medium text-cream/90">
            {enOferta && (
              <span className="text-cream/60 line-through">
                {formatearEUR(obra.precio)}
              </span>
            )}
            {precioFormateado}
          </p>
        </div>
      </Link>

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
                className="z-50 overflow-hidden bg-charcoal/5 shadow-2xl ring-1 ring-charcoal/10"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
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
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
