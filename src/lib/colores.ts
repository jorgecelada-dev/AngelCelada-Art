export const COLORES_OBRA = [
  { valor: "tierra", label: "Tierra / ocre", swatch: "#B08D57" },
  { valor: "rojo", label: "Rojo", swatch: "#B33A2E" },
  { valor: "naranja", label: "Naranja", swatch: "#D97B3F" },
  { valor: "amarillo", label: "Amarillo", swatch: "#D9B23F" },
  { valor: "verde", label: "Verde", swatch: "#7C8B5E" },
  { valor: "azul", label: "Azul", swatch: "#4C6E8C" },
  { valor: "blanco_gris", label: "Blanco / gris", swatch: "#C9C4B8" },
  { valor: "negro", label: "Negro", swatch: "#2B2B28" },
] as const;

export type ColorObra = (typeof COLORES_OBRA)[number]["valor"];

export function etiquetaColor(valor: string | null): string | null {
  return COLORES_OBRA.find((c) => c.valor === valor)?.label ?? null;
}
