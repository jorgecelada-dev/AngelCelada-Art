import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ObraCard from "@/components/ObraCard";
import type { Categoria, Obra } from "@/types";

export const revalidate = 0;

export default async function ObrasPage({
  searchParams,
}: {
  searchParams: { coleccion?: string };
}) {
  const supabase = createClient();

  const { data: coleccionesData } = await supabase
    .from("categorias")
    .select("*")
    .order("nombre");
  const colecciones = (coleccionesData ?? []) as Categoria[];

  const coleccionActivaId = searchParams.coleccion;

  let query = supabase
    .from("obras")
    .select("*")
    .order("created_at", { ascending: false });

  if (coleccionActivaId) {
    query = query.eq("categoria_id", coleccionActivaId);
  }

  const { data, error } = await query;

  const obras = (data ?? []) as Obra[];
  const coleccionActiva = colecciones.find((c) => c.id === coleccionActivaId);

  return (
    <section className="container-site py-16">
      <div className="mb-10 text-center">
        <h1 className="section-title">Colecciones</h1>
        <p className="mx-auto mt-4 max-w-2xl text-charcoal/70">
          Cada pieza es única e irrepetible, elaborada con pigmentos y
          materiales de origen natural.
        </p>
      </div>

      {colecciones.length > 0 && (
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          <Link
            href="/obras"
            className={`rounded-full px-4 py-2 text-sm transition ${
              !coleccionActivaId
                ? "bg-charcoal text-cream"
                : "bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10"
            }`}
          >
            Todas
          </Link>
          {colecciones.map((coleccion) => (
            <Link
              key={coleccion.id}
              href={`/obras?coleccion=${coleccion.id}`}
              className={`rounded-full px-4 py-2 text-sm transition ${
                coleccionActivaId === coleccion.id
                  ? "bg-charcoal text-cream"
                  : "bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10"
              }`}
            >
              {coleccion.nombre}
            </Link>
          ))}
        </div>
      )}

      {error && (
        <p className="text-center text-red-600">
          No se pudieron cargar las obras. Revisa la configuración de
          Supabase (.env).
        </p>
      )}

      {!error && obras.length === 0 && (
        <p className="text-center text-charcoal/60">
          {coleccionActiva
            ? `Todavía no hay obras en "${coleccionActiva.nombre}".`
            : "Todavía no hay obras publicadas."}
        </p>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        {obras.map((obra) => (
          <ObraCard key={obra.id} obra={obra} />
        ))}
      </div>
    </section>
  );
}
