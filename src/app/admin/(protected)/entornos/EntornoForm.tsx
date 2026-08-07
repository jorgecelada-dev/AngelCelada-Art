"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Entorno } from "@/types";

const TIPOS = [
  { key: "salon", label: "Salón" },
  { key: "comedor", label: "Comedor" },
  { key: "oficina", label: "Oficina" },
  { key: "despacho", label: "Despacho" },
] as const;

export default function EntornoForm({ entorno }: { entorno?: Entorno }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);

  const [paredX, setParedX] = useState(entorno?.pared_x ?? 20);
  const [paredY, setParedY] = useState(entorno?.pared_y ?? 20);
  const [paredAncho, setParedAncho] = useState(entorno?.pared_ancho ?? 60);
  const [paredAlto, setParedAlto] = useState(entorno?.pared_alto ?? 60);

  const esEdicion = Boolean(entorno);

  const previewUrl = useMemo(() => {
    if (imagenFile) return URL.createObjectURL(imagenFile);
    return entorno?.imagen_url ?? null;
  }, [imagenFile, entorno?.imagen_url]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      let imagen_url = entorno?.imagen_url ?? null;
      let overlay_luz_url = entorno?.overlay_luz_url ?? null;

      if (imagenFile) {
        const nombreArchivo = `entornos/${Date.now()}-${imagenFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("obras")
          .upload(nombreArchivo, imagenFile);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("obras").getPublicUrl(nombreArchivo);
        imagen_url = publicUrl;
      }

      if (overlayFile) {
        const nombreArchivo = `entornos/overlay-${Date.now()}-${overlayFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("obras")
          .upload(nombreArchivo, overlayFile);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("obras").getPublicUrl(nombreArchivo);
        overlay_luz_url = publicUrl;
      }

      const payload = {
        tipo: fd.get("tipo") as string,
        orden: fd.get("orden") ? Number(fd.get("orden")) : 0,
        pared_x: Number(fd.get("pared_x")),
        pared_y: Number(fd.get("pared_y")),
        pared_ancho: Number(fd.get("pared_ancho")),
        pared_alto: Number(fd.get("pared_alto")),
        escala_cm_por_px: Number(fd.get("escala_cm_por_px")),
        imagen_url,
        overlay_luz_url,
      };

      if (esEdicion && entorno) {
        const { error: updateError } = await supabase
          .from("entornos")
          .update(payload)
          .eq("id", entorno.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("entornos")
          .insert(payload);
        if (insertError) throw insertError;
      }

      router.push("/admin/entornos");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo guardar el entorno. Revisa los datos e inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Tipo de espacio</label>
          <select
            name="tipo"
            defaultValue={entorno?.tipo ?? "salon"}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          >
            {TIPOS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Orden</label>
          <input
            name="orden"
            type="number"
            defaultValue={entorno?.orden ?? 0}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Foto del espacio {esEdicion && "(deja vacío para mantener la actual)"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagenFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">
          Ajusta el rectángulo sobre la zona de pared donde debe aparecer la
          obra (en % respecto a la foto)
        </p>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-charcoal/10 bg-charcoal/5">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Previsualización del entorno"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-charcoal/40">
              Sube una foto para previsualizar
            </div>
          )}
          <div
            className="absolute border-2 border-clay bg-clay/20"
            style={{
              left: `${paredX}%`,
              top: `${paredY}%`,
              width: `${paredAncho}%`,
              height: `${paredAlto}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">
            Posición X de la pared (%)
          </label>
          <input
            name="pared_x"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={paredX}
            onChange={(e) => setParedX(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Posición Y de la pared (%)
          </label>
          <input
            name="pared_y"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={paredY}
            onChange={(e) => setParedY(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">
            Ancho de la pared (%)
          </label>
          <input
            name="pared_ancho"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={paredAncho}
            onChange={(e) => setParedAncho(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Alto de la pared (%)
          </label>
          <input
            name="pared_alto"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={paredAlto}
            onChange={(e) => setParedAlto(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Escala (cm reales por píxel)
        </label>
        <input
          name="escala_cm_por_px"
          type="number"
          step="0.0001"
          defaultValue={entorno?.escala_cm_por_px ?? 0.1}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
        <p className="mt-1 text-xs text-charcoal/50">
          Para calcularla: mide en la foto, en píxeles, el ancho de un objeto
          del que sepas la medida real (por ejemplo un sofá de 200 cm) y
          divide su tamaño real en cm entre esa medida en píxeles.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Overlay de luz (opcional
          {esEdicion && ", deja vacío para mantener el actual"})
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setOverlayFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
        <p className="mt-1 text-xs text-charcoal/50">
          Imagen opcional con sombras/luz de la habitación que se superpone
          sobre la obra para integrarla mejor visualmente.
        </p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Guardando…" : esEdicion ? "Guardar cambios" : "Añadir entorno"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
