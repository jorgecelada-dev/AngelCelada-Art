import FondoOndas, { type CapaOnda } from "./FondoOndas";

// Fondo del hero de portada: mismo sistema que el resto del sitio
// (FondoOndas), con una base opaca color crema para tapar el fondo
// global de la página detrás (así no se mezclan los dos). Un poco más
// lento que la primera versión, para que se sienta calmado.
const CAPAS: CapaOnda[] = [
  { src: "/img/capa-08.svg", height: 629, opacity: 0.5, direccion: "izq", derivaS: 58, flotar: "suave", flotarS: 21, delay: 0 },
  { src: "/img/capa-04.svg", height: 690, opacity: 0.55, direccion: "der", derivaS: 40, flotar: "amplio", flotarS: 16, delay: -3 },
  { src: "/img/capa-06.svg", height: 749, opacity: 0.5, direccion: "izq", derivaS: 50, flotar: "medio", flotarS: 24, delay: -7 },
  { src: "/img/capa-02.svg", height: 841, opacity: 0.6, direccion: "der", derivaS: 33, flotar: "suave", flotarS: 18, delay: -2 },
  { src: "/img/capa-07.svg", height: 510, opacity: 0.35, direccion: "izq", derivaS: 45, flotar: "amplio", flotarS: 29, delay: -5 },
  { src: "/img/capa-09.svg", height: 754, opacity: 0.4, direccion: "der", derivaS: 27, flotar: "medio", flotarS: 14, delay: -6 },
  { src: "/img/capa-13.svg", height: 641, opacity: 0.3, direccion: "izq", derivaS: 36, flotar: "suave", flotarS: 26, delay: -9 },
  { src: "/img/capa-14.svg", height: 708, opacity: 0.42, direccion: "der", derivaS: 48, flotar: "medio", flotarS: 19, delay: -4 },
];

export default function FondoHeroAnimado() {
  return <FondoOndas capas={CAPAS} baseOpaca />;
}
