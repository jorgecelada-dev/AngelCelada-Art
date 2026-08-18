"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import type { Obra } from "@/types";
import { anchoTarjetaPx, calcularAspectoYRotacion } from "@/lib/orientacion";

type Rect = { top: number; left: number; width: number; height: number };

function calcularRectExpandido(
  cardRect: DOMRect,
  anchoNatural: number | null,
  altoNatural: number | null
): Rect {
  const aspecto =
    anchoNatural && altoNatural ? anchoNatural / altoNatural : 4 / 5;

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

export default function ObraCard({ obra }: { obra: Obra }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cargada, setCargada] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  function onMouseEnter() {
    if (!cardRef.current) return;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    const cardRect = cardRef.current.getBoundingClientRect();
    timeoutRef.current = window.setTimeout(() => {
      setRect(
        calcularRectExpandido(cardRect, obra.imagen_ancho_px, obra.imagen_alto_px)
      );
    }, 150);
  }

  function onMouseLeave() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setRect(null);
    setCargada(false);
  }

  const precioFormateado = obra.disponible
    ? new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(obra.precio)
    : "No disponible";

  const { aspecto, necesitaRotarFoto } = calcularAspectoYRotacion(obra);
  const anchoBox = anchoTarjetaPx(obra);
  const altoBox = Math.round(anchoBox / aspecto);

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ width: anchoBox, maxWidth: "100%" }}
    >
      <Link
        ref={cardRef}
        href={`/obras/${obra.id}`}
        className="block overflow-hidden rounded-2xl bg-white/40 shadow-sm transition duration-300 hover:shadow-xl"
      >
        {obra.imagen_url ? (
          <div
            className="relative w-full overflow-hidden bg-charcoal/5"
            style={{ aspectRatio: `${anchoBox} / ${altoBox}` }}
          >
            {necesitaRotarFoto ? (
              // La foto es lo contrario de la proporción real del cuadro
              // (en cm): se rota 90º para que encaje bien, en vez de
              // recortarla o dejarla mal orientada.
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  width: altoBox,
                  height: anchoBox,
                  transform: "translate(-50%, -50%) rotate(90deg)",
                }}
              >
                <Image
                  src={obra.imagen_url}
                  alt={obra.titulo}
                  fill
                  className="object-cover"
                  sizes="440px"
                  quality={95}
                />
              </div>
            ) : (
              <Image
                src={obra.imagen_url}
                alt={obra.titulo}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                quality={95}
              />
            )}
            {!obra.disponible && (
              <span className="absolute left-3 top-3 rounded-full bg-charcoal px-3 py-1 text-xs tracking-wide text-cream">
                Vendida
              </span>
            )}
          </div>
        ) : (
          <div className="relative flex aspect-[4/5] w-full items-center justify-center bg-charcoal/5 text-charcoal/30">
            Sin imagen
            {!obra.disponible && (
              <span className="absolute left-3 top-3 rounded-full bg-charcoal px-3 py-1 text-xs tracking-wide text-cream">
                Vendida
              </span>
            )}
          </div>
        )}

        <div className="p-4">
          <h3 className="font-serif text-lg">{obra.titulo}</h3>
          {obra.tecnica && (
            <p className="mt-1 text-sm text-charcoal/60">{obra.tecnica}</p>
          )}
          <p className="mt-2 text-sm font-medium text-clay">
            {precioFormateado}
          </p>
        </div>
      </Link>

      {rect &&
        obra.imagen_url &&
        typeof document !== "undefined" &&
        createPortal(
          <Link
            href={`/obras/${obra.id}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
              position: "fixed",
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
            className="z-50 block overflow-hidden rounded-2xl bg-charcoal/5 shadow-2xl ring-1 ring-charcoal/10"
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

            <div className="absolute bottom-0 left-0 right-0 bg-cream px-5 py-4">
              <h3 className="font-serif text-xl">{obra.titulo}</h3>
              <p className="mt-1 text-clay">{precioFormateado}</p>
              {obra.medidas && (
                <p className="mt-1 text-sm text-charcoal/60">
                  {obra.medidas}
                </p>
              )}
            </div>
          </Link>,
          document.body
        )}
    </div>
  );
}
