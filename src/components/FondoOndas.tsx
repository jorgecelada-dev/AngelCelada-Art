export type CapaOnda = {
  src: string;
  height: number;
  opacity: number;
  direccion: "izq" | "der";
  derivaS: number;
  flotar: "suave" | "medio" | "amplio";
  flotarS: number;
  delay: number;
};

const DERIVA_NOMBRE = {
  izq: "deriva-horizontal",
  der: "deriva-horizontal-inversa",
} as const;

const FLOTAR_NOMBRE = {
  suave: "flotar-suave",
  medio: "flotar-medio",
  amplio: "flotar-amplio",
} as const;

// Capas de "papel recortado" onduladas (public/img/capa-01..16.svg), con
// animación propia en CSS puro (sin JS ni scroll): deriva horizontal en
// bucle perfecto (cada SVG tesela en horizontal, así que no hay salto al
// volver a 0) + un balanceo/respiración vertical. Cada capa tiene su
// propia dirección (algunas a la izquierda, otras a la derecha, como
// corrientes opuestas), velocidad y amplitud de balanceo, para que la
// diferencia entre ellas se note de verdad. Una única instancia global
// (FondoParallax, en el layout) para toda la web: al no desmontarse
// nunca al navegar entre páginas, la animación no da saltos ni
// destellos.
export default function FondoOndas({ capas }: { capas: readonly CapaOnda[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {capas.map((capa) => (
        <div
          key={capa.src}
          className="fondo-ondas-capa absolute inset-x-0 -top-20 -bottom-20"
          style={{
            backgroundImage: `url(${capa.src})`,
            backgroundRepeat: "repeat",
            backgroundSize: `1440px ${capa.height}px`,
            opacity: capa.opacity,
            animationName: `${DERIVA_NOMBRE[capa.direccion]}, ${FLOTAR_NOMBRE[capa.flotar]}`,
            animationDuration: `${capa.derivaS}s, ${capa.flotarS}s`,
            animationDelay: `${capa.delay}s, ${capa.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
