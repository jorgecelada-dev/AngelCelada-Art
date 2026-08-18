import type { Obra } from "@/types";

// Decide qué proporción (ancho/alto) debe mostrarse para una obra, y si
// hace falta rotar la foto para conseguirla.
//
// Prioridad: las medidas reales en cm son la fuente de verdad (si están,
// mandan siempre, ignorando incluso "orientacion"). Si no hay cm, se usa
// "orientacion" si se forzó a mano; si tampoco, la foto tal cual; si no
// hay ni foto, un valor por defecto vertical (4/5).
export function calcularAspectoYRotacion(obra: Obra) {
  const tieneCm = Boolean(obra.ancho_cm && obra.alto_cm);
  const tienePx = Boolean(obra.imagen_ancho_px && obra.imagen_alto_px);

  let aspecto: number;
  if (tieneCm) {
    aspecto = obra.ancho_cm! / obra.alto_cm!;
  } else if (obra.orientacion === "vertical") {
    aspecto = tienePx
      ? Math.min(obra.imagen_ancho_px!, obra.imagen_alto_px!) /
        Math.max(obra.imagen_ancho_px!, obra.imagen_alto_px!)
      : 3 / 4;
  } else if (obra.orientacion === "horizontal") {
    aspecto = tienePx
      ? Math.max(obra.imagen_ancho_px!, obra.imagen_alto_px!) /
        Math.min(obra.imagen_ancho_px!, obra.imagen_alto_px!)
      : 4 / 3;
  } else if (tienePx) {
    aspecto = obra.imagen_ancho_px! / obra.imagen_alto_px!;
  } else {
    aspecto = 4 / 5;
  }

  const fotoEsVertical = tienePx
    ? obra.imagen_alto_px! > obra.imagen_ancho_px!
    : null;
  const cajaEsVertical = aspecto < 1;
  const necesitaRotarFoto =
    tienePx && fotoEsVertical !== null && fotoEsVertical !== cajaEsVertical;

  return { aspecto, necesitaRotarFoto, tieneCm };
}
