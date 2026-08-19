"use client";

import { useEffect, useRef } from "react";

// Capas de distintos tonos de beige con líneas finas transversales
// (repeating-linear-gradient, así se garantiza que teselan sin costuras
// sea cual sea la altura de la página) más algún velo de degradado suave.
// Cada capa se desplaza a una velocidad ligeramente distinta al hacer
// scroll, muy sutil, para dar sensación de profundidad entre ellas sin
// distraer del contenido.
const CAPAS = [
  {
    speed: 0.02,
    background:
      "radial-gradient(55% 45% at 15% 8%, rgba(241,230,204,0.55), transparent 70%), " +
      "radial-gradient(45% 40% at 90% 15%, rgba(237,228,211,0.45), transparent 70%), " +
      "repeating-linear-gradient(122deg, rgba(224,211,181,0.28) 0px, rgba(224,211,181,0.28) 2px, transparent 2px, transparent 42px)",
  },
  {
    speed: 0.045,
    background:
      "repeating-linear-gradient(58deg, rgba(214,198,163,0.26) 0px, rgba(214,198,163,0.26) 2px, transparent 2px, transparent 58px)",
  },
  {
    speed: 0.07,
    background:
      "radial-gradient(50% 40% at 80% 70%, rgba(199,180,140,0.4), transparent 70%), " +
      "radial-gradient(40% 35% at 10% 85%, rgba(184,161,121,0.35), transparent 70%), " +
      "repeating-linear-gradient(148deg, rgba(163,143,104,0.22) 0px, rgba(163,143,104,0.22) 2px, transparent 2px, transparent 70px)",
  },
] as const;

// Fondo decorativo de la portada: varias capas de tonos beige con líneas
// finas transversales que cubren toda la página y se desplazan a
// distinta velocidad (muy sutil) al hacer scroll. Sin interacción, para
// que nunca interfiera con el contenido real ni con la lectura de
// pantalla.
export default function FondoParallax() {
  const capaRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {CAPAS.map((capa, i) => (
        <div
          key={i}
          ref={(el) => {
            capaRefs.current[i] = el;
          }}
          className="absolute inset-x-0 -top-40 -bottom-40 will-change-transform"
          style={{ background: capa.background }}
        />
      ))}
    </div>
  );
}
