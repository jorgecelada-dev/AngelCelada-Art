import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Obra } from "@/types";
import DeleteObraButton from "./DeleteObraButton";
import ToggleVisibleButton from "./ToggleVisibleButton";
import { formatearEUR, precioFinal, tieneDescuentoActivo } from "@/lib/precio";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("obras")
    .select("*")
    .order("created_at", { ascending: false });

  const obras = (data ?? []) as Obra[];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-serif">Tus obras ({obras.length})</h1>
        <Link href="/admin/nueva-obra" className="btn-primary">
          + Añadir obra
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-charcoal/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-charcoal/5">
            <tr>
              <th className="p-4">Imagen</th>
              <th className="p-4">Título</th>
              <th className="p-4">Precio</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Destacada</th>
              <th className="p-4">Visible</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {obras.map((obra) => (
              <tr key={obra.id} className="border-t border-charcoal/10">
                <td className="p-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-charcoal/5">
                    {obra.imagen_url && (
                      <Image
                        src={obra.imagen_url}
                        alt={obra.titulo}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="p-4">{obra.titulo}</td>
                <td className="p-4">
                  {tieneDescuentoActivo(obra) ? (
                    <span className="flex items-baseline gap-2">
                      <span className="text-charcoal/40 line-through">
                        {formatearEUR(obra.precio)}
                      </span>
                      {formatearEUR(precioFinal(obra))}
                    </span>
                  ) : (
                    formatearEUR(obra.precio)
                  )}
                </td>
                <td className="p-4">
                  {obra.estado ?? (obra.disponible ? "En venta" : "Vendida")}
                  {tieneDescuentoActivo(obra) && ` (-${obra.descuento_porcentaje}%)`}
                </td>
                <td className="p-4">{obra.destacada ? "Sí" : "No"}</td>
                <td className="p-4">
                  <ToggleVisibleButton obraId={obra.id} visibleInicial={obra.visible} />
                </td>
                <td className="p-4">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/obras/${obra.id}/editar`}
                      className="underline"
                    >
                      Editar
                    </Link>
                    <DeleteObraButton obraId={obra.id} />
                  </div>
                </td>
              </tr>
            ))}

            {obras.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-charcoal/60">
                  Todavía no has añadido ninguna obra.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
