import Image from "next/image";
import Link from "next/link";
import type { Obra } from "@/types";

export default function ObraCard({ obra }: { obra: Obra }) {
  const precioFormateado = obra.disponible
    ? new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(obra.precio)
    : "No disponible";

  return (
    <Link
      href={`/obras/${obra.id}`}
      className="group block overflow-hidden rounded-2xl bg-white/40 shadow-sm transition duration-300 hover:shadow-xl"
    >
      {obra.imagen_url ? (
        obra.imagen_ancho_px && obra.imagen_alto_px ? (
          // Proporción real de la obra, sin recortar.
          <div className="relative w-full overflow-hidden bg-charcoal/5">
            <Image
              src={obra.imagen_url}
              alt={obra.titulo}
              width={obra.imagen_ancho_px}
              height={obra.imagen_alto_px}
              className="h-auto w-full transition duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              quality={95}
            />
            {!obra.disponible && (
              <span className="absolute left-3 top-3 rounded-full bg-charcoal px-3 py-1 text-xs tracking-wide text-cream">
                Vendida
              </span>
            )}
          </div>
        ) : (
          // Obras antiguas sin dimensiones guardadas: recorte de respaldo.
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal/5">
            <Image
              src={obra.imagen_url}
              alt={obra.titulo}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              quality={95}
            />
            {!obra.disponible && (
              <span className="absolute left-3 top-3 rounded-full bg-charcoal px-3 py-1 text-xs tracking-wide text-cream">
                Vendida
              </span>
            )}
          </div>
        )
      ) : (
        <div className="relative flex aspect-[4/5] w-full items-center justify-center bg-charcoal/5 text-charcoal/30">
          Sin imagen
          {!obra.disponible && (
            <span className="absolute left-3 top-3 rounded-full bg-charcoal px-3 py-1 text-xs tracking-wide text-cream">
              Vendida
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        <h3 className="font-serif text-lg">{obra.titulo}</h3>
        {obra.tecnica && (
          <p className="mt-1 text-sm text-charcoal/60">{obra.tecnica}</p>
        )}
        <p className="mt-2 text-sm font-medium text-clay">
          {precioFormateado}
        </p>
      </div>
    </Link>
  );
}
