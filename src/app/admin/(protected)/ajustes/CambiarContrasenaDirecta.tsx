"use client";

import { useState } from "react";

export default function CambiarContrasenaDirecta() {
  const [emailMode, setEmailMode] = useState<"acelada" | "jorge" | "other">(
    "acelada"
  );
  const [otherEmail, setOtherEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function validateClient() {
    if (emailMode === "other" && !otherEmail) return "Escribe un email";
    if (password !== confirm) return "Las contraseñas no coinciden";
    if (password.length < 8)
      return "La contraseña debe tener al menos 8 caracteres";
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    )
      return "La contraseña debe incluir mayúscula, minúscula y número";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const clientError = validateClient();
    if (clientError) return setMessage(clientError);

    setLoading(true);
    try {
      const email =
        emailMode === "acelada"
          ? "acelada64@gmail.com"
          : emailMode === "jorge"
          ? "jorgeceladaa2@gmail.com"
          : otherEmail;

      const res = await fetch(`/api/admin/users/reset-password-by-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        setMessage(json?.error || "Error desconocido");
      } else {
        setMessage(`Contraseña de ${email} cambiada correctamente.`);
        setPassword("");
        setConfirm("");
      }
    } catch (err) {
      setMessage((err as Error).message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Cuenta</label>
        <select
          value={emailMode}
          onChange={(e) => setEmailMode(e.target.value as typeof emailMode)}
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white px-3 py-2 text-sm"
        >
          <option value="acelada">Ángel Celada (acelada64@gmail.com)</option>
          <option value="jorge">Jorge (jorgeceladaa2@gmail.com)</option>
          <option value="other">Otro email</option>
        </select>
        {emailMode === "other" && (
          <input
            value={otherEmail}
            onChange={(e) => setOtherEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            className="mt-2 w-full rounded-lg border border-charcoal/20 bg-white px-3 py-2 text-sm"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Nueva contraseña</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-charcoal/50">
          Mínimo 8 caracteres, con mayúscula, minúscula y número.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Confirmar contraseña
        </label>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          type="password"
          required
          className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-secondary text-sm"
      >
        {loading ? "Cambiando…" : "Cambiar contraseña"}
      </button>

      {message && <p className="text-sm text-charcoal/70">{message}</p>}
    </form>
  );
}
