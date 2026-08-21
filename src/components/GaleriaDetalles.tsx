"use client";

import Image from "next/image";
import type { ObraDetalle } from "@/types";
import { useEnVista } from "@/lib/useEnVista";

function DetalleCelda({
  detalle,
  titulo,
  delay,
}: {
  detalle: ObraDetalle;
  titulo: string;
  delay: number;
}) {
  const { ref, visible } = useEnVista<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`animar-al-scroll animate-entrada-subida group relative overflow-hidden rounded-xl bg-charcoal/5 ${
        visible ? "en-vista" : ""
      } ${detalle.tamano === "1x2" ? "row-span-2 aspect-[1/2]" : "aspect-square"}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.06]">
        <Image
          src={detalle.imagen_url}
          alt={`Detalle de ${titulo}`}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 33vw, 33vw"
        />
      </div>
    </div>
  );
}

export default function GaleriaDetalles({
  detalles,
  titulo,
}: {
  detalles: ObraDetalle[];
  titulo: string;
}) {
  return (
    <div className="mt-6 grid grid-flow-row-dense grid-cols-3 gap-2 md:gap-4">
      {detalles.map((detalle, i) => (
        <DetalleCelda
          key={detalle.id}
          detalle={detalle}
          titulo={titulo}
          delay={Math.min(i, 6) * 0.07}
        />
      ))}
    </div>
  );
}
