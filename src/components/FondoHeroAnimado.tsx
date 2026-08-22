// Fondo animado solo para el hero de portada: a diferencia del resto de
// la web (FondoParallax, que se mueve al hacer scroll), el hero puede
// verse entero sin necesidad de scrollear, así que aquí las capas se
// animan solas — deriva horizontal en bucle perfecto (sin salto, porque
// el SVG ya tesela en horizontal) más un balanceo/respiración vertical.
// Cada capa tiene su propia dirección (alternando, como corrientes
// opuestas), velocidad y amplitud de balanceo — no solo su propia
// duración —, para que la diferencia entre ellas se note de verdad en
// vez de sentirse todas iguales solo que a distinto ritmo.
// CSS puro (sin JS): igual de rápido en el primer pintado que el resto
// del hero, y respeta prefers-reduced-motion (ver globals.css).
const CAPAS = [
  { src: "/img/capa-08.svg", height: 580, opacity: 0.5, direccion: "izq", derivaS: 40, flotar: "suave", flotarS: 14, delay: 0 },
  { src: "/img/capa-04.svg", height: 600, opacity: 0.55, direccion: "der", derivaS: 26, flotar: "amplio", flotarS: 10, delay: -3 },
  { src: "/img/capa-06.svg", height: 540, opacity: 0.5, direccion: "izq", derivaS: 34, flotar: "medio", flotarS: 16, delay: -7 },
  { src: "/img/capa-02.svg", height: 550, opacity: 0.6, direccion: "der", derivaS: 22, flotar: "suave", flotarS: 12, delay: -2 },
  { src: "/img/capa-07.svg", height: 470, opacity: 0.35, direccion: "izq", derivaS: 30, flotar: "amplio", flotarS: 20, delay: -5 },
  { src: "/img/capa-09.svg", height: 440, opacity: 0.4, direccion: "der", derivaS: 18, flotar: "medio", flotarS: 9, delay: -6 },
] as const;

const DERIVA_NOMBRE = {
  izq: "deriva-horizontal",
  der: "deriva-horizontal-inversa",
} as const;

const FLOTAR_NOMBRE = {
  suave: "flotar-suave",
  medio: "flotar-medio",
  amplio: "flotar-amplio",
} as const;

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
            animationName: `${DERIVA_NOMBRE[capa.direccion]}, ${FLOTAR_NOMBRE[capa.flotar]}`,
            animationDuration: `${capa.derivaS}s, ${capa.flotarS}s`,
            animationDelay: `${capa.delay}s, ${capa.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
