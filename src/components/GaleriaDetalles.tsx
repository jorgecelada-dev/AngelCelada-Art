import Image from "next/image";
import type { ObraDetalle } from "@/types";

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
        <div
          key={detalle.id}
          className={`animate-entrada-subida group relative overflow-hidden rounded-xl bg-charcoal/5 ${
            detalle.tamano === "1x2" ? "row-span-2 aspect-[1/2]" : "aspect-square"
          }`}
          style={{ animationDelay: `${Math.min(i, 6) * 0.07}s` }}
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
      ))}
    </div>
  );
}
