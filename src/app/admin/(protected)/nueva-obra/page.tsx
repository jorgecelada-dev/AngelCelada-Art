import { createClient } from "@/lib/supabase/server";
import ObraForm from "../ObraForm";

export const revalidate = 0;

export default async function NuevaObraPage() {
  const supabase = createClient();
  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .order("nombre");

  return (
    <div>
      <h1 className="mb-8 text-2xl font-serif">Añadir nueva obra</h1>
      <ObraForm categorias={categorias ?? []} />
    </div>
  );
}
