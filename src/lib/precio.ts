const DESCUENTOS_VALIDOS = [5, 10, 15, 20, 30] as const;

export type DescuentoValido = (typeof DESCUENTOS_VALIDOS)[number];

export function tieneDescuentoActivo(obra: {
  estado?: string | null;
  descuento_porcentaje?: number | null;
}): boolean {
  return obra.estado === "oferta" && Boolean(obra.descuento_porcentaje);
}

export function precioFinal(obra: {
  precio: number;
  estado?: string | null;
  descuento_porcentaje?: number | null;
}): number {
  if (!tieneDescuentoActivo(obra)) return obra.precio;
  return Math.round(obra.precio * (1 - obra.descuento_porcentaje! / 100) * 100) / 100;
}

export function formatearEUR(valor: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(valor);
}
