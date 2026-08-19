import Link from "next/link";

// CSS puro (ver RevelarEnVista.tsx): evita el flash de contenido visible
// antes de que React hidrate.
export default function HeroAnimado() {
  return (
    <section className="container-site flex flex-col items-center gap-8 py-24 text-center md:py-32">
      <span
        className="animate-entrada-subida text-sm uppercase tracking-[0.3em] text-clay"
        style={{ animationDelay: "0.1s" }}
      >
        Arte orgánico hecho a mano
      </span>
      <h1
        className="animate-entrada-subida max-w-3xl text-4xl leading-tight md:text-6xl"
        style={{ animationDelay: "0.2s" }}
      >
        Cuadros que nacen de la tierra, el color y el tiempo.
      </h1>
      <p
        className="animate-entrada-subida max-w-xl text-charcoal/70"
        style={{ animationDelay: "0.32s" }}
      >
        Bienvenido/a a mi espacio. Aquí encontrarás cada obra original,
        pintada con materiales naturales, junto con la historia que hay
        detrás de cada una.
      </p>
      <div
        className="animate-entrada-subida flex flex-wrap justify-center gap-4"
        style={{ animationDelay: "0.44s" }}
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
