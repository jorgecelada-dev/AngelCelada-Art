"use client";

import type { Obra } from "@/types";
import { calcularAspectoYRotacion } from "@/lib/orientacion";
import { esObraGrande } from "@/lib/tamano";
import { useEnVista } from "@/lib/useEnVista";
import ObraCard from "./ObraCard";

export type FormaCelda = { col: 1 | 2 | 3; row: 1 | 2 | 3 };

// Clasifica cada obra en una celda del bento (1x1, 1x2, 2x1, 2x2, 1x3 o
// 3x1) según su proporción real y, para las cuadradas, su tamaño físico.
// Se exporta en forma numérica (no como clases de Tailwind) para que el
// panel de arrastrar del admin ("Mosaico") pueda recalcular el ancho
// real en columnas (2/3/4, según el tamaño de pantalla que simule) y no
// solo confiar en los breakpoints de Tailwind, que no reaccionan a un
// ancho simulado dentro del panel.
export function formaCelda(obra: Obra): FormaCelda {
  const { aspecto } = calcularAspectoYRotacion(obra);

  if (aspecto <= 0.4) return { col: 1, row: 3 }; // 1x3: muy vertical
  if (aspecto < 0.8) return { col: 1, row: 2 }; // 1x2: vertical
  if (aspecto <= 1.25) {
    // Cuadrada: solo las grandes de verdad (>100cm de lado) se agrandan
    // a 2x2, para que destaquen sin que todo lo cuadrado ocupe el doble.
    return esObraGrande(obra) ? { col: 2, row: 2 } : { col: 1, row: 1 };
  }
  if (aspecto < 2.5) return { col: 2, row: 1 }; // 2x1: horizontal
  return { col: 3, row: 1 }; // 3x1: muy horizontal
}

// Sobre una cuadrícula imaginaria de 4 columnas, para que el mosaico
// tenga variedad de tamaños en vez de ser uniforme.
export function claseCelda(obra: Obra): string {
  const { col, row } = formaCelda(obra);
  const clases: string[] = [];
  if (row === 2) clases.push("row-span-2");
  if (row === 3) clases.push("row-span-3");
  if (col === 2) clases.push("col-span-2");
  // 3 columnas de ancho: limitado a 2 en el breakpoint base (solo 2
  // columnas ahí) para no desbordar la cuadrícula.
  if (col === 3) clases.push("col-span-2 sm:col-span-3");
  return clases.join(" ");
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
  cuadrada = false,
}: {
  obras: Obra[];
  variante?: "obra" | "lamina";
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

  return (
    <div
      className="grid auto-rows-[170px] grid-cols-2 gap-4 overflow-x-clip [grid-auto-flow:dense] sm:auto-rows-[190px] sm:grid-cols-3 lg:auto-rows-[230px] lg:grid-cols-4"
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
