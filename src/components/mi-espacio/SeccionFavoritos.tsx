"use client";

import type { ReactNode } from "react";
import type { Obra } from "@/types";
import { useFavoritos } from "@/lib/favoritos";
import ObraCard from "@/components/ObraCard";

export default function SeccionFavoritos({
  obras,
  accion,
}: {
  obras: Obra[];
  // Botón opcional (ej. "Ver en AR") junto al título "Mis favoritos" —
  // se muestra aunque todavía no haya ningún favorito marcado, para que
  // ese hueco de cabecera no desaparezca sin más.
  accion?: ReactNode;
}) {
  const { favoritos, listo } = useFavoritos();
  const obrasFavoritas = listo
    ? obras.filter((obra) => favoritos.includes(obra.id))
    : [];
  const hayFavoritos = obrasFavoritas.length > 0;

  if (!hayFavoritos && !accion) return null;

  return (
    <div className="mb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {hayFavoritos ? (
          <h2 className="section-title text-2xl">Mis favoritos</h2>
        ) : (
          <span />
        )}
        {accion}
      </div>
      {hayFavoritos && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {obrasFavoritas.map((obra) => (
            <div key={obra.id} className="aspect-square">
              <ObraCard obra={obra} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
