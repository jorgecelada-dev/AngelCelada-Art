"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import type { Obra } from "@/types";

type Rect = { top: number; left: number; width: number; height: number };

function rectDeCard(cardRect: DOMRect): Rect {
  return {
    top: cardRect.top,
    left: cardRect.left,
    width: cardRect.width,
    height: cardRect.height,
  };
}

// El hueco expandido siempre se abre con el lado largo de la obra en
// horizontal (si la obra es vertical, se rota 90º al mostrarla ahí).
function calcularRectExpandido(
  cardRect: DOMRect,
  anchoNatural: number | null,
  altoNatural: number | null
): Rect {
  const largo = Math.max(anchoNatural ?? 4, altoNatural ?? 5);
  const corto = Math.min(anchoNatural ?? 4, altoNatural ?? 5);
  const aspecto = largo / corto;

  // Tamaño contenido para que el crecimiento se sienta cercano a la
  // tarjeta original, no un salto grande por la pantalla.
  const maxW = Math.min(window.innerWidth * 0.6, 480);
  const maxH = Math.min(window.innerHeight * 0.6, 380);

  let width = maxW;
  let height = width / aspecto;
  if (height > maxH) {
    height = maxH;
    width = height * aspecto;
  }

  const centroX = cardRect.left + cardRect.width / 2;
  const centroY = cardRect.top + cardRect.height / 2;
  const margen = 16;

  const left = Math.min(
    Math.max(centroX - width / 2, margen),
    window.innerWidth - width - margen
  );
  const top = Math.min(
    Math.max(centroY - height / 2, margen),
    window.innerHeight - height - margen
  );

  return { top, left, width, height };
}

export default function ObraCard({ obra }: { obra: Obra }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [expandido, setExpandido] = useState(false);
  const [previewCargada, setPreviewCargada] = useState(false);
  const enterTimeoutRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  function limpiarTimers() {
    if (enterTimeoutRef.current) window.clearTimeout(enterTimeoutRef.current);
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
  }

  function onMouseEnter() {
    if (!cardRef.current) return;
    limpiarTimers();
    const cardRect = cardRef.current.getBoundingClientRect();

    enterTimeoutRef.current = window.setTimeout(() => {
      // Arranca desde el tamaño/posición exactos de la tarjeta, para que
      // el crecimiento se sienta como una continuación fluida de ella.
      setRect(rectDeCard(cardRect));
      setExpandido(false);
      frameRef.current = window.requestAnimationFrame(() => {
        setRect(
          calcularRectExpandido(
            cardRect,
            obra.imagen_ancho_px,
            obra.imagen_alto_px
          )
        );
        setExpandido(true);
      });
    }, 120);
  }

  function onMouseLeave() {
    limpiarTimers();
    setRect(null);
    setExpandido(false);
    setPreviewCargada(false);
  }

  const esVertical = Boolean(
    obra.imagen_ancho_px &&
      obra.imagen_alto_px &&
      obra.imagen_alto_px > obra.imagen_ancho_px
  );

  const precioFormateado = obra.disponible
    ? new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(obra.precio)
    : "No disponible";

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        ref={cardRef}
        href={`/obras/${obra.id}`}
        className="group block overflow-hidden rounded-2xl bg-white/40 shadow-sm transition duration-300 hover:shadow-xl"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal/5">
          {obra.imagen_url ? (
            <Image
              src={obra.imagen_url}
              alt={obra.titulo}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              quality={95}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-charcoal/30">
              Sin imagen
            </div>
          )}

          {!obra.disponible && (
            <span className="absolute left-3 top-3 rounded-full bg-charcoal px-3 py-1 text-xs tracking-wide text-cream">
              Vendida
            </span>
          )}
        </div>

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
              transition:
                "top 280ms cubic-bezier(0.22,1,0.36,1), left 280ms cubic-bezier(0.22,1,0.36,1), width 280ms cubic-bezier(0.22,1,0.36,1), height 280ms cubic-bezier(0.22,1,0.36,1)",
            }}
            className="z-50 block overflow-hidden rounded-2xl bg-charcoal/5 shadow-2xl ring-1 ring-charcoal/10"
          >
            {obra.imagen_url &&
              (esVertical ? (
                // Lado largo siempre en horizontal: se renderiza la
                // imagen a sus dimensiones naturales (intercambiadas) y
                // se rota 90º, sin recortar ni perder calidad.
                <div
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: rect.height,
                    height: rect.width,
                    transform: "translate(-50%, -50%) rotate(90deg)",
                  }}
                >
                  <Image
                    src={obra.imagen_url}
                    alt={obra.titulo}
                    fill
                    className={`object-contain transition-opacity duration-300 ${
                      expandido && previewCargada ? "opacity-100" : "opacity-0"
                    }`}
                    sizes="520px"
                    quality={100}
                    onLoad={() => setPreviewCargada(true)}
                  />
                </div>
              ) : (
                <Image
                  src={obra.imagen_url}
                  alt={obra.titulo}
                  fill
                  className={`object-contain transition-opacity duration-300 ${
                    expandido && previewCargada ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="520px"
                  quality={100}
                  onLoad={() => setPreviewCargada(true)}
                />
              ))}

            {expandido && (
              <>
                <div className="absolute left-0 top-0 max-w-[80%] rounded-br-2xl bg-cream/95 px-5 py-4 shadow-md">
                  <h3 className="font-serif text-xl">{obra.titulo}</h3>
                  {obra.tecnica && (
                    <p className="mt-1 text-xs uppercase tracking-widest text-clay">
                      {obra.tecnica}
                    </p>
                  )}
                </div>

                {(obra.medidas || obra.anio) && (
                  <div className="absolute bottom-4 left-4 space-y-1 rounded-xl bg-cream/95 px-4 py-3 text-xs shadow-md">
                    {obra.medidas && (
                      <p>
                        <span className="font-medium text-charcoal">
                          Medidas:
                        </span>{" "}
                        {obra.medidas}
                      </p>
                    )}
                    {obra.anio && (
                      <p>
                        <span className="font-medium text-charcoal">
                          Año:
                        </span>{" "}
                        {obra.anio}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </Link>,
          document.body
        )}
    </div>
  );
}
