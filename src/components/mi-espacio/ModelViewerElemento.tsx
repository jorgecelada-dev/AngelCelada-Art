"use client";

// Efecto secundario: registra el custom element <model-viewer>. Este
// fichero solo se carga vía next/dynamic con ssr:false (ArViewer.tsx),
// nunca en el servidor, porque customElements no existe ahí.
import "@google/model-viewer";
import { useEffect, useRef, useState } from "react";
import type { Obra } from "@/types";

type ModelViewerElement = HTMLElement;

type NavigatorConWebXR = Navigator & {
  xr?: { isSessionSupported?: (modo: string) => Promise<boolean> };
};

export default function ModelViewerElemento({ obra }: { obra: Obra }) {
  const ref = useRef<ModelViewerElement>(null);
  const [disponible, setDisponible] = useState<boolean | null>(null);

  // Comprobación propia, independiente de los eventos de model-viewer:
  // "load"/"ar-status" solo avisan cuando la disponibilidad CAMBIA
  // (ej. de sí a no), nunca cuando nunca llegó a estar disponible desde
  // el principio — que es justo el caso de un Android sin ARCore. Ahí
  // ese aviso nunca llegaba a disparase, así que el botón se quedaba
  // visible pero sin el clic conectado (model-viewer solo lo conecta si
  // el modo AR resultó válido) y no pasaba nada al pulsarlo.
  useEffect(() => {
    let cancelado = false;
    setDisponible(null);

    async function comprobar() {
      const esIOS =
        typeof navigator !== "undefined" &&
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !("MSStream" in window);

      if (esIOS) {
        // AR Quick Look viene con el propio iOS (ARKit), no hace falta
        // instalar ni certificar nada aparte como con ARCore, así que
        // basta con que exista el .usdz (ya garantizado por ArViewer).
        if (!cancelado) setDisponible(true);
        return;
      }

      const nav = navigator as NavigatorConWebXR;
      if (nav.xr?.isSessionSupported) {
        try {
          const soportado = await nav.xr.isSessionSupported("immersive-ar");
          if (!cancelado) setDisponible(soportado);
        } catch {
          if (!cancelado) setDisponible(false);
        }
      } else {
        if (!cancelado) setDisponible(false);
      }
    }

    comprobar();
    return () => {
      cancelado = true;
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
        {disponible !== false && (
          <button slot="ar-button" type="button" className="btn-primary btn-brillo">
            Ver en tu pared
          </button>
        )}
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
