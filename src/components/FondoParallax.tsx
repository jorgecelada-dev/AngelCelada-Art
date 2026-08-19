"use client";

import { useEffect, useRef } from "react";

// Capas de "papel recortado" onduladas, de atrás (clara) a delante
// (oscura), como un atardecer de tierra: crema → dorado → clay → salvia →
// carbón. Cada capa se desplaza a una velocidad distinta al hacer scroll
// para dar sensación de profundidad entre ellas.
const CAPAS = [
  {
    color: "#F1E6CC",
    speed: 0.08,
    opacidad: 0.55,
    d: "M0,280 C200,240 400,300 600,260 C800,220 1000,280 1200,250 C1350,230 1500,270 1600,255 L1600,500 L0,500 Z",
  },
  {
    color: "#D9B36B",
    speed: 0.14,
    opacidad: 0.65,
    d: "M0,320 C180,360 380,290 580,330 C780,370 980,300 1180,340 C1350,370 1500,320 1600,335 L1600,500 L0,500 Z",
  },
  {
    color: "#C97C5D",
    speed: 0.2,
    opacidad: 0.75,
    d: "M0,370 C220,410 420,330 620,375 C820,420 1020,340 1220,380 C1380,410 1500,360 1600,375 L1600,500 L0,500 Z",
  },
  {
    color: "#7C8B5E",
    speed: 0.28,
    opacidad: 0.85,
    d: "M0,410 C240,460 440,370 660,420 C880,470 1060,380 1280,425 C1420,455 1520,400 1600,415 L1600,500 L0,500 Z",
  },
  {
    color: "#2B2B28",
    speed: 0.38,
    opacidad: 0.95,
    d: "M0,450 C260,500 460,410 700,460 C900,500 1080,420 1300,465 C1440,495 1540,440 1600,455 L1600,500 L0,500 Z",
  },
] as const;

// Fondo decorativo de la portada: capas onduladas tipo "papel recortado"
// que se desplazan a distinta velocidad al hacer scroll (efecto
// parallax). Fijo al viewport y sin interacción, para que nunca
// interfiera con el contenido real ni con la lectura de pantalla.
export default function FondoParallax() {
  const capaRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const prefiereMenosMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefiereMenosMovimiento) return;

    let frame = 0;
    function actualizar() {
      const scrollY = window.scrollY;
      capaRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transform = `translate3d(0, ${scrollY * CAPAS[i].speed}px, 0)`;
      });
      frame = requestAnimationFrame(actualizar);
    }
    frame = requestAnimationFrame(actualizar);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[75%] overflow-hidden"
    >
      <svg
        viewBox="0 0 1600 500"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {CAPAS.map((capa, i) => (
          <path
            key={i}
            ref={(el) => {
              capaRefs.current[i] = el;
            }}
            d={capa.d}
            fill={capa.color}
            opacity={capa.opacidad}
            className="will-change-transform"
          />
        ))}
      </svg>
    </div>
  );
}
