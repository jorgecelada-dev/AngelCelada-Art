import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Entorno, Obra } from "@/types";
import BuyButton from "./BuyButton";
import VisualizacionObra from "@/components/VisualizacionObra";

export const revalidate = 0;

const ESTADO_LABEL: Record<string, string> = {
  "en venta": "En venta",
  "no se vende": "No se vende",
  vendido: "Vendida",
  oferta: "En oferta",
};

export default async function ObraDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data } = await supabase
    .from("obras")
    .select("*, categorias(*)")
    .eq("id", params.id)
    .single();

  const obra = data as Obra | null;

  if (!obra) {
    notFound();
  }

  const { data: entornosData } = await supabase
    .from("entornos")
    .select("*")
    .order("tipo")
    .order("orden");

  const entornos = (entornosData ?? []) as Entorno[];

  const precioFormateado = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(obra.precio);

  const estadoLabel = obra.estado
    ? ESTADO_LABEL[obra.estado] ?? obra.estado
    : obra.disponible
    ? "En venta"
    : "Vendida";

  const tieneDimensionesReales = Boolean(
    obra.imagen_ancho_px && obra.imagen_alto_px
  );

  return (
    <section className="container-site py-16">
      <div className="flex w-full items-center justify-center overflow-hidden rounded-2xl bg-charcoal/5">
        {obra.imagen_url ? (
          tieneDimensionesReales ? (
            <Image
              src={obra.imagen_url}
              alt={obra.titulo}
              width={obra.imagen_ancho_px!}
              height={obra.imagen_alto_px!}
              className="max-h-[80vh] w-auto max-w-full object-contain"
              sizes="(min-width: 1024px) 1024px, 100vw"
              quality={100}
              priority
            />
          ) : (
            // Obras antiguas sin dimensiones guardadas: recorte de respaldo
            // hasta que se vuelvan a guardar desde el panel.
            <div className="relative aspect-[4/5] w-full max-w-xl">
              <Image
                src={obra.imagen_url}
                alt={obra.titulo}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
                quality={100}
                priority
              />
            </div>
          )
        ) : (
          <div className="flex aspect-[4/5] w-full max-w-xl items-center justify-center text-charcoal/30">
            Sin imagen
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <h1 className="section-title">{obra.titulo}</h1>

          {obra.categorias?.nombre && (
            <p className="mt-2 text-sm uppercase tracking-widest text-clay">
              {obra.categorias.nombre}
            </p>
          )}

          <p className="mt-6 text-2xl font-medium">{precioFormateado}</p>
          <p className="mt-1 text-sm text-charcoal/60">{estadoLabel}</p>

          <dl className="mt-8 space-y-3 text-sm text-charcoal/70">
            {obra.tecnica && (
              <div className="flex gap-2">
                <dt className="font-medium text-charcoal">Técnica:</dt>
                <dd>{obra.tecnica}</dd>
              </div>
            )}
            {obra.medidas && (
              <div className="flex gap-2">
                <dt className="font-medium text-charcoal">Medidas:</dt>
                <dd>{obra.medidas}</dd>
              </div>
            )}
            {obra.anio && (
              <div className="flex gap-2">
                <dt className="font-medium text-charcoal">Año:</dt>
                <dd>{obra.anio}</dd>
              </div>
            )}
          </dl>

          {obra.descripcion && (
            <p className="mt-8 leading-relaxed text-charcoal/80">
              {obra.descripcion}
            </p>
          )}

          <div className="mt-10">
            {obra.disponible ? (
              <BuyButton obraId={obra.id} />
            ) : (
              <span className="btn-secondary pointer-events-none opacity-60">
                Obra vendida
              </span>
            )}
          </div>
        </div>

        {obra.ancho_cm && obra.alto_cm && (
          <div>
            <VisualizacionObra obra={obra} entornos={entornos} />
          </div>
        )}
      </div>
    </section>
  );
}
