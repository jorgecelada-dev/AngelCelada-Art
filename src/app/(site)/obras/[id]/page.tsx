import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Entorno, Obra, ObraDetalle } from "@/types";
import BuyButton from "./BuyButton";
import VisualizacionObra from "@/components/VisualizacionObra";
import ImagenObraRotada from "@/components/ImagenObraRotada";
import EntradaImagen from "@/components/EntradaImagen";
import RevelarEnVista from "@/components/RevelarEnVista";
import GaleriaDetalles from "@/components/GaleriaDetalles";
import { formatearEUR, precioFinal, tieneDescuentoActivo } from "@/lib/precio";
import { calcularAspectoYRotacion } from "@/lib/orientacion";

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

  const entornosOcultos = new Set(obra.entornos_ocultos ?? []);
  const entornos = ((entornosData ?? []) as Entorno[]).filter(
    (entorno) => !entornosOcultos.has(entorno.id)
  );

  const { data: detallesData } = await supabase
    .from("obra_detalles")
    .select("*")
    .eq("obra_id", obra.id)
    .order("orden");

  const detalles = (detallesData ?? []) as ObraDetalle[];

  const enOferta = tieneDescuentoActivo(obra);
  const precioFormateado = formatearEUR(precioFinal(obra));
  const precioOriginalFormateado = formatearEUR(obra.precio);

  const estadoLabel = obra.estado
    ? ESTADO_LABEL[obra.estado] ?? obra.estado
    : obra.disponible
    ? "En venta"
    : "Vendida";

  const tieneDimensionesReales = Boolean(
    obra.imagen_ancho_px && obra.imagen_alto_px
  );

  // Misma fuente de verdad que las tarjetas y el mosaico: las medidas
  // reales en cm mandan si existen, y solo se rota la foto de verdad
  // cuando su orientación natural no coincide con la que corresponde.
  const { aspecto, necesitaRotarFoto: necesitaRotar } =
    calcularAspectoYRotacion(obra);
  const esVertical = aspecto < 1;

  const imagen = obra.imagen_url ? (
    tieneDimensionesReales ? (
      necesitaRotar ? (
        <ImagenObraRotada
          src={obra.imagen_url}
          alt={obra.titulo}
          aspecto={aspecto}
          vertical={esVertical}
        />
      ) : (
        <Image
          src={obra.imagen_url}
          alt={obra.titulo}
          width={obra.imagen_ancho_px!}
          height={obra.imagen_alto_px!}
          className={
            esVertical
              ? "max-h-[75vh] w-auto max-w-full object-contain"
              : "max-h-[80vh] w-auto max-w-full object-contain"
          }
          sizes={
            esVertical
              ? "(min-width: 768px) 50vw, 100vw"
              : "(min-width: 1024px) 1024px, 100vw"
          }
          quality={100}
          priority
        />
      )
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
  );

  const datos = (
    <RevelarEnVista delay={0.15} direccion="derecha" className="overflow-x-clip">
      <h1 className="section-title">
        <span
          className="efecto-revelado-texto"
          style={{ animationDelay: "0.15s" }}
        >
          {obra.titulo}
        </span>
      </h1>

      {obra.categorias?.nombre && (
        <p className="mt-2 text-sm uppercase tracking-widest text-clay">
          {obra.categorias.nombre}
        </p>
      )}

      <p className="mt-6 flex items-baseline gap-3 text-2xl font-medium">
        {enOferta && (
          <span className="text-lg text-charcoal/40 line-through">
            {precioOriginalFormateado}
          </span>
        )}
        {precioFormateado}
        {enOferta && (
          <span className="rounded-full bg-clay px-3 py-1 text-xs font-medium tracking-wide text-cream">
            -{obra.descuento_porcentaje}%
          </span>
        )}
      </p>
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
          <span
            className="efecto-revelado-texto"
            style={{ animationDelay: "0.3s" }}
          >
            {obra.descripcion}
          </span>
        </p>
      )}

      <div className="mt-10">
        {obra.disponible || obra.lamina_precio ? (
          <BuyButton obra={obra} />
        ) : (
          <span className="btn-secondary pointer-events-none opacity-60">
            Obra vendida
          </span>
        )}
      </div>

      {esVertical && obra.ancho_cm && obra.alto_cm && (
        <div className="mt-10">
          <VisualizacionObra obra={obra} entornos={entornos} />
        </div>
      )}
    </RevelarEnVista>
  );

  // Las obras verticales desperdician mucho ancho si la foto va a ancho
  // completo arriba (queda mucho hueco vacío a los lados); en su lugar se
  // muestran en dos columnas, imagen contenida junto a los datos.
  const principal = esVertical ? (
    <section className="container-site grid grid-cols-1 gap-12 py-16 md:grid-cols-2">
      <EntradaImagen className="flex items-start justify-center overflow-hidden rounded-2xl bg-charcoal/5">
        {imagen}
      </EntradaImagen>
      {datos}
    </section>
  ) : (
    <section className="container-site py-16">
      <EntradaImagen className="flex w-full items-center justify-center overflow-hidden rounded-2xl bg-charcoal/5">
        {imagen}
      </EntradaImagen>

      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.3fr]">
        {datos}

        {obra.ancho_cm && obra.alto_cm && (
          <div>
            <VisualizacionObra obra={obra} entornos={entornos} />
          </div>
        )}
      </div>
    </section>
  );

  return (
    <>
      {principal}

      {detalles.length > 0 && (
        <section className="container-site pb-16">
          <RevelarEnVista>
            <h2 className="section-title text-2xl">
              <span
                className="efecto-revelado-texto"
                style={{ animationDelay: "0.15s" }}
              >
                Detalles de la obra
              </span>
            </h2>
          </RevelarEnVista>
          <GaleriaDetalles detalles={detalles} titulo={obra.titulo} />
        </section>
      )}
    </>
  );
}
