"use client";

import type { ReactNode } from "react";
import { useEnVista } from "@/lib/useEnVista";

// CSS puro ligado al scroll (ver RevelarEnVista.tsx / useEnVista.ts).
export default function EntradaImagen({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, visible } = useEnVista<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`animar-al-scroll animate-entrada-izquierda ${
        visible ? "en-vista" : ""
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
