"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Cuando se fuerza una orientación contraria a la real de la foto (campo
// "orientacion" de la obra), no basta con cambiar el recuadro: hay que
// rotar la imagen 90º de verdad para que se vea como esa orientación,
// igual que se previsualiza en el panel al editar la obra.
export default function ImagenObraRotada({
  src,
  alt,
  anchoNatural,
  altoNatural,
  vertical,
}: {
  src: string;
  alt: string;
  anchoNatural: number;
  altoNatural: number;
  vertical: boolean;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  );

  useEffect(() => {
    function calcular() {
      // Este componente solo se usa cuando hay que rotar, así que el
      // resultado final es siempre la proporción natural invertida.
      const aspectoFinal = altoNatural / anchoNatural;

      const maxW = vertical
        ? Math.min(window.innerWidth * 0.85, 480)
        : Math.min(window.innerWidth * 0.85, 1024);
      const maxH = vertical
        ? Math.min(window.innerHeight * 0.75, 700)
        : Math.min(window.innerHeight * 0.8, 700);

      let width = maxW;
      let height = width / aspectoFinal;
      if (height > maxH) {
        height = maxH;
        width = height * aspectoFinal;
      }

      setSize({ width, height });
    }

    calcular();
    window.addEventListener("resize", calcular);
    return () => window.removeEventListener("resize", calcular);
  }, [anchoNatural, altoNatural, vertical]);

  if (!size) {
    // Placeholder con la proporción ya intercambiada mientras se mide,
    // para evitar un salto de layout.
    return (
      <div
        ref={contenedorRef}
        className="mx-auto w-full max-w-md"
        style={{ aspectRatio: `${altoNatural} / ${anchoNatural}` }}
      />
    );
  }

  return (
    <div
      ref={contenedorRef}
      className="relative mx-auto"
      style={{ width: size.width, height: size.height }}
    >
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
          quality={100}
          priority
        />
      </div>
    </div>
  );
}
