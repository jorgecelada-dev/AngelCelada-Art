import type { createClient } from "@/lib/supabase/client";
import type { Obra } from "@/types";
import { construirEscena, generarGLB, generarUSDZ } from "./generarModelos";

// Genera los ficheros .glb/.usdz de una obra, los sube al bucket y
// guarda sus URLs en la fila de la obra. Compartido entre el botón
// individual (GenerarVistaArButton) y la generación en bloque desde el
// listado de obras — misma lógica, un único sitio que mantener.
export async function generarYSubirVistaAr(
  supabase: ReturnType<typeof createClient>,
  obra: Pick<Obra, "id" | "imagen_url" | "ancho_cm" | "alto_cm">
): Promise<{ glbUrl: string; usdzUrl: string }> {
  const escena = await construirEscena(obra);
  const [glbBlob, usdzBlob] = await Promise.all([
    generarGLB(escena),
    generarUSDZ(escena),
  ]);

  const sello = Date.now();
  const rutaGlb = `modelos-ar/${obra.id}-${sello}.glb`;
  const rutaUsdz = `modelos-ar/${obra.id}-${sello}.usdz`;

  const [subidaGlb, subidaUsdz] = await Promise.all([
    supabase.storage
      .from("obras")
      .upload(rutaGlb, glbBlob, { contentType: "model/gltf-binary" }),
    supabase.storage
      .from("obras")
      .upload(rutaUsdz, usdzBlob, { contentType: "model/vnd.usdz+zip" }),
  ]);
  if (subidaGlb.error) throw subidaGlb.error;
  if (subidaUsdz.error) throw subidaUsdz.error;

  const {
    data: { publicUrl: glbUrl },
  } = supabase.storage.from("obras").getPublicUrl(rutaGlb);
  const {
    data: { publicUrl: usdzUrl },
  } = supabase.storage.from("obras").getPublicUrl(rutaUsdz);

  const { error: updateError } = await supabase
    .from("obras")
    .update({ modelo_ar_glb_url: glbUrl, modelo_ar_usdz_url: usdzUrl })
    .eq("id", obra.id);
  if (updateError) throw updateError;

  return { glbUrl, usdzUrl };
}
