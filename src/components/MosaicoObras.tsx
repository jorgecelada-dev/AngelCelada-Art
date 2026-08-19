"use client";

import { useMemo } from "react";
import type { Obra } from "@/types";
import { calcularAspectoYRotacion } from "@/lib/orientacion";
import ObraCard from "./ObraCard";

// Reparte las obras en N columnas de ancho igual, añadiendo siempre la
// siguiente obra a la columna que hasta ahora quede más "baja" (según su
// proporción real). Así cada columna se apila de forma independiente y no
// quedan huecos grandes en blanco, a diferencia de una fila con alturas
// distintas.
function distribuirEnColumnas(obras: Obra[], numColumnas: number): Obra[][] {
  const columnas: Obra[][] = Array.from({ length: numColumnas }, () => []);
  const alturas = new Array(numColumnas).fill(0);

  for (const obra of obras) {
    const { aspecto } = calcularAspectoYRotacion(obra);
    const alturaRelativa = 1 / aspecto;

    let idxMenor = 0;
    for (let i = 1; i < numColumnas; i++) {
      if (alturas[i] < alturas[idxMenor]) idxMenor = i;
    }

    columnas[idxMenor].push(obra);
    alturas[idxMenor] += alturaRelativa;
  }

  return columnas;
}

// Las columnas de los extremos entran desde su lado más cercano y
// convergen hacia el centro; en una sola columna (móvil) alterna
// izquierda/derecha obra a obra para el mismo efecto de conjunto.
function animacionParaColumna(indiceColumna: number, numColumnas: number): string {
  if (numColumnas === 1) return "";
  if (indiceColumna === 0) return "animate-entrada-izquierda";
  if (indiceColumna === numColumnas - 1) return "animate-entrada-derecha";
  return "animate-entrada-subida";
}

function Columnas({
  columnas,
  className,
  orden,
  variante,
}: {
  columnas: Obra[][];
  className: string;
  orden: Map<string, number>;
  variante: "obra" | "lamina";
}) {
  const numColumnas = columnas.length;

  return (
    <div className={`gap-8 overflow-x-clip ${className}`}>
      {columnas.map((columna, i) => (
        <div key={i} className="flex flex-1 flex-col gap-8">
          {columna.map((obra) => {
            const indice = orden.get(obra.id) ?? 0;
            const animacion =
              numColumnas === 1
                ? indice % 2 === 0
                  ? "animate-entrada-izquierda"
                  : "animate-entrada-derecha"
                : animacionParaColumna(i, numColumnas);

            return (
              <div
                key={obra.id}
                className={animacion}
                style={{ animationDelay: `${Math.min(indice, 8) * 0.06}s` }}
              >
                <ObraCard obra={obra} variante={variante} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function MosaicoObras({
  obras,
  variante = "obra",
}: {
  obras: Obra[];
  variante?: "obra" | "lamina";
}) {
  const col1 = useMemo(() => distribuirEnColumnas(obras, 1), [obras]);
  const col2 = useMemo(() => distribuirEnColumnas(obras, 2), [obras]);
  const col3 = useMemo(() => distribuirEnColumnas(obras, 3), [obras]);
  const orden = useMemo(
    () => new Map(obras.map((obra, i) => [obra.id, i])),
    [obras]
  );

  return (
    <>
      <Columnas columnas={col1} className="flex sm:hidden" orden={orden} variante={variante} />
      <Columnas columnas={col2} className="hidden sm:flex lg:hidden" orden={orden} variante={variante} />
      <Columnas columnas={col3} className="hidden lg:flex" orden={orden} variante={variante} />
    </>
  );
}
