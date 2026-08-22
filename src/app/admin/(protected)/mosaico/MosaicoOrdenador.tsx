"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import type { Obra } from "@/types";

type NombreContenedor = "panel" | "grid";
type Grupos = Record<NombreContenedor, Obra[]>;

function esNombreContenedor(id: UniqueIdentifier): id is NombreContenedor {
  return id === "panel" || id === "grid";
}

// Miniatura de una obra, usada tanto en la lista del panel como en la
// cuadrícula. El punto de agarre a la izquierda/arriba es lo único que
// arrastra; el resto de la tarjeta queda libre (para el botón de quitar).
function TarjetaObra({
  obra,
  contenedor,
}: {
  obra: Obra;
  contenedor: NombreContenedor;
}) {
  if (contenedor === "grid") {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg bg-charcoal/10">
        {obra.imagen_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={obra.imagen_url} alt="" className="h-full w-full object-cover" />
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-charcoal/85 to-transparent px-2 pb-1.5 pt-5 text-xs text-cream">
          {obra.titulo}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-white p-2">
      {obra.imagen_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={obra.imagen_url}
          alt=""
          className="h-11 w-11 flex-none rounded-md object-cover"
        />
      )}
      <span className="min-w-0 truncate text-sm">{obra.titulo}</span>
    </div>
  );
}

function ObraArrastrable({
  obra,
  contenedor,
  onQuitar,
}: {
  obra: Obra;
  contenedor: NombreContenedor;
  onQuitar?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: obra.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative ${isDragging ? "z-10 opacity-30" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none active:cursor-grabbing"
      >
        <TarjetaObra obra={obra} contenedor={contenedor} />
      </div>

      {contenedor === "grid" && onQuitar && (
        <button
          type="button"
          onClick={onQuitar}
          aria-label="Quitar del mosaico"
          className="absolute right-1.5 top-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/70 text-sm leading-none text-cream hover:bg-charcoal"
        >
          ×
        </button>
      )}
    </div>
  );
}

function Contenedor({
  id,
  children,
  vacio,
  hayContenido,
  className,
}: {
  id: NombreContenedor;
  children: React.ReactNode;
  vacio: React.ReactNode;
  hayContenido: boolean;
  className: string;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`min-h-[120px] rounded-xl ${className}`}>
      {hayContenido ? children : vacio}
    </div>
  );
}

export default function MosaicoOrdenador({
  obrasIniciales,
}: {
  obrasIniciales: Obra[];
}) {
  const supabase = createClient();
  const [grupos, setGrupos] = useState<Grupos>(() => ({
    grid: obrasIniciales.filter((o) => o.orden_manual !== null),
    panel: obrasIniciales.filter((o) => o.orden_manual === null),
  }));
  const [activa, setActiva] = useState<Obra | null>(null);
  const [guardando, setGuardando] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function encontrarContenedor(id: UniqueIdentifier): NombreContenedor | null {
    if (esNombreContenedor(id)) return id;
    if (grupos.panel.some((o) => o.id === id)) return "panel";
    if (grupos.grid.some((o) => o.id === id)) return "grid";
    return null;
  }

  function onDragStart(event: DragStartEvent) {
    const obra =
      grupos.panel.find((o) => o.id === event.active.id) ??
      grupos.grid.find((o) => o.id === event.active.id) ??
      null;
    setActiva(obra);
  }

  // Mueve la obra de un contenedor a otro mientras se arrastra, para que
  // el hueco se vea en tiempo real (el reordenamiento dentro del mismo
  // contenedor se resuelve al soltar, en onDragEnd).
  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const desde = encontrarContenedor(active.id);
    const hacia = encontrarContenedor(over.id);
    if (!desde || !hacia || desde === hacia) return;

    setGrupos((prev) => {
      const origen = prev[desde];
      const destino = prev[hacia];
      const indiceActivo = origen.findIndex((o) => o.id === active.id);
      if (indiceActivo === -1) return prev;

      const indiceOver = destino.findIndex((o) => o.id === over.id);
      const nuevoIndice = indiceOver >= 0 ? indiceOver : destino.length;

      return {
        ...prev,
        [desde]: origen.filter((o) => o.id !== active.id),
        [hacia]: [
          ...destino.slice(0, nuevoIndice),
          origen[indiceActivo],
          ...destino.slice(nuevoIndice),
        ],
      };
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiva(null);
    if (!over) return;

    const desde = encontrarContenedor(active.id);
    const hacia = encontrarContenedor(over.id);
    if (!desde || !hacia) return;

    let siguiente = grupos;

    if (desde === hacia) {
      const lista = grupos[hacia];
      const indiceActivo = lista.findIndex((o) => o.id === active.id);
      const indiceOver = lista.findIndex((o) => o.id === over.id);
      if (indiceActivo !== -1 && indiceOver !== -1 && indiceActivo !== indiceOver) {
        siguiente = { ...grupos, [hacia]: arrayMove(lista, indiceActivo, indiceOver) };
        setGrupos(siguiente);
      }
    }

    persistir(siguiente.grid, siguiente.panel);
  }

  function quitarDelMosaico(obraId: string) {
    const obra = grupos.grid.find((o) => o.id === obraId);
    if (!obra) return;
    const siguiente = {
      grid: grupos.grid.filter((o) => o.id !== obraId),
      panel: [obra, ...grupos.panel],
    };
    setGrupos(siguiente);
    persistir(siguiente.grid, siguiente.panel);
  }

  async function persistir(grid: Obra[], panel: Obra[]) {
    setGuardando(true);
    const gridConOrden = grid.map((o, i) => ({ ...o, orden_manual: i }));
    const panelAQuitar = panel.filter((o) => o.orden_manual !== null);

    try {
      await Promise.all([
        ...gridConOrden.map((o) =>
          supabase.from("obras").update({ orden_manual: o.orden_manual }).eq("id", o.id)
        ),
        ...panelAQuitar.map((o) =>
          supabase.from("obras").update({ orden_manual: null }).eq("id", o.id)
        ),
      ]);
      setGrupos({
        grid: gridConOrden,
        panel: panel.map((o) => (o.orden_manual !== null ? { ...o, orden_manual: null } : o)),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-charcoal/40">
          {guardando ? "Guardando…" : "Guardado"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <div>
          <h2 className="mb-3 text-sm font-medium text-charcoal/70">
            Sin colocar ({grupos.panel.length})
          </h2>
          <SortableContext items={grupos.panel.map((o) => o.id)} strategy={verticalListSortingStrategy}>
            <Contenedor
              id="panel"
              hayContenido={grupos.panel.length > 0}
              className="space-y-2 bg-charcoal/5 p-3"
              vacio={
                <p className="p-3 text-xs text-charcoal/40">
                  Todas tus obras visibles están colocadas en el mosaico.
                </p>
              }
            >
              {grupos.panel.map((obra) => (
                <ObraArrastrable key={obra.id} obra={obra} contenedor="panel" />
              ))}
            </Contenedor>
          </SortableContext>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-charcoal/70">
            Mosaico de /obras y portada
          </h2>
          <SortableContext items={grupos.grid.map((o) => o.id)} strategy={rectSortingStrategy}>
            <Contenedor
              id="grid"
              hayContenido={grupos.grid.length > 0}
              className="grid grid-cols-3 gap-2 border-2 border-dashed border-charcoal/15 p-3 sm:grid-cols-4"
              vacio={
                <p className="p-6 text-center text-xs text-charcoal/40">
                  Arrastra aquí obras del panel de la izquierda para fijar su posición.
                </p>
              }
            >
              {grupos.grid.map((obra) => (
                <ObraArrastrable
                  key={obra.id}
                  obra={obra}
                  contenedor="grid"
                  onQuitar={() => quitarDelMosaico(obra.id)}
                />
              ))}
            </Contenedor>
          </SortableContext>
        </div>
      </div>

      <DragOverlay>
        {activa && (
          <div className="w-40">
            <TarjetaObra obra={activa} contenedor="grid" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
