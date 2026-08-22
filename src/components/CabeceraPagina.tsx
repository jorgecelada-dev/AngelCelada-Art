import type { ReactNode } from "react";
import FondoCabecera, { type SeccionCabecera } from "./FondoCabecera";

export default function CabeceraPagina({
  titulo,
  seccion,
  pills,
}: {
  titulo: string;
  seccion: SeccionCabecera;
  pills?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden">
      <div
        className={`relative flex flex-col items-center justify-center gap-5 px-6 text-center ${
          pills ? "py-10 md:py-14" : "py-9 md:py-12"
        }`}
      >
        <FondoCabecera seccion={seccion} />
        <h1 className="relative z-10 font-serif text-2xl font-bold text-cream drop-shadow-[0_2px_16px_rgba(0,0,0,0.4)] md:text-4xl">
          <span
            className="efecto-revelado-texto"
            style={{ animationDelay: "0.15s" }}
          >
            {titulo}
          </span>
        </h1>

        {pills && (
          <div className="relative z-10 flex flex-wrap justify-center gap-2">
            {pills}
          </div>
        )}
      </div>
    </div>
  );
}
