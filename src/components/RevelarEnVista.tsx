import type { ReactNode } from "react";

const ANIMACIONES = {
  arriba: "animate-entrada-subida",
  izquierda: "animate-entrada-izquierda",
  derecha: "animate-entrada-derecha",
} as const;

// Animación de entrada por CSS puro (no Framer Motion): se aplica desde el
// primer pintado del HTML del servidor, sin depender de que React hidrate
// antes.
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
  return (
    <div
      className={`${ANIMACIONES[direccion]} ${className ?? ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
