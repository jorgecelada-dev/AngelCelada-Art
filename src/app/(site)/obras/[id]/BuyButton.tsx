"use client";

import { useState } from "react";
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

  if (!hayLamina) {
    return (
      <div>
        <button onClick={comprar} disabled={loading} className="btn-primary">
          {loading ? "Redirigiendo a pago seguro…" : "Comprar esta obra"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
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

      <div>
        <button onClick={comprar} disabled={loading} className="btn-primary">
          {loading
            ? "Redirigiendo a pago seguro…"
            : tipo === "lamina"
            ? "Comprar lámina"
            : "Comprar esta obra"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
