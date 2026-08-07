"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteObraButton({ obraId }: { obraId: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function eliminar() {
    const confirmado = window.confirm(
      "¿Seguro que quieres eliminar esta obra? Esta acción no se puede deshacer."
    );
    if (!confirmado) return;

    const { error } = await supabase.from("obras").delete().eq("id", obraId);

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
