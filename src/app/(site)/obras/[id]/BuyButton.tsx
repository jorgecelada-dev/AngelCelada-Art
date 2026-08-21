"use client";

import { useEffect, useRef, useState } from "react";
import { formatearEUR, precioFinal } from "@/lib/precio";

type ObraParaCompra = {
  id: string;
  precio: number;
  estado?: string | null;
  descuento_porcentaje?: number | null;
  disponible: boolean;
  lamina_precio: number | null;
};

export default function BuyButton({ obra }: { obra: ObraParaCompra }) {
  const hayLamina = Boolean(obra.lamina_precio);
  const [tipo, setTipo] = useState<"original" | "lamina">(
    obra.disponible ? "original" : "lamina"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botonOriginalVisible, setBotonOriginalVisible] = useState(true);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // La ficha de obra puede ser larga (visualización en el espacio,
  // detalles, descripción); mientras el botón de compra original está
  // fuera de pantalla, se muestra una versión fija abajo para no obligar
  // a volver arriba para comprar.
  useEffect(() => {
    const el = contenedorRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entrada]) => setBotonOriginalVisible(entrada.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  async function comprar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obraId: obra.id, tipo }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "No se pudo iniciar el pago");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ha ocurrido un error inesperado"
      );
      setLoading(false);
    }
  }

  const precioActual =
    tipo === "lamina" ? obra.lamina_precio! : precioFinal(obra);
  const etiquetaTipo = tipo === "lamina" ? "Lámina" : "Original";
  const textoBoton = loading
    ? "Redirigiendo…"
    : tipo === "lamina"
    ? "Comprar lámina"
    : "Comprar esta obra";

  return (
    <>
      <div ref={contenedorRef}>
        {hayLamina && (
          <div className="mb-4 inline-flex rounded-full border border-charcoal/15 p-1 text-sm">
            {obra.disponible && (
              <button
                type="button"
                onClick={() => setTipo("original")}
                className={`rounded-full px-4 py-2 transition ${
                  tipo === "original"
                    ? "bg-charcoal text-cream"
                    : "text-charcoal/70 hover:text-charcoal"
                }`}
              >
                Original · {formatearEUR(precioFinal(obra))}
              </button>
            )}
            <button
              type="button"
              onClick={() => setTipo("lamina")}
              className={`rounded-full px-4 py-2 transition ${
                tipo === "lamina"
                  ? "bg-charcoal text-cream"
                  : "text-charcoal/70 hover:text-charcoal"
              }`}
            >
              Lámina · {formatearEUR(obra.lamina_precio!)}
            </button>
          </div>
        )}

        <div>
          <button onClick={comprar} disabled={loading} className="btn-primary">
            {loading ? "Redirigiendo a pago seguro…" : textoBoton}
          </button>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      <div
        aria-hidden={botonOriginalVisible}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-cream/95 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur transition-transform duration-300 ease-out ${
          botonOriginalVisible ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="container-site flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs uppercase tracking-widest text-charcoal/50">
              {etiquetaTipo}
            </p>
            <p className="text-lg font-medium">{formatearEUR(precioActual)}</p>
          </div>
          <button
            onClick={comprar}
            disabled={loading}
            className="btn-primary flex-none"
          >
            {textoBoton}
          </button>
        </div>
      </div>
    </>
  );
}
