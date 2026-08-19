import type { ReactNode } from "react";

// Animación de entrada por CSS puro (no Framer Motion): se aplica desde el
// primer pintado del HTML del servidor, sin depender de que React hidrate
// antes. Con motion/whileInView, el HTML servido no incluye el estado
// "oculto" inicial, así que el contenido se veía completo un instante,
// desaparecía de golpe al hidratar y recién ahí empezaba a animar.
export default function RevelarEnVista({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`animate-entrada-subida ${className ?? ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
