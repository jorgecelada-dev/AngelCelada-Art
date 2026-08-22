import type { Obra } from "@/types";

// Corte entre obra "grande" y el resto, en cm del lado mayor. Se usa
// tanto en el filtro de tamaño de /obras como para decidir qué obras
// cuadradas se agrandan a 2x2 en el mosaico.
export const UMBRAL_GRANDE_CM = 100;

export function esObraGrande(obra: Obra): boolean {
  if (!obra.ancho_cm || !obra.alto_cm) return false;
  return Math.max(obra.ancho_cm, obra.alto_cm) > UMBRAL_GRANDE_CM;
}
