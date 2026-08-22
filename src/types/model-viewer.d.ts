import type { DetailedHTMLProps, HTMLAttributes } from "react";

// El paquete @google/model-viewer registra <model-viewer> como custom
// element (efecto secundario al importarlo); esto solo le da tipos a JSX
// para los atributos que usamos (todos en kebab-case, tal cual los espera
// el propio elemento).
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        "ios-src"?: string;
        alt?: string;
        ar?: boolean;
        "ar-modes"?: string;
        "ar-placement"?: string;
        "camera-orbit"?: string;
        "shadow-intensity"?: string;
        loading?: "auto" | "lazy" | "eager";
        reveal?: "auto" | "interaction" | "manual";
      };
    }
  }
}

export {};
