"use client";

import type { Obra } from "@/types";
import { calcularAspectoYRotacion } from "@/lib/orientacion";
import ObraCard from "./ObraCard";

// Clasifica cada obra en una celda del bento (1x1, 1x2, 1x3, 2x1 o 3x1)
// según su proporción real, para que el mosaico tenga variedad de
// tamaños en vez de una cuadrícula uniforme.
function claseCelda(obra: Obra): string {
  const { aspecto } = calcularAspectoYRotacion(obra);
  if (aspecto <= 0.4) return "row-span-3"; // 1x3: muy vertical
  if (aspecto <= 0.75) return "row-span-2"; // 1x2: vertical
  if (aspecto < 1.35) return ""; // 1x1: cuadrada
  if (aspecto < 2.3) return "col-span-2"; // 2x1: horizontal
  return "col-span-2 sm:col-span-3"; // 3x1: muy horizontal
}

// Alterna la dirección de entrada para que el conjunto converja, sin
// depender de en qué columna acabe cayendo cada obra (el grid nativo,
// a diferencia del reparto manual anterior, no lo sabe de antemano).
function animacionParaIndice(indice: number): string {
  const resto = indice % 3;
  if (resto === 0) return "animate-entrada-izquierda";
  if (resto === 1) return "animate-entrada-subida";
  return "animate-entrada-derecha";
}

export default function MosaicoObras({
  obras,
  variante = "obra",
}: {
  obras: Obra[];
  variante?: "obra" | "lamina";
}) {
  if (variante === "lamina") {
    // Las láminas van todas en celdas cuadradas iguales, encajadas en
    // filas de 4 (menos en pantallas pequeñas, donde se reduce a 2/3).
    return (
      <div className="grid grid-cols-2 gap-4 overflow-x-clip sm:grid-cols-3 lg:grid-cols-4">
        {obras.map((obra, i) => (
          <div
            key={obra.id}
            className={`aspect-square overflow-hidden rounded-lg ${animacionParaIndice(i)}`}
            style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}
          >
            <ObraCard obra={obra} variante="lamina" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid auto-rows-[170px] grid-cols-2 gap-4 overflow-x-clip [grid-auto-flow:dense] sm:auto-rows-[190px] sm:grid-cols-3 lg:auto-rows-[230px] lg:grid-cols-4">
      {obras.map((obra, i) => (
        <div
          key={obra.id}
          className={`overflow-hidden rounded-lg ${claseCelda(obra)} ${animacionParaIndice(i)}`}
          style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}
        >
          <ObraCard obra={obra} />
        </div>
      ))}
    </div>
  );
}
