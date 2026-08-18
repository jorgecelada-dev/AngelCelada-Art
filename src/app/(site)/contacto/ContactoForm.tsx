"use client";

import { useState } from "react";

export default function ContactoForm() {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");

    const form = e.currentTarget;
    const data = {
      nombre: (form.elements.namedItem("nombre") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      telefono: (form.elements.namedItem("telefono") as HTMLInputElement)
        .value,
      mensaje: (form.elements.namedItem("mensaje") as HTMLTextAreaElement)
        .value,
    };

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      setEstado("ok");
      form.reset();
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <p className="rounded-xl bg-sage/10 p-4 text-sage">
        ¡Gracias! Tu mensaje se ha enviado correctamente.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium">
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3 outline-none focus:border-clay"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3 outline-none focus:border-clay"
        />
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium">
          Teléfono (opcional)
        </label>
        <input
          id="telefono"
          name="telefono"
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3 outline-none focus:border-clay"
        />
      </div>

      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={5}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3 outline-none focus:border-clay"
        />
      </div>

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="btn-primary w-full"
      >
        {estado === "enviando" ? "Enviando…" : "Enviar mensaje"}
      </button>

      {estado === "error" && (
        <p className="text-sm text-red-600">
          Algo ha ido mal. Inténtalo de nuevo en unos minutos.
        </p>
      )}
    </form>
  );
}
