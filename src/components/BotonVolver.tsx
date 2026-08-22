"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Botón de "volver" para móvil, en la parte alta de páginas de detalle
// (como la ficha de una obra) a las que se llega desde un listado. Usa
// el mismo lenguaje de icono animado que el menú hamburguesa del
// Navbar (palitos que giran para formar una figura), aquí formando un
// "‹" en vez de una X, con una pequeña animación de entrada.
export default function BotonVolver({ volverA = "/obras" }: { volverA?: string }) {
  const router = useRouter();

  function volver() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(volverA);
    }
  }

  return (
    <motion.button
      type="button"
      onClick={volver}
      aria-label="Volver"
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.85 }}
      className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 shadow-sm ring-1 ring-charcoal/10 md:hidden"
    >
      <span className="relative block h-3 w-3">
        <motion.span
          initial={{ rotate: 0, y: -4 }}
          animate={{ rotate: -45, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute left-0 top-1/2 h-0.5 w-3 origin-left -translate-y-1/2 bg-charcoal"
        />
        <motion.span
          initial={{ rotate: 0, y: 4 }}
          animate={{ rotate: 45, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute left-0 top-1/2 h-0.5 w-3 origin-left -translate-y-1/2 bg-charcoal"
        />
      </span>
    </motion.button>
  );
}
