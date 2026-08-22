// Fondo animado solo para el hero de portada: a diferencia del resto de
// la web (FondoParallax, que se mueve al hacer scroll), el hero puede
// verse entero sin necesidad de scrollear, así que aquí las capas se
// animan solas — deriva horizontal en bucle perfecto (sin salto, porque
// el SVG ya tesela en horizontal) más un balanceo/respiración suave,
// cada capa a su propio ritmo para que no se sientan sincronizadas.
// CSS puro (sin JS): igual de rápido en el primer pintado que el resto
// del hero, y respeta prefers-reduced-motion (ver globals.css).
const CAPAS = [
  { src: "/img/capa-08.svg", height: 580, opacity: 0.5, derivaS: 70, flotarS: 15, delay: 0 },
  { src: "/img/capa-04.svg", height: 600, opacity: 0.55, derivaS: 58, flotarS: 12, delay: -4 },
  { src: "/img/capa-06.svg", height: 540, opacity: 0.5, derivaS: 46, flotarS: 17, delay: -9 },
  { src: "/img/capa-02.svg", height: 550, opacity: 0.6, derivaS: 64, flotarS: 13, delay: -2 },
  { src: "/img/capa-07.svg", height: 470, opacity: 0.35, derivaS: 38, flotarS: 19, delay: -6 },
  { src: "/img/capa-09.svg", height: 440, opacity: 0.4, derivaS: 34, flotarS: 11, delay: -8 },
] as const;

export default function FondoHeroAnimado() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Base opaca: tapa el fondo global de paralaje (FondoParallax)
          detrás del hero, para que aquí solo se vea este sistema de
          olas propio y no se mezclen los dos (quedaría menos limpio). */}
      <div className="absolute inset-0 bg-cream" />
      {CAPAS.map((capa) => (
        <div
          key={capa.src}
          className="fondo-hero-capa absolute inset-x-0 -top-20 -bottom-20"
          style={{
            backgroundImage: `url(${capa.src})`,
            backgroundRepeat: "repeat",
            backgroundSize: `1440px ${capa.height}px`,
            opacity: capa.opacity,
            animationDuration: `${capa.derivaS}s, ${capa.flotarS}s`,
            animationDelay: `${capa.delay}s, ${capa.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
