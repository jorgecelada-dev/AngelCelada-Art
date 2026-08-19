"use client";

import { useMemo, useState } from "react";
import type { Obra } from "@/types";
import MosaicoObras from "./MosaicoObras";
import { COLORES_OBRA } from "@/lib/colores";

const TAMANOS = [
  { valor: "pequeno", label: "Pequeño (hasta 50 cm)", test: (max: number) => max <= 50 },
  { valor: "mediano", label: "Mediano (50-100 cm)", test: (max: number) => max > 50 && max <= 100 },
  { valor: "grande", label: "Grande (más de 100 cm)", test: (max: number) => max > 100 },
] as const;

function tamanoDe(obra: Obra): string | null {
  if (!obra.ancho_cm || !obra.alto_cm) return null;
  const max = Math.max(obra.ancho_cm, obra.alto_cm);
  return TAMANOS.find((t) => t.test(max))?.valor ?? null;
}

function alternar<T>(set: Set<T>, valor: T): Set<T> {
  const siguiente = new Set(set);
  if (siguiente.has(valor)) siguiente.delete(valor);
  else siguiente.add(valor);
  return siguiente;
}

export default function FiltrosObras({ obras }: { obras: Obra[] }) {
  const [tamanos, setTamanos] = useState<Set<string>>(new Set());
  const [colores, setColores] = useState<Set<string>>(new Set());
  const [anios, setAnios] = useState<Set<number>>(new Set());

  const aniosDisponibles = useMemo(
    () =>
      Array.from(
        new Set(obras.map((o) => o.anio).filter((a): a is number => Boolean(a)))
      ).sort((a, b) => b - a),
    [obras]
  );
  const coloresDisponibles = useMemo(
    () => COLORES_OBRA.filter((c) => obras.some((o) => o.color_principal === c.valor)),
    [obras]
  );
  const tamanosDisponibles = useMemo(
    () => TAMANOS.filter((t) => obras.some((o) => tamanoDe(o) === t.valor)),
    [obras]
  );

  const filtradas = useMemo(() => {
    return obras.filter((obra) => {
      if (tamanos.size > 0 && !tamanos.has(tamanoDe(obra) ?? "")) return false;
      if (colores.size > 0 && !colores.has(obra.color_principal ?? "")) return false;
      if (anios.size > 0 && !anios.has(obra.anio ?? -1)) return false;
      return true;
    });
  }, [obras, tamanos, colores, anios]);

  const hayOpcionesDeFiltro =
    tamanosDisponibles.length > 0 ||
    coloresDisponibles.length > 0 ||
    aniosDisponibles.length > 0;
  const hayFiltrosActivos = tamanos.size > 0 || colores.size > 0 || anios.size > 0;

  if (!hayOpcionesDeFiltro) {
    return <MosaicoObras obras={obras} />;
  }

  return (
    <div className="grid grid-cols-[104px_1fr] items-start gap-4 sm:grid-cols-[170px_1fr] sm:gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">
      <aside className="space-y-6 rounded-xl bg-charcoal p-3 text-cream sm:space-y-8 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-cream/50 sm:text-sm">
            Filtrar
          </h2>
          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={() => {
                setTamanos(new Set());
                setColores(new Set());
                setAnios(new Set());
              }}
              className="text-xs text-clay underline underline-offset-2 hover:text-cream"
            >
              Borrar
            </button>
          )}
        </div>

        {tamanosDisponibles.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-medium sm:text-sm">Tamaño</h3>
            <div className="space-y-2">
              {tamanosDisponibles.map((t) => (
                <label
                  key={t.valor}
                  className="flex items-start gap-2 text-xs text-cream/70 sm:text-sm"
                >
                  <input
                    type="checkbox"
                    checked={tamanos.has(t.valor)}
                    onChange={() => setTamanos((s) => alternar(s, t.valor))}
                    className="mt-0.5"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {coloresDisponibles.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-medium sm:text-sm">Color principal</h3>
            <div className="space-y-2">
              {coloresDisponibles.map((c) => (
                <label
                  key={c.valor}
                  className="flex items-center gap-2 text-xs text-cream/70 sm:text-sm"
                >
                  <input
                    type="checkbox"
                    checked={colores.has(c.valor)}
                    onChange={() => setColores((s) => alternar(s, c.valor))}
                  />
                  <span
                    className="h-3 w-3 flex-none rounded-full border border-cream/20"
                    style={{ background: c.swatch }}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {aniosDisponibles.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-medium sm:text-sm">Año</h3>
            <div className="space-y-2">
              {aniosDisponibles.map((a) => (
                <label
                  key={a}
                  className="flex items-center gap-2 text-xs text-cream/70 sm:text-sm"
                >
                  <input
                    type="checkbox"
                    checked={anios.has(a)}
                    onChange={() => setAnios((s) => alternar(s, a))}
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div>
        {filtradas.length === 0 ? (
          <p className="text-center text-charcoal/60">
            Ninguna obra coincide con estos filtros.
          </p>
        ) : (
          <MosaicoObras obras={filtradas} compacto />
        )}
      </div>
    </div>
  );
}
