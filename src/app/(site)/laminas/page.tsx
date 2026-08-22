import { createClient } from "@/lib/supabase/server";
import MosaicoObras from "@/components/MosaicoObras";
import CabeceraPagina from "@/components/CabeceraPagina";
import RevelarEnVista from "@/components/RevelarEnVista";
import type { Obra } from "@/types";

export const metadata = {
  title: "Láminas — ArteCelada",
};

export const revalidate = 0;

export default async function LaminasPage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("obras")
    .select("*")
    .eq("visible", true)
    .not("lamina_precio", "is", null)
    .order("created_at", { ascending: false });

  const obras = (data ?? []) as Obra[];

  return (
    <>
      <CabeceraPagina titulo="Láminas" />

      <section className="container-site py-16">
        <RevelarEnVista className="mb-12 text-center">
          <p className="mx-auto max-w-2xl text-charcoal/70">
            Copias impresas de alta calidad de mis obras originales, a un
            precio más accesible. Disponibles aunque el original ya se haya
            vendido.
          </p>
        </RevelarEnVista>

        {error && (
          <p className="text-center text-red-600">
            No se pudieron cargar las láminas. Revisa la configuración de
            Supabase (.env).
          </p>
        )}

        {!error && obras.length === 0 && (
          <p className="text-center text-charcoal/60">
            Todavía no hay láminas publicadas.
          </p>
        )}

        <MosaicoObras obras={obras} variante="lamina" />
      </section>
    </>
  );
}
