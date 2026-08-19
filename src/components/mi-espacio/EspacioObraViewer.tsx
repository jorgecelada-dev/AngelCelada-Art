"use client";

import { useEffect, useState } from "react";
import type { Obra } from "@/types";
import { calcularAspectoYRotacion } from "@/lib/orientacion";
import { formatearEUR, precioFinal } from "@/lib/precio";

export default function EspacioObraViewer({
  fotoUrl,
  fotoAnchoNatural,
  fotoAltoNatural,
  centroXPct,
  centroYPct,
  cmPorPxNatural,
  obras,
}: {
  fotoUrl: string;
  fotoAnchoNatural: number;
  fotoAltoNatural: number;
  centroXPct: number;
  centroYPct: number;
  cmPorPxNatural: number;
  obras: Obra[];
}) {
  const [indice, setIndice] = useState(0);
  const [visible, setVisible] = useState(true);

  function cambiar(nuevo: number) {
    setVisible(false);
    window.setTimeout(() => {
      setIndice(nuevo);
      setVisible(true);
    }, 220);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") cambiar((indice + 1) % obras.length);
      if (e.key === "ArrowLeft") cambiar((indice - 1 + obras.length) % obras.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, obras.length]);

  if (obras.length === 0) {
    return (
      <p className="text-sm text-charcoal/60">
        Todavía no hay obras con medidas reales publicadas para probar aquí.
      </p>
    );
  }

  const obra = obras[indice];
  const { aspecto, necesitaRotarFoto } = calcularAspectoYRotacion(obra);

  // Tamaño real de la obra convertido a % del ancho/alto de la foto.
  const anchoNaturalPx = obra.ancho_cm! / cmPorPxNatural;
  const altoNaturalPx = obra.alto_cm! / cmPorPxNatural;
  const anchoPct = (anchoNaturalPx / fotoAnchoNatural) * 100;
  const altoPct = (altoNaturalPx / fotoAltoNatural) * 100;

  return (
    <div>
      <div
        className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-charcoal/5"
        style={{ aspectRatio: `${fotoAnchoNatural} / ${fotoAltoNatural}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotoUrl}
          alt="Tu espacio"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {obra.imagen_url && (
          <div
            className={`absolute overflow-hidden shadow-xl transition-opacity duration-200 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${centroXPct - anchoPct / 2}%`,
              top: `${centroYPct - altoPct / 2}%`,
              width: `${anchoPct}%`,
              height: `${altoPct}%`,
            }}
          >
            {necesitaRotarFoto ? (
              // El div padre (arriba) ya tiene el tamaño real correcto
              // (anchoPct x altoPct). Este hijo, antes de rotar, debe medir
              // lo mismo pero con los ejes intercambiados — en % relativos
              // a SU padre, eso es (1/aspecto) y aspecto respectivamente,
              // no los mismos anchoPct/altoPct (que están en otra base).
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  width: `${(1 / aspecto) * 100}%`,
                  height: `${aspecto * 100}%`,
                  transform: "translate(-50%, -50%) rotate(90deg)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={obra.imagen_url}
                  alt={obra.titulo}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={obra.imagen_url}
                alt={obra.titulo}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => cambiar((indice - 1 + obras.length) % obras.length)}
          aria-label="Obra anterior"
          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => cambiar((indice + 1) % obras.length)}
          aria-label="Siguiente obra"
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
        >
          ›
        </button>
      </div>

      <div className="mx-auto mt-3 flex w-full max-w-2xl items-center justify-between text-sm">
        <div>
          <p className="font-serif text-lg">{obra.titulo}</p>
          <p className="text-charcoal/60">{obra.medidas}</p>
        </div>
        <p className="font-medium text-clay">
          {formatearEUR(precioFinal(obra))}
        </p>
      </div>
      <p className="mt-1 text-center text-xs text-charcoal/40">
        {indice + 1} / {obras.length} · usa las flechas del teclado o los
        botones
      </p>
    </div>
  );
}
