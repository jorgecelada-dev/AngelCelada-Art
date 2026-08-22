import Link from "next/link";

// CSS puro (sin JS): se aplica desde el primer pintado del HTML, sin
// depender de que React hidrate antes.
//
// Sin fondo propio: el fondo global de la página (FondoParallax, en el
// layout) ya se anima solo de por sí, así que se ve igual de "vivo" aquí
// detrás sin necesidad de un sistema aparte. Tener uno propio causaba un
// destello al volver a portada desde otra página: el hero se
// desmonta/monta con cada transición, así que su fondo arrancaba de
// cero justo cuando el fondo global (que nunca se desmonta) ya llevaba
// rato animándose — se notaba el cambio brusco entre los dos.
export default function HeroAnimado() {
  return (
    <section className="container-site relative flex flex-col items-center gap-8 overflow-x-clip py-24 text-center md:py-32">
      <span
        className="animate-entrada-izquierda text-sm uppercase tracking-[0.3em] text-clay"
        style={{ animationDelay: "0.05s" }}
      >
        <span
          className="efecto-mecanografia"
          style={{ animationDelay: "0.7s, 2.3s" }}
        >
          Arte orgánico hecho a mano
        </span>
      </span>
      <h1
        className="animate-entrada-derecha max-w-3xl text-4xl leading-tight md:text-6xl"
        style={{ animationDelay: "0.15s" }}
      >
        <span
          className="efecto-revelado-texto"
          style={{ animationDelay: "0.5s" }}
        >
          <span className="texto-brillo">
            Cuadros que nacen de la tierra, el color y el tiempo.
          </span>
        </span>
      </h1>
      <p
        className="animate-entrada-izquierda max-w-xl text-charcoal/70"
        style={{ animationDelay: "0.28s" }}
      >
        <span
          className="efecto-revelado-texto"
          style={{ animationDelay: "0.85s" }}
        >
          Bienvenido/a a mi espacio. Aquí encontrarás cada obra original,
          pintada con materiales naturales, junto con la historia que hay
          detrás de cada una.
        </span>
      </p>
      <div
        className="animate-entrada-suave flex justify-center"
        style={{ animationDelay: "0.42s" }}
      >
        <Link
          href="/obras"
          className="btn-primary btn-brillo transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Ver colecciones
        </Link>
      </div>
    </section>
  );
}
