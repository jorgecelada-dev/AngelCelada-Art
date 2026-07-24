import Image from "next/image";
import Link from "next/link";
import type { Obra } from "@/types";

export default function ObraCard({ obra }: { obra: Obra }) {
  return (
    <Link
      href={`/obras/${obra.id}`}
      className="group block overflow-hidden rounded-2xl bg-white/40 shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal/5">
        {obra.imagen_url ? (
          <Image
            src={obra.imagen_url}
            alt={obra.titulo}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-charcoal/30">
            Sin imagen
          </div>
        )}

        {!obra.disponible && (
          <span className="absolute left-3 top-3 rounded-full bg-charcoal px-3 py-1 text-xs tracking-wide text-cream">
            Vendida
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-serif text-lg">{obra.titulo}</h3>
        {obra.tecnica && (
          <p className="mt-1 text-sm text-charcoal/60">{obra.tecnica}</p>
        )}
        <p className="mt-2 text-sm font-medium text-clay">
          {obra.disponible
            ? new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(obra.precio)
            : "No disponible"}
        </p>
      </div>
    </Link>
  );
}
