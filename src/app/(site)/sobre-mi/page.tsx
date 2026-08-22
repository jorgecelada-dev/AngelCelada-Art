import CabeceraPagina from "@/components/CabeceraPagina";
import { createClient } from "@/lib/supabase/server";
import type { ContenidoSobreMi } from "@/types";

export const metadata = {
  title: "Sobre mí — ArteCelada",
};

export const revalidate = 0;

const TEXTO_POR_DEFECTO = {
  historia:
    "Escribe aquí de dónde vienes, cómo empezaste a pintar y qué te llevó a especializarte en arte orgánico. Este es el espacio para conectar emocionalmente con quien visita la web: qué sientes al crear, qué momento de tu vida marcó tu forma de pintar, y por qué eliges materiales naturales.",
  background:
    "Formación, exposiciones, premios o menciones relevantes, colaboraciones, años de trayectoria. Puedes usar una lista breve si prefieres un formato de currículum artístico.",
  tecnicas:
    "Describe el proceso: qué pigmentos naturales usas (tierras, óxidos, carbón vegetal, resinas), sobre qué superficies pintas (lino, madera, papel artesanal), y qué hace único tu proceso creativo frente al arte convencional.",
};

export default async function SobreMiPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("contenido_sobre_mi")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .single();

  const contenido = data as ContenidoSobreMi | null;
  const historia = contenido?.historia || TEXTO_POR_DEFECTO.historia;
  const background = contenido?.background || TEXTO_POR_DEFECTO.background;
  const tecnicas = contenido?.tecnicas || TEXTO_POR_DEFECTO.tecnicas;

  return (
    <>
      <CabeceraPagina titulo="Sobre mí" />

      <section className="container-site max-w-3xl py-16">
        <div className="mt-10 space-y-12 whitespace-pre-line leading-relaxed text-charcoal/80">
          <div>
            <h2 className="mb-3 text-2xl font-serif text-charcoal">
              Mi historia
            </h2>
            <p>
              <span className="efecto-revelado-texto">{historia}</span>
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-serif text-charcoal">
              Background
            </h2>
            <p>
              <span className="efecto-revelado-texto">{background}</span>
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-serif text-charcoal">
              Técnicas y materiales
            </h2>
            <p>
              <span className="efecto-revelado-texto">{tecnicas}</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
