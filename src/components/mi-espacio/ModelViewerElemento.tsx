"use client";

// Efecto secundario: registra el custom element <model-viewer>. Este
// fichero solo se carga vía next/dynamic con ssr:false (ArViewer.tsx),
// nunca en el servidor, porque customElements no existe ahí.
import "@google/model-viewer";
import { useEffect, useRef, useState } from "react";
import type { Obra } from "@/types";

type ModelViewerElement = HTMLElement & { canActivateAR?: boolean };

export default function ModelViewerElemento({ obra }: { obra: Obra }) {
  const ref = useRef<ModelViewerElement>(null);
  const [disponible, setDisponible] = useState<boolean | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setDisponible(null);

    function comprobar() {
      setDisponible(Boolean(el?.canActivateAR));
    }

    el.addEventListener("load", comprobar);
    el.addEventListener("ar-status", comprobar);
    return () => {
      el.removeEventListener("load", comprobar);
      el.removeEventListener("ar-status", comprobar);
    };
  }, [obra.id]);

  // "scene-viewer" fuera de ar-modes a propósito: para decidir si
  // ofrecerlo, model-viewer solo comprueba si el navegador es
  // Android/Chrome (sniffing de user-agent), sin verificar de verdad si
  // el aparato soporta ARCore — así que en un Android sin ARCore
  // certificado igualmente mostraba el botón, y al pulsarlo Android
  // mandaba a una pantalla nativa de "tu dispositivo no es compatible"
  // en la Play Store, sin ninguna forma de detectarlo desde aquí.
  // "webxr" sí hace la comprobación real (navigator.xr.isSessionSupported)
  // antes de decidir si puede activarse — sin "scene-viewer" como
  // respaldo optimista, canActivateAR refleja fielmente si el aparato
  // puede de verdad, y el aviso de "no disponible" de abajo aparece en
  // vez de mandar a un callejón sin salida.
  return (
    <div>
      <model-viewer
        ref={ref as never}
        key={obra.id}
        src={obra.modelo_ar_glb_url ?? undefined}
        ios-src={obra.modelo_ar_usdz_url ?? undefined}
        alt={`Vista 3D de ${obra.titulo}`}
        ar
        ar-modes="webxr quick-look"
        ar-placement="wall"
        camera-orbit="0deg 90deg auto"
        shadow-intensity="1"
        style={{
          width: "100%",
          height: "420px",
          backgroundColor: "transparent",
        }}
      >
        <button slot="ar-button" type="button" className="btn-primary btn-brillo">
          Ver en tu pared
        </button>
      </model-viewer>

      {disponible === false && (
        <p className="mt-4 rounded-lg bg-charcoal/5 px-4 py-3 text-center text-sm text-charcoal/70">
          La vista en AR no está disponible en este dispositivo o
          navegador. Pruébalo desde Safari en un iPhone, o desde Chrome en
          un Android compatible con ARCore.
        </p>
      )}
    </div>
  );
}
