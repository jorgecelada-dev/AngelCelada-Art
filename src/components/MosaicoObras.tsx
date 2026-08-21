"use client";

import type { Obra } from "@/types";
import { calcularAspectoYRotacion } from "@/lib/orientacion";
import { useEnVista } from "@/lib/useEnVista";
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

function CeldaObra({
  obra,
  variante,
  indice,
  clasesCelda,
}: {
  obra: Obra;
  variante: "obra" | "lamina";
  indice: number;
  clasesCelda: string;
}) {
  const { ref, visible } = useEnVista<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`animar-al-scroll overflow-hidden ${animacionParaIndice(indice)} ${
        visible ? "en-vista" : ""
      } ${clasesCelda}`}
      style={{ animationDelay: `${Math.min(indice, 8) * 0.06}s` }}
    >
      <ObraCard obra={obra} variante={variante} />
    </div>
  );
}

export default function MosaicoObras({
  obras,
  variante = "obra",
  compacto = false,
  cuadrada = false,
}: {
  obras: Obra[];
  variante?: "obra" | "lamina";
  // Columnas más estrechas, para cuando el mosaico convive con un panel
  // lateral (el filtro de /obras) y hay menos ancho disponible.
  compacto?: boolean;
  // Celdas cuadradas uniformes en vez del bento de tamaños variables,
  // manteniendo la resolución de imagen igual de generosa.
  cuadrada?: boolean;
}) {
  if (variante === "lamina" || cuadrada) {
    // Celdas cuadradas iguales, encajadas en filas de 4 (menos en
    // pantallas pequeñas, donde se reduce a 2/3).
    const esLamina = variante === "lamina";
    return (
      <div className="grid grid-cols-2 gap-4 overflow-x-clip sm:grid-cols-3 lg:grid-cols-4">
        {obras.map((obra, i) => (
          <CeldaObra
            key={obra.id}
            obra={obra}
            variante={variante}
            indice={i}
            clasesCelda={`aspect-square ${esLamina ? "" : "rounded-lg"}`}
          />
        ))}
      </div>
    );
  }

  const colsClase = compacto
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <div
      className={`grid auto-rows-[170px] gap-4 overflow-x-clip [grid-auto-flow:dense] sm:auto-rows-[190px] lg:auto-rows-[230px] ${colsClase}`}
    >
      {obras.map((obra, i) => (
        <CeldaObra
          key={obra.id}
          obra={obra}
          variante={variante}
          indice={i}
          clasesCelda={`rounded-lg ${claseCelda(obra)}`}
        />
      ))}
    </div>
  );
}
