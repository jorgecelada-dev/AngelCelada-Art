"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Obra } from "@/types";
import { formatearEUR, precioFinal } from "@/lib/precio";

const ModelViewerElemento = dynamic(() => import("./ModelViewerElemento"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-2xl bg-charcoal/5 text-sm text-charcoal/40">
      Cargando vista 3D…
    </div>
  ),
});

export default function ArViewer({ obras }: { obras: Obra[] }) {
  const obrasConAr = obras.filter(
    (obra) => obra.modelo_ar_glb_url && obra.modelo_ar_usdz_url
  );
  const [obraId, setObraId] = useState<string | null>(null);
  const obra = obrasConAr.find((o) => o.id === obraId) ?? null;

  if (obrasConAr.length === 0) {
    return (
      <p className="text-sm text-charcoal/60">
        Todavía no hay obras preparadas para ver en AR.
      </p>
    );
  }

  if (obra) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setObraId(null)}
          className="mb-4 text-sm text-charcoal/60 underline underline-offset-4"
        >
          ← Elegir otra obra
        </button>

        <div className="overflow-hidden rounded-2xl bg-charcoal/5">
          <ModelViewerElemento obra={obra} />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <div>
            <p className="font-serif text-lg">{obra.titulo}</p>
            <p className="text-charcoal/60">{obra.medidas}</p>
          </div>
          <p className="font-medium text-clay">
            {formatearEUR(precioFinal(obra))}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-charcoal/60">
        Elige una obra para verla en AR, sobre tu propia pared.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {obrasConAr.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setObraId(o.id)}
            className="group overflow-hidden rounded-lg bg-charcoal/5 text-left shadow-sm transition hover:shadow-xl"
          >
            <div className="relative aspect-square overflow-hidden">
              {o.imagen_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={o.imagen_url}
                  alt={o.titulo}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <p className="truncate px-3 py-2 text-sm font-medium">
              {o.titulo}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
