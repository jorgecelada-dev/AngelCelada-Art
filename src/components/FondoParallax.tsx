import FondoOndas, { type CapaOnda } from "./FondoOndas";

// Fondo global de toda la web pública: mismo sistema que el hero de
// portada (FondoOndas) — deriva horizontal + balanceo, en CSS puro, sin
// depender del scroll ni de JS. Dieciséis capas (todo public/img/capa-
// 01..16.svg) para que la página se sienta más llena. Direcciones y
// amplitudes de balanceo bien repartidas entre "izq"/"der" y
// "suave"/"medio"/"amplio" para que la diferencia entre capas se note,
// y velocidades algo más lentas que el hero (esto se ve mucho tiempo en
// pantalla, no solo en la portada).
const CAPAS: CapaOnda[] = [
  { src: "/img/capa-08.svg", height: 629, opacity: 0.5, direccion: "izq", derivaS: 62, flotar: "suave", flotarS: 24, delay: 0 },
  { src: "/img/capa-04.svg", height: 690, opacity: 0.55, direccion: "der", derivaS: 44, flotar: "amplio", flotarS: 18, delay: -3 },
  { src: "/img/capa-06.svg", height: 749, opacity: 0.45, direccion: "izq", derivaS: 54, flotar: "medio", flotarS: 27, delay: -9 },
  { src: "/img/capa-02.svg", height: 841, opacity: 0.6, direccion: "der", derivaS: 37, flotar: "suave", flotarS: 20, delay: -5 },
  { src: "/img/capa-05.svg", height: 709, opacity: 0.32, direccion: "izq", derivaS: 47, flotar: "medio", flotarS: 15, delay: -12 },
  { src: "/img/capa-10.svg", height: 845, opacity: 0.5, direccion: "der", derivaS: 30, flotar: "suave", flotarS: 22, delay: -6 },
  { src: "/img/capa-03.svg", height: 536, opacity: 0.5, direccion: "izq", derivaS: 41, flotar: "amplio", flotarS: 30, delay: -15 },
  { src: "/img/capa-07.svg", height: 510, opacity: 0.16, direccion: "der", derivaS: 52, flotar: "medio", flotarS: 19, delay: -8 },
  { src: "/img/capa-01.svg", height: 803, opacity: 0.55, direccion: "izq", derivaS: 34, flotar: "suave", flotarS: 25, delay: -4 },
  { src: "/img/capa-09.svg", height: 754, opacity: 0.28, direccion: "der", derivaS: 58, flotar: "amplio", flotarS: 13, delay: -11 },
  { src: "/img/capa-11.svg", height: 556, opacity: 0.5, direccion: "izq", derivaS: 39, flotar: "medio", flotarS: 21, delay: -7 },
  { src: "/img/capa-12.svg", height: 638, opacity: 0.52, direccion: "der", derivaS: 49, flotar: "suave", flotarS: 28, delay: -14 },
  { src: "/img/capa-13.svg", height: 641, opacity: 0.26, direccion: "izq", derivaS: 32, flotar: "amplio", flotarS: 17, delay: -2 },
  { src: "/img/capa-14.svg", height: 708, opacity: 0.38, direccion: "der", derivaS: 56, flotar: "medio", flotarS: 23, delay: -10 },
  { src: "/img/capa-15.svg", height: 454, opacity: 0.12, direccion: "izq", derivaS: 45, flotar: "suave", flotarS: 31, delay: -16 },
  { src: "/img/capa-16.svg", height: 517, opacity: 0.35, direccion: "der", derivaS: 27, flotar: "medio", flotarS: 16, delay: -13 },
];

// Fondo decorativo de toda la web: capas onduladas (tipo capas de papel
// recortado) que se mueven solas, muy sutil, sin interacción, para que
// nunca interfiera con el contenido real ni con la lectura de pantalla.
export default function FondoParallax() {
  return <FondoOndas capas={CAPAS} />;
}
