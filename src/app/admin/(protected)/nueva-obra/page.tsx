import { createClient } from "@/lib/supabase/server";
import ObraForm from "../ObraForm";
import type { Entorno } from "@/types";

export const revalidate = 0;

export default async function NuevaObraPage() {
  const supabase = createClient();
  const [{ data: categorias }, { data: entornos }] = await Promise.all([
    supabase.from("categorias").select("*").order("nombre"),
    supabase.from("entornos").select("*").order("tipo").order("orden"),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-serif">Añadir nueva obra</h1>
      <ObraForm categorias={categorias ?? []} entornos={(entornos ?? []) as Entorno[]} />
    </div>
  );
}
