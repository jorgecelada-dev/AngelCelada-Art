"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";

// Diez capas independientes (public/img/capa-01..10.svg), cada una UNA
// sola cinta ondulada sobre fondo transparente — no varias bandas
// metidas en un mismo SVG, para que cada una se pueda desplazar a su
// propia velocidad y el paralaje entre ellas se note de verdad al hacer
// scroll. Alturas de tesela distintas por capa para que no repitan
// todas al mismo ritmo. Velocidades bien separadas (0.02 a 0.34) para
// que el desfase entre capas sea claramente visible.
const CAPAS = [
  { src: "/img/capa-08.svg", height: 900, speed: 0.02, opacity: 0.55 },
  { src: "/img/capa-04.svg", height: 820, speed: 0.05, opacity: 0.6 },
  { src: "/img/capa-06.svg", height: 760, speed: 0.08, opacity: 0.6 },
  { src: "/img/capa-02.svg", height: 720, speed: 0.11, opacity: 0.65 },
  { src: "/img/capa-05.svg", height: 680, speed: 0.15, opacity: 0.55 },
  { src: "/img/capa-10.svg", height: 700, speed: 0.18, opacity: 0.6 },
  { src: "/img/capa-03.svg", height: 560, speed: 0.21, opacity: 0.6 },
  { src: "/img/capa-07.svg", height: 600, speed: 0.25, opacity: 0.55 },
  { src: "/img/capa-01.svg", height: 640, speed: 0.29, opacity: 0.6 },
  { src: "/img/capa-09.svg", height: 540, speed: 0.34, opacity: 0.5 },
] as const;

function Capa({
  capa,
  scrollY,
  activo,
}: {
  capa: (typeof CAPAS)[number];
  scrollY: MotionValue<number>;
  activo: boolean;
}) {
  const y = useTransform(scrollY, (v) => (activo ? v * capa.speed : 0));

  return (
    <motion.div
      className="absolute inset-x-0 -top-64 -bottom-64 will-change-transform"
      style={{
        y,
        backgroundImage: `url(${capa.src})`,
        backgroundRepeat: "repeat",
        backgroundSize: `1440px ${capa.height}px`,
        opacity: capa.opacity,
      }}
    />
  );
}

// Fondo decorativo de la portada: diez capas onduladas (tipo capas de
// papel recortado) que cubren toda la página y se desplazan cada una a
// su propia velocidad al hacer scroll, con Motion. Sin interacción,
// para que nunca interfiera con el contenido real ni con la lectura de
// pantalla.
export default function FondoParallax() {
  const prefiereMenosMovimiento = useReducedMotion();
  const { scrollY } = useScroll();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {CAPAS.map((capa) => (
        <Capa
          key={capa.src}
          capa={capa}
          scrollY={scrollY}
          activo={!prefiereMenosMovimiento}
        />
      ))}
    </div>
  );
}
