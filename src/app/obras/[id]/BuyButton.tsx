"use client";

import { useState } from "react";

export default function BuyButton({ obraId }: { obraId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function comprar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obraId }),
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

  return (
    <div>
      <button onClick={comprar} disabled={loading} className="btn-primary">
        {loading ? "Redirigiendo a pago seguro…" : "Comprar esta obra"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
