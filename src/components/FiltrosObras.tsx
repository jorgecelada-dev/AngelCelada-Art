"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Obra } from "@/types";
import MosaicoObras from "./MosaicoObras";
import { COLORES_OBRA } from "@/lib/colores";

const TAMANOS = [
  { valor: "pequeno", label: "Pequeño (hasta 50 cm)", test: (max: number) => max <= 50 },
  { valor: "mediano", label: "Mediano (50-100 cm)", test: (max: number) => max > 50 && max <= 100 },
  { valor: "grande", label: "Grande (más de 100 cm)", test: (max: number) => max > 100 },
] as const;

type Grupo = "tamano" | "color" | "anio";

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

// Lista de checkboxes reutilizada tanto en el desplegable móvil como en
// el panel lateral de escritorio, para no duplicar el marcado.
function GrupoCheckbox<T extends string | number>({
  opciones,
  seleccion,
  onToggle,
}: {
  opciones: { valor: T; label: string; swatch?: string }[];
  seleccion: Set<T>;
  onToggle: (valor: T) => void;
}) {
  return (
    <div className="space-y-2">
      {opciones.map((o) => (
        <label
          key={o.valor}
          className="flex items-center gap-2 text-xs text-cream/70 sm:text-sm"
        >
          <input
            type="checkbox"
            checked={seleccion.has(o.valor)}
            onChange={() => onToggle(o.valor)}
          />
          {o.swatch && (
            <span
              className="h-3 w-3 flex-none rounded-full border border-cream/20"
              style={{ background: o.swatch }}
            />
          )}
          {o.label}
        </label>
      ))}
    </div>
  );
}

export default function FiltrosObras({ obras }: { obras: Obra[] }) {
  const [tamanos, setTamanos] = useState<Set<string>>(new Set());
  const [colores, setColores] = useState<Set<string>>(new Set());
  const [anios, setAnios] = useState<Set<number>>(new Set());
  const [grupoAbierto, setGrupoAbierto] = useState<Grupo | null>(null);
  const barraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (barraRef.current && !barraRef.current.contains(e.target as Node)) {
        setGrupoAbierto(null);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

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

  function borrarTodo() {
    setTamanos(new Set());
    setColores(new Set());
    setAnios(new Set());
  }

  const grupos: {
    id: Grupo;
    label: string;
    activo: boolean;
    contenido: React.ReactNode;
  }[] = [
    tamanosDisponibles.length > 0 && {
      id: "tamano" as const,
      label: "Tamaño",
      activo: tamanos.size > 0,
      contenido: (
        <GrupoCheckbox
          opciones={tamanosDisponibles.map((t) => ({ valor: t.valor, label: t.label }))}
          seleccion={tamanos}
          onToggle={(v) => setTamanos((s) => alternar(s, v))}
        />
      ),
    },
    coloresDisponibles.length > 0 && {
      id: "color" as const,
      label: "Color",
      activo: colores.size > 0,
      contenido: (
        <GrupoCheckbox
          opciones={coloresDisponibles.map((c) => ({
            valor: c.valor,
            label: c.label,
            swatch: c.swatch,
          }))}
          seleccion={colores}
          onToggle={(v) => setColores((s) => alternar(s, v))}
        />
      ),
    },
    aniosDisponibles.length > 0 && {
      id: "anio" as const,
      label: "Año",
      activo: anios.size > 0,
      contenido: (
        <GrupoCheckbox
          opciones={aniosDisponibles.map((a) => ({ valor: a, label: String(a) }))}
          seleccion={anios}
          onToggle={(v) => setAnios((s) => alternar(s, v))}
        />
      ),
    },
  ].filter(Boolean) as {
    id: Grupo;
    label: string;
    activo: boolean;
    contenido: React.ReactNode;
  }[];

  return (
    <div className="space-y-6">
      {/* Barra horizontal: en móvil y tablet es la única forma de filtrar,
          más cómoda que un panel lateral estrecho. En escritorio queda
          oculta a favor del panel lateral de abajo. */}
      <div ref={barraRef} className="relative lg:hidden">
        <div className="flex flex-wrap items-center gap-2">
          {grupos.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGrupoAbierto((actual) => (actual === g.id ? null : g.id))}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition ${
                grupoAbierto === g.id || g.activo
                  ? "bg-charcoal text-cream"
                  : "bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10"
              }`}
            >
              {g.label}
              {g.activo && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-medium text-cream">
                  {g.id === "tamano" ? tamanos.size : g.id === "color" ? colores.size : anios.size}
                </span>
              )}
            </button>
          ))}
          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={borrarTodo}
              className="rounded-full px-4 py-2 text-sm text-clay underline underline-offset-2"
            >
              Borrar
            </button>
          )}
        </div>

        {grupoAbierto && (
          <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl bg-charcoal p-4 text-cream shadow-[0_20px_45px_-15px_rgba(0,0,0,0.45)]">
            {grupos.find((g) => g.id === grupoAbierto)?.contenido}
          </div>
        )}
      </div>

      <div className="items-start gap-8 lg:grid lg:grid-cols-[220px_1fr]">
        <aside className="hidden space-y-8 rounded-xl bg-charcoal p-5 text-cream lg:block">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium uppercase tracking-wide text-cream/50">
              Filtrar
            </h2>
            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={borrarTodo}
                className="text-xs text-clay underline underline-offset-2 hover:text-cream"
              >
                Borrar
              </button>
            )}
          </div>

          {grupos.map((g) => (
            <div key={g.id}>
              <h3 className="mb-3 text-sm font-medium">
                {g.id === "color" ? "Color principal" : g.label}
              </h3>
              {g.contenido}
            </div>
          ))}
        </aside>

        <div>
          {filtradas.length === 0 ? (
            <p className="text-center text-charcoal/60">
              Ninguna obra coincide con estos filtros.
            </p>
          ) : (
            <MosaicoObras obras={filtradas} />
          )}
        </div>
      </div>
    </div>
  );
}
