"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Entorno, Obra } from "@/types";
import EspacioEjemploViewer from "./EspacioEjemploViewer";
import SubirHabitacion from "./SubirHabitacion";
import ArViewer from "./ArViewer";

type Modo = "elegir" | "ejemplo" | "subir" | "ar";

export default function MiEspacioClient({
  obras,
  entornos,
}: {
  obras: Obra[];
  entornos: Entorno[];
}) {
  // El CTA "Ver en AR" de las tarjetas de /obras enlaza aquí con
  // ?ar=<id>: entra directo en el modo AR con esa obra ya elegida, sin
  // pasar por la pantalla de "elegir" ni por la rejilla de selección.
  const searchParams = useSearchParams();
  const obraArInicial = searchParams.get("ar");
  const [modo, setModo] = useState<Modo>(obraArInicial ? "ar" : "elegir");
  const hayObrasConAr = obras.some(
    (obra) => obra.modelo_ar_glb_url && obra.modelo_ar_usdz_url
  );

  if (modo === "elegir") {
    return (
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => setModo("subir")}
          className="btn-primary"
        >
          Subir mi habitación
        </button>
        <button
          type="button"
          onClick={() => setModo("ejemplo")}
          className="btn-secondary"
        >
          Espacios de ejemplo
        </button>
        {hayObrasConAr && (
          <button
            type="button"
            onClick={() => setModo("ar")}
            className="btn-secondary"
          >
            Ver en AR
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setModo("elegir")}
        className="mb-6 text-sm text-charcoal/60 underline underline-offset-4"
      >
        ← Elegir otra vez
      </button>

      {modo === "ejemplo" ? (
        <EspacioEjemploViewer entornos={entornos} obras={obras} />
      ) : modo === "ar" ? (
        <ArViewer obras={obras} obraIdInicial={obraArInicial} />
      ) : (
        <SubirHabitacion obras={obras} />
      )}
    </div>
  );
}
