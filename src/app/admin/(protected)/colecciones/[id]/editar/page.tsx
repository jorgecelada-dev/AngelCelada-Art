import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ColeccionForm from "../../ColeccionForm";
import type { Categoria } from "@/types";

export default async function EditarColeccionPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: coleccion } = await supabase
    .from("categorias")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!coleccion) notFound();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-serif">Editar colección</h1>
      <ColeccionForm coleccion={coleccion as Categoria} />
    </div>
  );
}
