"use client";

import type { ReactNode } from "react";
import { useEnVista } from "@/lib/useEnVista";

const ANIMACIONES = {
  arriba: "animate-entrada-subida",
  izquierda: "animate-entrada-izquierda",
  derecha: "animate-entrada-derecha",
} as const;

// Animación de entrada por CSS puro, ligada al scroll: no se dispara
// hasta que el elemento entra en el viewport (ver useEnVista), en vez de
// nada más pintar la página. El estado oculto ya está en el CSS desde el
// primer pintado del HTML del servidor, así que no hay flash.
export default function RevelarEnVista({
  children,
  className,
  delay = 0,
  direccion = "arriba",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direccion?: keyof typeof ANIMACIONES;
}) {
  const { ref, visible } = useEnVista<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`animar-al-scroll ${ANIMACIONES[direccion]} ${
        visible ? "en-vista" : ""
      } ${className ?? ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
