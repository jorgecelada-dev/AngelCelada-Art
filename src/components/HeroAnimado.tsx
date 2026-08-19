import Link from "next/link";

// CSS puro (sin JS): se aplica desde el primer pintado del HTML, sin
// depender de que React hidrate antes.
export default function HeroAnimado() {
  return (
    <section className="container-site flex flex-col items-center gap-8 overflow-x-clip py-24 text-center md:py-32">
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
        Bienvenido/a a mi espacio. Aquí encontrarás cada obra original,
        pintada con materiales naturales, junto con la historia que hay
        detrás de cada una.
      </p>
      <div
        className="animate-entrada-suave flex flex-wrap justify-center gap-4"
        style={{ animationDelay: "0.42s" }}
      >
        <Link
          href="/obras"
          className="btn-primary transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Ver colecciones
        </Link>
        <Link
          href="/sobre-mi"
          className="btn-secondary transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Conocer mi historia
        </Link>
      </div>
    </section>
  );
}
