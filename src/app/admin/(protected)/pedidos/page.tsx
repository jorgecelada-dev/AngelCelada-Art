import { createClient } from "@/lib/supabase/server";
import type { Pedido } from "@/types";
import CancelarPedidoButton from "./CancelarPedidoButton";

export const revalidate = 0;

const ESTADO_BADGE: Record<Pedido["estado"], string> = {
  pagado: "bg-green-100 text-green-700",
  pendiente: "bg-amber-100 text-amber-700",
  cancelado: "bg-charcoal/10 text-charcoal/50",
};

const ESTADO_LABEL: Record<Pedido["estado"], string> = {
  pagado: "Pagado",
  pendiente: "Pendiente",
  cancelado: "Cancelado",
};

function formatDireccion(direccion: unknown) {
  if (!direccion || typeof direccion !== "object") return null;
  const d = direccion as Record<string, unknown>;
  const partes = [d.line1, d.postal_code, d.city, d.country].filter(Boolean);
  return partes.length > 0 ? partes.join(", ") : null;
}

export default async function PedidosPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("pedidos")
    .select("*, obras(titulo, imagen_url)")
    .order("created_at", { ascending: false });

  const pedidos = (data ?? []) as Pedido[];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-serif">Pedidos ({pedidos.length})</h1>

      <div className="overflow-hidden rounded-xl border border-charcoal/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-charcoal/5">
            <tr>
              <th className="p-4">Obra</th>
              <th className="p-4">Comprador</th>
              <th className="p-4">Importe</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Envío</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => {
              const direccion = formatDireccion(pedido.direccion_envio);
              return (
                <tr key={pedido.id} className="border-t border-charcoal/10 align-top">
                  <td className="p-4">
                    {pedido.obras?.titulo ?? (
                      <span className="text-charcoal/40">Obra eliminada</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div>{pedido.comprador_nombre ?? "—"}</div>
                    <div className="text-xs text-charcoal/50">
                      {pedido.comprador_email ?? ""}
                    </div>
                  </td>
                  <td className="p-4">
                    {pedido.importe != null
                      ? new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                        }).format(pedido.importe)
                      : "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${ESTADO_BADGE[pedido.estado]}`}
                    >
                      {ESTADO_LABEL[pedido.estado]}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-charcoal/50">
                    {new Date(pedido.created_at).toLocaleString("es-ES")}
                  </td>
                  <td className="p-4 text-xs text-charcoal/60">
                    {direccion ?? "—"}
                  </td>
                  <td className="p-4">
                    <CancelarPedidoButton
                      pedidoId={pedido.id}
                      estado={pedido.estado}
                    />
                  </td>
                </tr>
              );
            })}

            {pedidos.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-charcoal/60">
                  Todavía no hay pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
