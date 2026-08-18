"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!email) return setMessage("Escribe tu email");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) setMessage(json?.error || "No se pudo enviar el correo");
      else
        setMessage(
          "Si ese email tiene una cuenta, te hemos enviado un enlace para restablecer la contraseña."
        );
    } catch (err) {
      setMessage((err as Error).message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-site flex min-h-[60vh] max-w-md items-center py-16">
      <div className="w-full">
        <h1 className="section-title">Olvidé mi contraseña</h1>
        <p className="mt-2 text-sm text-charcoal/60">
          Te enviaremos un enlace a tu email para crear una contraseña nueva.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3 outline-none focus:border-clay"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>

          {message && <p className="text-sm text-charcoal/70">{message}</p>}

          <div className="text-center">
            <Link
              href="/admin/login"
              className="text-sm text-clay hover:underline"
            >
              ← Volver al acceso
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
