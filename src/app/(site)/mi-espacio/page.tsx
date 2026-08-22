import { createClient } from "@/lib/supabase/server";
import type { Entorno, Obra } from "@/types";
import MiEspacioClient from "@/components/mi-espacio/MiEspacioClient";
import CabeceraPagina from "@/components/CabeceraPagina";

export const metadata = {
  title: "Tu espacio — ArteCelada",
};

export const revalidate = 0;

export default async function MiEspacioPage() {
  const supabase = createClient();

  const [{ data: obrasData }, { data: entornosData }] = await Promise.all([
    supabase
      .from("obras")
      .select("*")
      .eq("disponible", true)
      .eq("visible", true)
      .order("created_at", { ascending: false }),
    supabase.from("entornos").select("*").order("tipo").order("orden"),
  ]);

  // Solo tiene sentido probarlas aquí si sabemos su tamaño real.
  const obras = ((obrasData ?? []) as Obra[]).filter(
    (obra) => obra.ancho_cm && obra.alto_cm
  );
  const entornos = (entornosData ?? []) as Entorno[];

  return (
    <>
      <CabeceraPagina titulo="Tu espacio" imagen="/img/cabeceras/azul.png" />

      <section className="container-site py-16">
        <p className="mx-auto mb-10 max-w-2xl text-center text-charcoal/70">
          Prueba cómo quedarían nuestros cuadros en tu propia pared, a su
          tamaño real. No hace falta registrarse ni crear cuenta, y tu foto
          nunca sale de tu navegador.
        </p>

        <MiEspacioClient obras={obras} entornos={entornos} />
      </section>
    </>
  );
}
