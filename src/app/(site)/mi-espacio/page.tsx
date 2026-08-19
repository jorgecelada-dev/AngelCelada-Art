import { createClient } from "@/lib/supabase/server";
import type { Entorno, Obra } from "@/types";
import MiEspacioClient from "@/components/mi-espacio/MiEspacioClient";

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
      .order("created_at", { ascending: false }),
    supabase.from("entornos").select("*").order("tipo").order("orden"),
  ]);

  // Solo tiene sentido probarlas aquí si sabemos su tamaño real.
  const obras = ((obrasData ?? []) as Obra[]).filter(
    (obra) => obra.ancho_cm && obra.alto_cm
  );
  const entornos = (entornosData ?? []) as Entorno[];

  return (
    <section className="container-site py-16">
      <div className="mb-10 max-w-2xl">
        <h1 className="section-title">
          <span
            className="efecto-revelado-texto"
            style={{ animationDelay: "0.15s" }}
          >
            Tu espacio
          </span>
        </h1>
        <p className="mt-4 text-charcoal/70">
          <span
            className="efecto-revelado-texto"
            style={{ animationDelay: "0.25s" }}
          >
            Prueba cómo quedarían nuestros cuadros en tu propia pared, a su
            tamaño real. No hace falta registrarse ni crear cuenta, y tu foto
            nunca sale de tu navegador.
          </span>
        </p>
      </div>

      <MiEspacioClient obras={obras} entornos={entornos} />
    </section>
  );
}
