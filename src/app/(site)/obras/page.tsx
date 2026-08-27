import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FiltrosObras from "@/components/FiltrosObras";
import CabeceraPagina from "@/components/CabeceraPagina";
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
    .eq("visible", true)
    .order("orden_manual", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (coleccionActivaId) {
    query = query.eq("categoria_id", coleccionActivaId);
  }

  const { data, error } = await query;

  const obras = (data ?? []) as Obra[];
  const coleccionActiva = colecciones.find((c) => c.id === coleccionActivaId);

  return (
    <>
      <CabeceraPagina titulo="Obras" seccion="obras" />

      <section className="container-site py-16">
        {coleccionActiva?.descripcion && (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm uppercase tracking-widest text-clay">
              {coleccionActiva.nombre}
            </p>
            <p className="mt-3 text-charcoal/70">
              {coleccionActiva.descripcion}
            </p>
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

        {/* Antes vivía dentro de la cabecera oscura: con el nuevo fondo
            ondulado, la parte baja de la banda podía "comerse" visualmente
            las pastillas según cómo cayera la ola en cada pantalla. Aquí
            debajo, justo encima del filtro de tamaño/año, no depende de
            eso. */}
        {colecciones.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
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

        <FiltrosObras obras={obras} />
      </section>
    </>
  );
}
