"use client";

import type { Obra } from "@/types";
import { useFavoritos } from "@/lib/favoritos";
import ObraCard from "@/components/ObraCard";

export default function SeccionFavoritos({ obras }: { obras: Obra[] }) {
  const { favoritos, listo } = useFavoritos();
  if (!listo || favoritos.length === 0) return null;

  const obrasFavoritas = obras.filter((obra) => favoritos.includes(obra.id));
  if (obrasFavoritas.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="section-title text-2xl">Mis favoritos</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {obrasFavoritas.map((obra) => (
          <div key={obra.id} className="aspect-square">
            <ObraCard obra={obra} />
          </div>
        ))}
      </div>
    </div>
  );
}
