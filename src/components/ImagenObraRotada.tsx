"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Cuando se fuerza una orientación contraria a la real de la foto (campo
// "orientacion" de la obra), no basta con cambiar el recuadro: hay que
// rotar la imagen 90º de verdad para que se vea como esa orientación,
// igual que se previsualiza en el panel al editar la obra.
export default function ImagenObraRotada({
  src,
  alt,
  aspecto,
  vertical,
}: {
  src: string;
  alt: string;
  // Proporción ancho/alto final deseada (ya en la orientación forzada, tras
  // rotar) — la misma fuente de verdad que usa el resto del sitio
  // (calcularAspectoYRotacion), no los píxeles crudos de la foto. Si no
  // coincidieran, el recuadro quedaría con un tamaño distinto al real y
  // sobraría espacio alrededor de la imagen rotada.
  aspecto: number;
  vertical: boolean;
}) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  );

  useEffect(() => {
    function calcular() {
      const maxW = vertical
        ? Math.min(window.innerWidth * 0.85, 480)
        : Math.min(window.innerWidth * 0.85, 1024);
      const maxH = vertical
        ? Math.min(window.innerHeight * 0.75, 700)
        : Math.min(window.innerHeight * 0.8, 700);

      let width = maxW;
      let height = width / aspecto;
      if (height > maxH) {
        height = maxH;
        width = height * aspecto;
      }

      setSize({ width, height });
    }

    calcular();
    window.addEventListener("resize", calcular);
    return () => window.removeEventListener("resize", calcular);
  }, [aspecto, vertical]);

  if (!size) {
    // Placeholder con la proporción final ya correcta mientras se mide,
    // para evitar un salto de layout.
    return (
      <div
        className="mx-auto w-full max-w-md"
        style={{ aspectRatio: String(aspecto) }}
      />
    );
  }

  return (
    <div className="relative mx-auto" style={{ width: size.width, height: size.height }}>
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: size.height,
          height: size.width,
          transform: "translate(-50%, -50%) rotate(90deg)",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="700px"
          quality={90}
          priority
        />
      </div>
    </div>
  );
}
