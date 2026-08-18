"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordContent() {
  const search = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const code = search.get("code");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!code) {
      setMessage(
        "Enlace de recuperación no válido o incompleto. Pide uno nuevo desde \"¿Olvidaste tu contraseña?\"."
      );
      return;
    }
    // El enlace del email trae un código de un solo uso (flujo PKCE); hay
    // que canjearlo por una sesión antes de poder cambiar la contraseña.
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setMessage("El enlace ha caducado o ya se usó. Pide uno nuevo.");
      } else {
        setListo(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (password !== confirm) return setMessage("Las contraseñas no coinciden");
    if (password.length < 8)
      return setMessage("La contraseña debe tener al menos 8 caracteres");

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Contraseña actualizada correctamente. Ya puedes entrar.");
        setTimeout(() => router.push("/admin/login"), 1200);
      }
    } catch (err) {
      setMessage((err as Error).message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-site flex min-h-[60vh] max-w-md items-center py-16">
      <div className="w-full">
        <h1 className="section-title">Establecer nueva contraseña</h1>

        {listo ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium">
                Nueva contraseña
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3 outline-none focus:border-clay"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Confirmar</label>
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type="password"
                required
                className="mt-1 w-full rounded-lg border border-charcoal/20 bg-white/60 px-4 py-3 outline-none focus:border-clay"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        ) : (
          !message && (
            <p className="mt-4 text-sm text-charcoal/60">Comprobando enlace…</p>
          )
        )}

        {message && (
          <p className="mt-4 text-sm text-charcoal/70">{message}</p>
        )}
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="container-site py-16">Cargando…</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
