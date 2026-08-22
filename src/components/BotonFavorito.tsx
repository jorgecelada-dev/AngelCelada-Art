"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toggleFavorito, useFavoritos } from "@/lib/favoritos";

export default function BotonFavorito({ obraId }: { obraId: string }) {
  const { esFavorito, listo } = useFavoritos();
  const favorito = listo && esFavorito(obraId);
  const [laten, setLaten] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const pasaAFavorito = !favorito;
        toggleFavorito(obraId);
        if (pasaAFavorito) {
          // "Palpitar" solo al marcar como favorito, no al quitarlo —
          // celebra la acción en vez de animar en los dos sentidos.
          setLaten(true);
          window.setTimeout(() => setLaten(false), 500);
        }
      }}
      aria-label={favorito ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={favorito}
      className="absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center"
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        animate={laten ? { scale: [1, 1.35, 0.9, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))" }}
      >
        <path
          d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"
          fill={favorito ? "#dc2626" : "#ffffff"}
          stroke={favorito ? "#dc2626" : "#2B2B28"}
          strokeOpacity={favorito ? 1 : 0.5}
          strokeWidth="1.3"
          strokeLinejoin="round"
          className="transition-colors duration-200"
        />
      </motion.svg>
    </button>
  );
}
