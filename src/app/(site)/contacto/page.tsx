import ContactoForm from "./ContactoForm";

export const metadata = {
  title: "Contacto — ArteCelada",
};

export default function ContactoPage() {
  return (
    <section className="container-site max-w-xl py-16">
      <h1 className="section-title">Contacto</h1>
      <p className="mt-4 text-charcoal/70">
        ¿Tienes alguna pregunta sobre una obra, un encargo personalizado o
        quieres visitar el estudio? Escríbeme y te responderé lo antes
        posible.
      </p>

      <div className="mt-10">
        <ContactoForm />
      </div>
    </section>
  );
}
