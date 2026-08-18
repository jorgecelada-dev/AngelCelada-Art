import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MosaicoObras from "@/components/MosaicoObras";
import type { Obra } from "@/types";

export default async function HomePage() {
  const supabase = createClient();

  const { data: destacadas } = await supabase
    .from("obras")
    .select("*")
    .eq("destacada", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const obras = (destacadas ?? []) as Obra[];

  return (
    <>
      {/* Hero */}
      <section className="container-site flex flex-col items-center gap-8 py-24 text-center md:py-32">
        <span className="text-sm uppercase tracking-[0.3em] text-clay">
          Arte orgánico hecho a mano
        </span>
        <h1 className="max-w-3xl text-4xl leading-tight md:text-6xl">
          Cuadros que nacen de la tierra, el color y el tiempo.
        </h1>
        <p className="max-w-xl text-charcoal/70">
          Bienvenido/a a mi espacio. Aquí encontrarás cada obra original,
          pintada con materiales naturales, junto con la historia que hay
          detrás de cada una.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/obras" className="btn-primary">
            Ver colecciones
          </Link>
          <Link href="/sobre-mi" className="btn-secondary">
            Conocer mi historia
          </Link>
        </div>
      </section>

      {/* Obras destacadas */}
      {obras.length > 0 && (
        <section className="container-site py-16">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="section-title">Obras destacadas</h2>
            <Link href="/obras" className="text-sm underline underline-offset-4">
              Ver todas
            </Link>
          </div>
          <MosaicoObras obras={obras} />
        </section>
      )}

      {/* Nota de contenido de ejemplo */}
      {obras.length === 0 && (
        <section className="container-site py-16 text-center text-charcoal/60">
          <p>
            Aún no hay obras marcadas como &ldquo;destacada&rdquo; en la base
            de datos. Añade obras desde el panel privado en{" "}
            <Link href="/admin" className="underline">
              /admin
            </Link>
            .
          </p>
        </section>
      )}
    </>
  );
}
