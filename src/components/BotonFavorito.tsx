"use client";

import { toggleFavorito, useFavoritos } from "@/lib/favoritos";

export default function BotonFavorito({ obraId }: { obraId: string }) {
  const { esFavorito, listo } = useFavoritos();
  const favorito = listo && esFavorito(obraId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorito(obraId);
      }}
      aria-label={favorito ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={favorito}
      className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 shadow-md transition hover:scale-110 hover:bg-cream active:scale-95"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4.5 w-4.5"
        fill={favorito ? "#dc2626" : "none"}
        stroke={favorito ? "#dc2626" : "currentColor"}
        strokeWidth="1.8"
      >
        <path
          d="M12 20.5s-7.5-4.6-10-9.3C0.3 7.7 2 4 5.6 4c2 0 3.5 1.1 4.4 2.6C10.9 5.1 12.4 4 14.4 4 18 4 19.7 7.7 18 11.2c-2.5 4.7-10 9.3-10 9.3Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
