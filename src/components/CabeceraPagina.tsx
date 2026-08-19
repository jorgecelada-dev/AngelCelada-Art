import Image from "next/image";
import type { ReactNode } from "react";

export default function CabeceraPagina({
  titulo,
  imagen,
  pills,
}: {
  titulo: string;
  imagen: string;
  pills?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="relative flex h-56 items-center justify-center md:h-72">
        <Image
          src={imagen}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/25 to-charcoal/10" />
        <h1 className="relative z-10 px-6 text-center font-serif text-4xl font-bold text-cream drop-shadow-[0_2px_16px_rgba(0,0,0,0.4)] md:text-6xl">
          <span
            className="efecto-revelado-texto"
            style={{ animationDelay: "0.15s" }}
          >
            {titulo}
          </span>
        </h1>
      </div>

      {pills && (
        <div className="bg-clay/15 py-4">
          <div className="container-site flex flex-wrap justify-center gap-2">
            {pills}
          </div>
        </div>
      )}
    </div>
  );
}
