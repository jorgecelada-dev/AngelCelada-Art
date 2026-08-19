"use client";

import { useState } from "react";

export default function ContactoForm() {
  const [tipo, setTipo] = useState<"general" | "presupuesto">("general");
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">(
    "idle"
  );

  const esPresupuesto = tipo === "presupuesto";

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
      tipo,
      encargoTipo: esPresupuesto
        ? (form.elements.namedItem("encargo_tipo") as HTMLSelectElement)
            ?.value
        : undefined,
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
        {esPresupuesto
          ? "¡Gracias! He recibido tu solicitud de presupuesto y te responderé lo antes posible."
          : "¡Gracias! Tu mensaje se ha enviado correctamente."}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="inline-flex rounded-full border border-charcoal/15 p-1 text-sm">
        <button
          type="button"
          onClick={() => setTipo("general")}
          className={`rounded-full px-4 py-2 transition ${
            tipo === "general"
              ? "bg-charcoal text-cream"
              : "text-charcoal/70 hover:text-charcoal"
          }`}
        >
          Mensaje general
        </button>
        <button
          type="button"
          onClick={() => setTipo("presupuesto")}
          className={`rounded-full px-4 py-2 transition ${
            esPresupuesto
              ? "bg-charcoal text-cream"
              : "text-charcoal/70 hover:text-charcoal"
          }`}
        >
          Pedir presupuesto
        </button>
      </div>

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

      {esPresupuesto && (
        <div>
          <label htmlFor="encargo_tipo" className="block text-sm font-medium">
            ¿Qué te gustaría encargar?
          </label>
          <select
            id="encargo_tipo"
            name="encargo_tipo"
            required
            defaultValue="personalizado"
            className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3 outline-none focus:border-clay"
          >
            <option value="personalizado">Cuadro personalizado</option>
            <option value="pack">Pack de varias obras</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium">
          {esPresupuesto ? "Cuéntame qué tienes en mente" : "Mensaje"}
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={5}
          placeholder={
            esPresupuesto
              ? "Tamaño aproximado, colores, estilo, plazo, presupuesto orientativo…"
              : undefined
          }
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3 outline-none focus:border-clay"
        />
      </div>

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="btn-primary w-full"
      >
        {estado === "enviando"
          ? "Enviando…"
          : esPresupuesto
          ? "Enviar solicitud de presupuesto"
          : "Enviar mensaje"}
      </button>

      {estado === "error" && (
        <p className="text-sm text-red-600">
          Algo ha ido mal. Inténtalo de nuevo en unos minutos.
        </p>
      )}
    </form>
  );
}
