import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MosaicoObras from "@/components/MosaicoObras";
import HeroAnimado from "@/components/HeroAnimado";
import RevelarEnVista from "@/components/RevelarEnVista";
import type { Obra } from "@/types";

export const revalidate = 0;

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
      <HeroAnimado />

      {/* Últimas obras */}
      {obras.length > 0 && (
        <section className="container-site py-16">
          <RevelarEnVista className="mb-10 flex items-end justify-between">
            <h2 className="section-title">
              <span
                className="efecto-revelado-texto"
                style={{ animationDelay: "0.15s" }}
              >
                Últimas obras
              </span>
            </h2>
            <Link href="/obras" className="text-sm underline underline-offset-4">
              Ver todas
            </Link>
          </RevelarEnVista>
          <MosaicoObras obras={obras} cuadrada />
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
