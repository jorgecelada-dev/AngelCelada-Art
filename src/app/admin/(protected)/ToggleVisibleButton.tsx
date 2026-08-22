"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ToggleVisibleButton({
  obraId,
  visibleInicial,
}: {
  obraId: string;
  visibleInicial: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [visible, setVisible] = useState(visibleInicial);
  const [cargando, setCargando] = useState(false);

  async function alternar() {
    setCargando(true);
    const siguiente = !visible;
    const { error } = await supabase
      .from("obras")
      .update({ visible: siguiente })
      .eq("id", obraId);

    if (!error) {
      setVisible(siguiente);
      router.refresh();
    }
    setCargando(false);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={cargando}
      aria-label={visible ? "Ocultar obra" : "Mostrar obra"}
      aria-pressed={visible}
      title={visible ? "Visible en la web" : "Oculta"}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition disabled:opacity-50 ${
        visible ? "bg-charcoal text-cream" : "bg-charcoal/10 text-charcoal/50"
      }`}
    >
      {visible ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path
            d="M2 12s3.5-7 10-7c1.7 0 3.15.35 4.36.9M22 12s-3.5 7-10 7c-1.7 0-3.15-.35-4.36-.9M9.9 9.9a3 3 0 104.2 4.2M4.5 4.5l15 15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
