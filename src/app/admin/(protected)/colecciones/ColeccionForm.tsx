"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Categoria } from "@/types";

export default function ColeccionForm({
  coleccion,
}: {
  coleccion?: Categoria;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esEdicion = Boolean(coleccion);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      nombre: fd.get("nombre") as string,
      descripcion: (fd.get("descripcion") as string) || null,
    };

    try {
      if (esEdicion && coleccion) {
        const { error: updateError } = await supabase
          .from("categorias")
          .update(payload)
          .eq("id", coleccion.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("categorias")
          .insert(payload);
        if (insertError) throw insertError;
      }

      router.push("/admin/colecciones");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo guardar la colección. Puede que ya exista una con ese nombre."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-6">
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          name="nombre"
          defaultValue={coleccion?.nombre}
          required
          placeholder="Arena, Azules, Bosques…"
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Descripción (opcional)
        </label>
        <textarea
          name="descripcion"
          defaultValue={coleccion?.descripcion ?? ""}
          rows={3}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear colección"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
