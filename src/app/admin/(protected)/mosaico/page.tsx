import { createClient } from "@/lib/supabase/server";
import type { Obra } from "@/types";
import MosaicoOrdenador from "./MosaicoOrdenador";

export const revalidate = 0;

export default async function MosaicoPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("obras")
    .select("*")
    .eq("visible", true)
    .order("orden_manual", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  const obras = (data ?? []) as Obra[];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-serif">Mosaico</h1>
      <p className="mb-8 max-w-2xl text-sm text-charcoal/60">
        Arrastra tus obras desde el panel de la izquierda a la cuadrícula
        para fijar el orden en que aparecen en /obras y entre las
        destacadas de portada. Las que dejes en el panel siguen
        apareciendo, ordenadas por fecha, detrás de las que coloques aquí.
      </p>
      {obras.length === 0 ? (
        <p className="text-charcoal/60">
          No tienes obras visibles todavía.
        </p>
      ) : (
        <MosaicoOrdenador obrasIniciales={obras} />
      )}
    </div>
  );
}
