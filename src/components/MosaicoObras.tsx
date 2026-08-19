"use client";

import type { Obra } from "@/types";
import { calcularAspectoYRotacion } from "@/lib/orientacion";
import ObraCard from "./ObraCard";

// Clasifica cada obra en una celda del bento (1x1, 1x2 o 2x1) según su
// proporción real, sobre una cuadrícula imaginaria de 4 columnas, para
// que el mosaico tenga variedad de tamaños en vez de ser uniforme.
function claseCelda(obra: Obra): string {
  const { aspecto } = calcularAspectoYRotacion(obra);
  if (aspecto < 0.8) return "row-span-2"; // 1x2: vertical
  if (aspecto <= 1.25) return ""; // 1x1: cuadrada
  return "col-span-2"; // 2x1: horizontal
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
  compacto = false,
}: {
  obras: Obra[];
  variante?: "obra" | "lamina";
  // Columnas más estrechas, para cuando el mosaico convive con un panel
  // lateral (el filtro de /obras) y hay menos ancho disponible.
  compacto?: boolean;
}) {
  if (variante === "lamina") {
    // Las láminas van todas en celdas cuadradas iguales, encajadas en
    // filas de 4 (menos en pantallas pequeñas, donde se reduce a 2/3).
    return (
      <div className="grid grid-cols-2 gap-4 overflow-x-clip sm:grid-cols-3 lg:grid-cols-4">
        {obras.map((obra, i) => (
          <div
            key={obra.id}
            className={`aspect-square overflow-hidden ${animacionParaIndice(i)}`}
            style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}
          >
            <ObraCard obra={obra} variante="lamina" />
          </div>
        ))}
      </div>
    );
  }

  const colsClase = compacto
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <div
      className={`grid auto-rows-[170px] gap-4 overflow-x-clip [grid-auto-flow:dense] sm:auto-rows-[190px] lg:auto-rows-[230px] ${colsClase}`}
    >
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
