import ContactoForm from "./ContactoForm";
import CabeceraPagina from "@/components/CabeceraPagina";

export const metadata = {
  title: "Contacto — ArteCelada",
};

export default function ContactoPage() {
  return (
    <>
      <CabeceraPagina titulo="Contacto" seccion="contacto" />

      <section className="container-site max-w-xl py-16">
        <p className="text-charcoal/70">
          <span
            className="efecto-revelado-texto"
            style={{ animationDelay: "0.15s" }}
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
    </>
  );
}
