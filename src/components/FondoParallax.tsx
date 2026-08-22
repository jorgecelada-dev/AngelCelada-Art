"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";

// Tres SVG de "capas de papel" onduladas (generadas una vez, en
// public/img/fondo-ondas*.svg — cada una teselable en vertical sin
// costura: empieza y termina en el mismo tono crema) en distintos tonos
// cálidos de la paleta del sitio. Cada capa se desplaza a una velocidad
// distinta al hacer scroll (con Motion, en vez del requestAnimationFrame
// manual de antes) para dar sensación de profundidad real entre ellas,
// muy sutil, sin competir con las obras.
const CAPAS = [
  { src: "/img/fondo-ondas.svg", size: "1440px 760px", speed: 0.04, opacity: 1 },
  { src: "/img/fondo-ondas-b.svg", size: "1200px 900px", speed: 0.08, opacity: 0.45 },
  { src: "/img/fondo-ondas-c.svg", size: "1000px 620px", speed: 0.13, opacity: 0.35 },
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
        backgroundSize: capa.size,
        opacity: capa.opacity,
      }}
    />
  );
}

// Fondo decorativo de la portada: varias capas onduladas (tipo capas de
// papel recortado) que cubren toda la página y se desplazan a distinta
// velocidad al hacer scroll. Sin interacción, para que nunca interfiera
// con el contenido real ni con la lectura de pantalla.
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
