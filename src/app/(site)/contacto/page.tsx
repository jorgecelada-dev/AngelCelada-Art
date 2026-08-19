import ContactoForm from "./ContactoForm";

export const metadata = {
  title: "Contacto — ArteCelada",
};

export default function ContactoPage() {
  return (
    <section className="container-site max-w-xl py-16">
      <h1 className="section-title">
        <span
          className="efecto-revelado-texto"
          style={{ animationDelay: "0.15s" }}
        >
          Contacto
        </span>
      </h1>
      <p className="mt-4 text-charcoal/70">
        <span
          className="efecto-revelado-texto"
          style={{ animationDelay: "0.25s" }}
        >
          ¿Tienes alguna pregunta sobre una obra, un encargo personalizado o
          quieres visitar el estudio? Escríbeme y te responderé lo antes
          posible.
        </span>
      </p>

      <div className="mt-10">
        <ContactoForm />
      </div>
    </section>
  );
}
