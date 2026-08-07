import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Entorno } from "@/types";
import DeleteEntornoButton from "./DeleteEntornoButton";

export const revalidate = 0;

const TIPOS = [
  { key: "salon", label: "Salón" },
  { key: "comedor", label: "Comedor" },
  { key: "oficina", label: "Oficina" },
  { key: "despacho", label: "Despacho" },
] as const;

export default async function AdminEntornosPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("entornos")
    .select("*")
    .order("tipo")
    .order("orden");

  const entornos = (data ?? []) as Entorno[];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-serif">Entornos ({entornos.length})</h1>
        <Link href="/admin/entornos/nuevo" className="btn-primary">
          + Añadir entorno
        </Link>
      </div>

      <p className="mb-8 max-w-2xl text-sm text-charcoal/60">
        Fotos de espacios (salón, comedor, oficina, despacho) que se usan en
        la ficha pública de cada obra para que el comprador vea cómo
        quedaría el cuadro colgado en su pared.
      </p>

      {TIPOS.map((t) => {
        const grupo = entornos.filter((e) => e.tipo === t.key);
        return (
          <div key={t.key} className="mb-10">
            <h2 className="mb-3 text-lg font-medium">{t.label}</h2>
            {grupo.length === 0 ? (
              <p className="text-sm text-charcoal/50">
                Aún no hay entornos de este tipo.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-charcoal/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-charcoal/5">
                    <tr>
                      <th className="p-4">Imagen</th>
                      <th className="p-4">Orden</th>
                      <th className="p-4">Escala (cm/px)</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.map((entorno) => (
                      <tr key={entorno.id} className="border-t border-charcoal/10">
                        <td className="p-4">
                          <div className="relative h-14 w-20 overflow-hidden rounded-lg bg-charcoal/5">
                            {entorno.imagen_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={entorno.imagen_url}
                                alt={t.label}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                        </td>
                        <td className="p-4">{entorno.orden}</td>
                        <td className="p-4">{entorno.escala_cm_por_px}</td>
                        <td className="p-4">
                          <div className="flex gap-3">
                            <Link
                              href={`/admin/entornos/${entorno.id}/editar`}
                              className="underline"
                            >
                              Editar
                            </Link>
                            <DeleteEntornoButton entornoId={entorno.id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
