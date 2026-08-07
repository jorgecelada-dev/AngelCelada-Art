"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Pedido } from "@/types";

export default function CancelarPedidoButton({
  pedidoId,
  estado,
}: {
  pedidoId: string;
  estado: Pedido["estado"];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (estado === "cancelado") {
    return <span className="text-charcoal/40">Cancelado</span>;
  }

  async function cancelar() {
    const confirmado = window.confirm(
      "¿Cancelar este pedido? Si estaba pagado, la obra volverá a estar disponible para la venta."
    );
    if (!confirmado) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoId}/cancelar`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("No se pudo cancelar el pedido");
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("No se pudo cancelar el pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={cancelar}
        disabled={loading}
        className="text-red-600 underline"
      >
        {loading ? "Cancelando…" : "Cancelar"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
