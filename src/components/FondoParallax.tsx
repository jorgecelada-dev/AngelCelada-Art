"use client";

import { useEffect, useRef } from "react";

const MANCHAS = [
  { color: "#C97C5D", speed: 0.12, top: "-5%", left: "-8%", size: 520 },
  { color: "#7C8B5E", speed: 0.28, top: "35%", right: "-12%", size: 580 },
  { color: "#B08D57", speed: 0.08, top: "70%", left: "0%", size: 440 },
  { color: "#7C8B5E", speed: 0.2, top: "10%", right: "20%", size: 300 },
] as const;

// Fondo decorativo con manchas orgánicas que se desplazan a distinta
// velocidad que el contenido al hacer scroll (efecto parallax). Fijo al
// viewport y sin interacción, para que nunca interfiera con el contenido
// real ni con la lectura de pantalla.
export default function FondoParallax() {
  const capaRef = useRef<HTMLDivElement>(null);
  const manchaRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefiereMenosMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefiereMenosMovimiento) return;

    let frame = 0;
    function actualizar() {
      const scrollY = window.scrollY;
      manchaRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transform = `translate3d(0, ${scrollY * MANCHAS[i].speed}px, 0)`;
      });
      frame = requestAnimationFrame(actualizar);
    }
    frame = requestAnimationFrame(actualizar);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={capaRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {MANCHAS.map((mancha, i) => (
        <div
          key={i}
          ref={(el) => {
            manchaRefs.current[i] = el;
          }}
          className="absolute rounded-full opacity-[0.32] blur-2xl will-change-transform"
          style={{
            top: mancha.top,
            left: "left" in mancha ? mancha.left : undefined,
            right: "right" in mancha ? mancha.right : undefined,
            width: mancha.size,
            height: mancha.size,
            background: mancha.color,
          }}
        />
      ))}
    </div>
  );
}
