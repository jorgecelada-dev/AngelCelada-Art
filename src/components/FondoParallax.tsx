import FondoOndas, { type CapaOnda } from "./FondoOndas";

// Fondo global de toda la web pública: mismo sistema que el hero de
// portada (FondoOndas) — deriva horizontal + balanceo, en CSS puro, sin
// depender del scroll ni de JS. Bajado de 16 a 7 capas (menos elementos
// que animar) y con tonos más oscuros para más contraste — ver
// public/img/capa-01..07.svg. Direcciones y amplitudes de balanceo bien
// repartidas para que la diferencia entre capas se note.
const CAPAS: CapaOnda[] = [
  { src: "/img/capa-01.svg", height: 803, opacity: 0.55, direccion: "izq", derivaS: 46, flotar: "suave", flotarS: 22, delay: 0 },
  { src: "/img/capa-02.svg", height: 841, opacity: 0.6, direccion: "der", derivaS: 34, flotar: "amplio", flotarS: 17, delay: -6 },
  { src: "/img/capa-03.svg", height: 578, opacity: 0.5, direccion: "izq", derivaS: 39, flotar: "medio", flotarS: 25, delay: -12 },
  { src: "/img/capa-04.svg", height: 709, opacity: 0.35, direccion: "der", derivaS: 52, flotar: "suave", flotarS: 15, delay: -3 },
  { src: "/img/capa-05.svg", height: 607, opacity: 0.45, direccion: "izq", derivaS: 30, flotar: "medio", flotarS: 20, delay: -9 },
  { src: "/img/capa-06.svg", height: 609, opacity: 0.4, direccion: "der", derivaS: 42, flotar: "amplio", flotarS: 27, delay: -15 },
  { src: "/img/capa-07.svg", height: 459, opacity: 0.15, direccion: "izq", derivaS: 58, flotar: "suave", flotarS: 19, delay: -5 },
];

// Fondo decorativo de toda la web: capas onduladas (tipo capas de papel
// recortado) que se mueven solas, muy sutil, sin interacción, para que
// nunca interfiera con el contenido real ni con la lectura de pantalla.
export default function FondoParallax() {
  return <FondoOndas capas={CAPAS} />;
}
