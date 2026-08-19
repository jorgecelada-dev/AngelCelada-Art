import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MosaicoObras from "@/components/MosaicoObras";
import RevelarEnVista from "@/components/RevelarEnVista";
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
      <RevelarEnVista className="mb-10 text-center">
        <h1 className="section-title">
          <span
            className="efecto-revelado-texto"
            style={{ animationDelay: "0.15s" }}
          >
            Colecciones
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-charcoal/70">
          <span
            className="efecto-revelado-texto"
            style={{ animationDelay: "0.25s" }}
          >
            Cada pieza es única e irrepetible, elaborada con pigmentos y
            materiales de origen natural.
          </span>
        </p>
      </RevelarEnVista>

      {colecciones.length > 0 && (
        <RevelarEnVista delay={0.1} className="mb-12 flex flex-wrap justify-center gap-2">
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
        </RevelarEnVista>
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

      <MosaicoObras obras={obras} />
    </section>
  );
}
