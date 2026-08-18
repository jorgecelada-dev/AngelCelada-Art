"use client";

import { useState } from "react";

export default function CambiarContrasenaEmail({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function enviar() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) setMessage(json?.error || "No se pudo enviar el correo");
      else setMessage("Email enviado. Revisa tu bandeja de entrada.");
    } catch (err) {
      setMessage((err as Error).message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={enviar}
        disabled={loading || !email}
        className="btn-secondary text-sm"
      >
        {loading ? "Enviando…" : "Enviar email para cambiar contraseña"}
      </button>
      {message && <p className="mt-3 text-sm text-charcoal/70">{message}</p>}
    </div>
  );
}
