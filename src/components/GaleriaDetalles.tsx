"use client";

import { motion } from "framer-motion";
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
        <motion.div
          key={detalle.id}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
            delay: Math.min(i, 6) * 0.07,
          }}
          className={`relative overflow-hidden rounded-xl bg-charcoal/5 ${
            detalle.tamano === "1x2" ? "row-span-2 aspect-[1/2]" : "aspect-square"
          }`}
        >
          <motion.div
            className="relative h-full w-full"
            whileHover={{ scale: 1.06 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <Image
              src={detalle.imagen_url}
              alt={`Detalle de ${titulo}`}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 33vw"
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
