import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ObraForm from "../../../ObraForm";
import type { Obra } from "@/types";

export default async function EditarObraPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: obra }, { data: categorias }] = await Promise.all([
    supabase.from("obras").select("*").eq("id", params.id).single(),
    supabase.from("categorias").select("*").order("nombre"),
  ]);

  if (!obra) notFound();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-serif">Editar obra</h1>
      <ObraForm categorias={categorias ?? []} obra={obra as Obra} />
    </div>
  );
}
