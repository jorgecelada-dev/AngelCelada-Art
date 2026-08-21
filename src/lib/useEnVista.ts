"use client";

import { useEffect, useRef, useState } from "react";

// Detecta cuándo un elemento entra por primera vez en el viewport, para
// poder disparar su animación de entrada en ese momento en vez de nada
// más cargar la página (si no, todo lo que queda por debajo del pliegue
// ya ha terminado de animarse antes de que alguien llegue a verlo).
export function useEnVista<T extends HTMLElement>(margen = "0px 0px -10% 0px") {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      // Entorno sin soporte (muy raro hoy en día): mejor mostrarlo ya que
      // dejarlo invisible para siempre.
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: margen }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
