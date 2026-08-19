import { createClient } from "@/lib/supabase/server";
import MosaicoObras from "@/components/MosaicoObras";
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
    .not("lamina_precio", "is", null)
    .order("created_at", { ascending: false });

  const obras = (data ?? []) as Obra[];

  return (
    <section className="container-site py-16">
      <RevelarEnVista className="mb-10 text-center">
        <h1 className="section-title">
          <span
            className="efecto-revelado-texto"
            style={{ animationDelay: "0.15s" }}
          >
            Láminas
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-charcoal/70">
          <span
            className="efecto-revelado-texto"
            style={{ animationDelay: "0.25s" }}
          >
            Copias impresas de alta calidad de mis obras originales, a un
            precio más accesible. Disponibles aunque el original ya se haya
            vendido.
          </span>
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
  );
}
