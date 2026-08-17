import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Categoria } from "@/types";
import DeleteColeccionButton from "./DeleteColeccionButton";

export const revalidate = 0;

export default async function AdminColeccionesPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("categorias")
    .select("*, obras(count)")
    .order("nombre");

  const colecciones = (data ?? []) as (Categoria & {
    obras: { count: number }[];
  })[];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-serif">
          Colecciones ({colecciones.length})
        </h1>
        <Link href="/admin/colecciones/nuevo" className="btn-primary">
          + Añadir colección
        </Link>
      </div>

      <p className="mb-8 max-w-2xl text-sm text-charcoal/60">
        Agrupa las obras en colecciones (Arena, Azules, Bosques…) para que
        los visitantes puedan filtrarlas en la web pública. Asigna cada obra
        a su colección desde el formulario de edición de la obra.
      </p>

      <div className="overflow-hidden rounded-xl border border-charcoal/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-charcoal/5">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Descripción</th>
              <th className="p-4">Obras</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {colecciones.map((coleccion) => (
              <tr key={coleccion.id} className="border-t border-charcoal/10">
                <td className="p-4 font-medium">{coleccion.nombre}</td>
                <td className="p-4 text-charcoal/60">
                  {coleccion.descripcion ?? "—"}
                </td>
                <td className="p-4">{coleccion.obras?.[0]?.count ?? 0}</td>
                <td className="p-4">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/colecciones/${coleccion.id}/editar`}
                      className="underline"
                    >
                      Editar
                    </Link>
                    <DeleteColeccionButton coleccionId={coleccion.id} />
                  </div>
                </td>
              </tr>
            ))}

            {colecciones.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-charcoal/60">
                  Todavía no has creado ninguna colección.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
