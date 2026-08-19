import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EntornoForm from "../../EntornoForm";
import type { Entorno } from "@/types";

export const revalidate = 0;

export default async function EditarEntornoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: entorno } = await supabase
    .from("entornos")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!entorno) notFound();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-serif">Editar entorno</h1>
      <EntornoForm entorno={entorno as Entorno} />
    </div>
  );
}
