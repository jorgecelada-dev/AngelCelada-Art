import { createClient } from "@/lib/supabase/server";
import ObraCard from "@/components/ObraCard";
import type { Obra } from "@/types";

export const revalidate = 0;

export default async function ObrasPage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("obras")
    .select("*")
    .order("created_at", { ascending: false });

  const obras = (data ?? []) as Obra[];

  return (
    <section className="container-site py-16">
      <div className="mb-12 text-center">
        <h1 className="section-title">La colección</h1>
        <p className="mx-auto mt-4 max-w-2xl text-charcoal/70">
          Cada pieza es única e irrepetible, elaborada con pigmentos y
          materiales de origen natural.
        </p>
      </div>

      {error && (
        <p className="text-center text-red-600">
          No se pudieron cargar las obras. Revisa la configuración de
          Supabase (.env).
        </p>
      )}

      {!error && obras.length === 0 && (
        <p className="text-center text-charcoal/60">
          Todavía no hay obras publicadas.
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
