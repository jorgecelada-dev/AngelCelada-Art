import type { ReactNode } from "react";

// CSS puro (ver RevelarEnVista.tsx): evita el flash de contenido visible
// antes de que React hidrate.
export default function EntradaImagen({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`animate-entrada-suave ${className ?? ""}`}>
      {children}
    </div>
  );
}
