export const metadata = {
  title: "Sobre mí — ArteCelada",
};

export default function SobreMiPage() {
  return (
    <section className="container-site max-w-3xl py-16">
      <h1 className="section-title">Sobre mí</h1>

      {/*
        TODO (artista): sustituye todos estos textos de ejemplo por tu
        historia, background y técnicas reales. Puedes editarlos aquí
        directamente en el código, o (en una futura mejora) moverlos a una
        tabla de Supabase para editarlos desde el panel /admin.
      */}

      <div className="mt-10 space-y-12 leading-relaxed text-charcoal/80">
        <div>
          <h2 className="mb-3 text-2xl font-serif text-charcoal">
            Mi historia
          </h2>
          <p>
            Escribe aquí de dónde vienes, cómo empezaste a pintar y qué te
            llevó a especializarte en arte orgánico. Este es el espacio para
            conectar emocionalmente con quien visita la web: qué sientes al
            crear, qué momento de tu vida marcó tu forma de pintar, y por qué
            eliges materiales naturales.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-2xl font-serif text-charcoal">
            Background
          </h2>
          <p>
            Formación, exposiciones, premios o menciones relevantes,
            colaboraciones, años de trayectoria. Puedes usar una lista breve
            si prefieres un formato de currículum artístico.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-2xl font-serif text-charcoal">
            Técnicas y materiales
          </h2>
          <p>
            Describe el proceso: qué pigmentos naturales usas (tierras,
            óxidos, carbón vegetal, resinas), sobre qué superficies pintas
            (lino, madera, papel artesanal), y qué hace único tu proceso
            creativo frente al arte convencional.
          </p>
        </div>
      </div>
    </section>
  );
}
