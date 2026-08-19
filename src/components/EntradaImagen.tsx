import type { ReactNode } from "react";

// CSS puro (ver RevelarEnVista.tsx): se aplica desde el primer pintado.
export default function EntradaImagen({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`animate-entrada-izquierda ${className ?? ""}`}>
      {children}
    </div>
  );
}
