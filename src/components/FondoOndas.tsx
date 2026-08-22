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

const ANCHO_TILE = 1440;

// Capas de "papel recortado" onduladas (public/img/capa-*.svg), con
// animación propia en CSS puro (sin JS ni scroll): deriva horizontal en
// bucle perfecto + un balanceo/respiración vertical.
//
// Las dos animaciones van en DOS elementos separados (envoltura +
// interior), cada una animando solo "transform" — nunca
// "background-position": esa propiedad obliga al navegador a REPINTAR
// el SVG (con su sombra difuminada) en cada fotograma sobre un área del
// tamaño de toda la página, y con varias capas a la vez eso colapsaba
// el rendimiento a ~3-4 fps (comprobado con el profiler). "transform"
// en cambio lo mueve la GPU sin repintar nada.
//
// La envoltura es más ancha que la pantalla por un tile entero a cada
// lado (por eso el desplazamiento de -1440px a la vuelta del bucle no
// deja ver un hueco), y solo anima translateX; el interior lleva el
// fondo repetido y solo anima translateY/scaleY (el balanceo). Como
// nunca cambian nada salvo transform, el navegador solo rasteriza cada
// capa una vez y luego la desplaza por composición.
//
// "fixed" (no "absolute") a propósito: con "absolute" cada capa medía
// tanto como la página entera (a veces varias pantallas de alto), así
// que aunque ya no repintaba, la GPU seguía teniendo que componer
// texturas enormes en cada fotograma. Fijado al viewport, cada capa
// mide como mucho una pantalla, muchísimo más barato de componer —
// tiene sentido además porque el movimiento ya no está ligado al
// scroll, solo a su propio reloj interno.
export default function FondoOndas({ capas }: { capas: readonly CapaOnda[] }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {capas.map((capa) => (
        <div
          key={capa.src}
          className="fondo-ondas-deriva absolute -top-20 -bottom-20 will-change-transform"
          style={{
            left: -ANCHO_TILE,
            right: -ANCHO_TILE,
            animationName: DERIVA_NOMBRE[capa.direccion],
            animationDuration: `${capa.derivaS}s`,
            animationDelay: `${capa.delay}s`,
          }}
        >
          <div
            className="fondo-ondas-flotar absolute inset-0 will-change-transform"
            style={{
              backgroundImage: `url(${capa.src})`,
              backgroundRepeat: "repeat",
              backgroundSize: `${ANCHO_TILE}px ${capa.height}px`,
              opacity: capa.opacity,
              animationName: FLOTAR_NOMBRE[capa.flotar],
              animationDuration: `${capa.flotarS}s`,
              animationDelay: `${capa.delay}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
