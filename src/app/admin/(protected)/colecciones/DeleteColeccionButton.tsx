"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteColeccionButton({
  coleccionId,
}: {
  coleccionId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function eliminar() {
    const confirmado = window.confirm(
      "¿Seguro que quieres eliminar esta colección? Las obras que la tengan asignada se quedarán sin colección, no se borran."
    );
    if (!confirmado) return;

    const { error } = await supabase
      .from("categorias")
      .delete()
      .eq("id", coleccionId);

    if (error) {
      console.error(error);
      return;
    }

    router.refresh();
  }

  return (
    <button onClick={eliminar} className="text-red-600 underline">
      Eliminar
    </button>
  );
}
