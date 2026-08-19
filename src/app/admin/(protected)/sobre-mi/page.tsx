import { createClient } from "@/lib/supabase/server";
import type { ContenidoSobreMi } from "@/types";
import SobreMiForm from "./SobreMiForm";

export const revalidate = 0;

export default async function AdminSobreMiPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("contenido_sobre_mi")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .single();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-serif">Sobre mí</h1>
      <p className="mb-8 text-sm text-charcoal/60">
        Edita aquí los textos que se muestran en la página pública{" "}
        <a href="/sobre-mi" target="_blank" className="underline">
          /sobre-mi
        </a>
        .
      </p>
      <SobreMiForm contenido={data as ContenidoSobreMi | null} />
    </div>
  );
}
