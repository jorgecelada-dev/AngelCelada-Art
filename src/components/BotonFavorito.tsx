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
      className="absolute bottom-2 right-2 z-10 h-9 w-9 transition hover:scale-110 active:scale-95"
      style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))" }}
    >
      {/* Burbuja tipo "me gusta" con un corazón dentro, en vez de un
          simple contorno de corazón — mismo lenguaje visual que las
          reacciones de redes sociales. */}
      <svg viewBox="0 0 24 24" className="h-full w-full">
        <path
          d="M6.5 3h11A3.5 3.5 0 0 1 21 6.5v6A3.5 3.5 0 0 1 17.5 16H10l-3.8 4v-4h-.2A3.5 3.5 0 0 1 2.5 12.5v-6A3.5 3.5 0 0 1 6.5 3Z"
          fill={favorito ? "#dc2626" : "#F5F1E8"}
          stroke={favorito ? "#dc2626" : "#2B2B28"}
          strokeOpacity={favorito ? 1 : 0.3}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M11.75 11.9s-3.1-1.85-4.1-3.65C7 7.1 7.6 5.6 9.1 5.6c.85 0 1.55.45 1.9 1.15.35-.7 1.05-1.15 1.9-1.15 1.5 0 2.1 1.5 1.45 2.65-1 1.8-4.1 3.65-4.1 3.65Z"
          fill={favorito ? "#F5F1E8" : "none"}
          stroke={favorito ? "none" : "#2B2B28"}
          strokeOpacity={favorito ? 1 : 0.55}
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
