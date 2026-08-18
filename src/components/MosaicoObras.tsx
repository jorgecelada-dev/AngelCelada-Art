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

function Columnas({
  columnas,
  className,
}: {
  columnas: Obra[][];
  className: string;
}) {
  return (
    <div className={`gap-8 ${className}`}>
      {columnas.map((columna, i) => (
        <div key={i} className="flex flex-1 flex-col gap-8">
          {columna.map((obra) => (
            <ObraCard key={obra.id} obra={obra} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function MosaicoObras({ obras }: { obras: Obra[] }) {
  const col1 = useMemo(() => distribuirEnColumnas(obras, 1), [obras]);
  const col2 = useMemo(() => distribuirEnColumnas(obras, 2), [obras]);
  const col3 = useMemo(() => distribuirEnColumnas(obras, 3), [obras]);

  return (
    <>
      <Columnas columnas={col1} className="flex sm:hidden" />
      <Columnas columnas={col2} className="hidden sm:flex lg:hidden" />
      <Columnas columnas={col3} className="hidden lg:flex" />
    </>
  );
}
