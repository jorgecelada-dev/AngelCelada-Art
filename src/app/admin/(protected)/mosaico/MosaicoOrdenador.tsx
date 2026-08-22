"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
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
import { claseCelda } from "@/components/MosaicoObras";
import { calcularAspectoYRotacion } from "@/lib/orientacion";
import type { Obra } from "@/types";

type NombreContenedor = "panel" | "grid";
type Grupos = Record<NombreContenedor, Obra[]>;

function esNombreContenedor(id: UniqueIdentifier): id is NombreContenedor {
  return id === "panel" || id === "grid";
}

// Miniatura de una obra, usada tanto en la lista del panel como en la
// cuadrícula. En la cuadrícula ocupa toda la celda (la forma la marca el
// contenedor con col-span/row-span, no esta pieza).
function TarjetaObra({
  obra,
  contenedor,
}: {
  obra: Obra;
  contenedor: NombreContenedor;
}) {
  if (contenedor === "grid") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-charcoal/10">
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

// El punto de agarre cubre toda la tarjeta salvo el botón de quitar; en
// la cuadrícula aplica exactamente la misma clase col-span/row-span que
// usa el mosaico real (claseCelda), para que la forma y el hueco que deja
// cada obra sean idénticos a como se van a ver en la web.
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
  const claseForma = contenedor === "grid" ? claseCelda(obra) : "";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative ${claseForma} ${isDragging ? "z-10 opacity-30" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
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
  // Refleja siempre el último estado calculado, para poder persistir en
  // onDragEnd sin depender del cierre (closure) de grupos, que puede
  // quedarse un render por detrás de las actualizaciones en onDragOver.
  const gruposRef = useRef(grupos);
  const [activa, setActiva] = useState<Obra | null>(null);
  const [guardando, setGuardando] = useState(false);

  function actualizarGrupos(actualizar: (prev: Grupos) => Grupos) {
    setGrupos((prev) => {
      const siguiente = actualizar(prev);
      gruposRef.current = siguiente;
      return siguiente;
    });
  }

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

  // Reordena en vivo mientras se arrastra (tanto dentro del mismo
  // contenedor como entre el panel y la cuadrícula), para que el hueco se
  // vea al momento en vez de solo al soltar.
  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const desde = encontrarContenedor(active.id);
    const hacia = encontrarContenedor(over.id);
    if (!desde || !hacia) return;

    actualizarGrupos((prev) => {
      const origen = prev[desde];
      const indiceActivo = origen.findIndex((o) => o.id === active.id);
      if (indiceActivo === -1) return prev;

      if (desde === hacia) {
        const indiceOver = origen.findIndex((o) => o.id === over.id);
        if (indiceOver === -1 || indiceActivo === indiceOver) return prev;
        return { ...prev, [hacia]: arrayMove(origen, indiceActivo, indiceOver) };
      }

      const destino = prev[hacia];
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
    setActiva(null);
    if (!event.over) return;
    // El orden ya quedó resuelto en vivo durante onDragOver; aquí solo
    // toca guardar el resultado final.
    persistir(gruposRef.current.grid, gruposRef.current.panel);
  }

  function quitarDelMosaico(obraId: string) {
    const obra = grupos.grid.find((o) => o.id === obraId);
    if (!obra) return;
    const siguiente = {
      grid: grupos.grid.filter((o) => o.id !== obraId),
      panel: [obra, ...grupos.panel],
    };
    actualizarGrupos(() => siguiente);
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
      actualizarGrupos(() => ({
        grid: gridConOrden,
        panel: panel.map((o) => (o.orden_manual !== null ? { ...o, orden_manual: null } : o)),
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
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
          <p className="mb-3 text-xs text-charcoal/50">
            La forma de cada casilla (1x1, 1x2, 2x1, 2x2, 1x3, 3x1) la
            decide la proporción y el tamaño real de cada obra, igual que
            en la web: aquí solo se elige el orden.
          </p>
          <SortableContext items={grupos.grid.map((o) => o.id)} strategy={rectSortingStrategy}>
            <Contenedor
              id="grid"
              hayContenido={grupos.grid.length > 0}
              className="grid auto-rows-[90px] grid-cols-4 gap-2 [grid-auto-flow:dense] border-2 border-dashed border-charcoal/15 p-3"
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
          // Fuera de la cuadrícula col-span/row-span no tiene efecto, así
          // que aquí se aproxima la forma con la proporción real de la
          // obra en vez de la clase de celda.
          <div
            className="w-40 max-w-[40vw]"
            style={{ aspectRatio: calcularAspectoYRotacion(activa).aspecto }}
          >
            <TarjetaObra obra={activa} contenedor="grid" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
