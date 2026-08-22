"use client";

import { useEffect, useState } from "react";

const CLAVE = "artecelada:favoritos";

// Favoritos por navegador, sin cuenta ni servidor (igual que "Tu
// espacio": "tu foto nunca sale de tu navegador"). Un pequeño pub/sub en
// memoria mantiene sincronizadas todas las tarjetas abiertas a la vez en
// la misma pestaña — el evento nativo "storage" del navegador no llega a
// la propia pestaña que hace el cambio, solo a las demás.
let cache: string[] | null = null;
const listeners = new Set<() => void>();

function leer(): string[] {
  if (cache) return cache;
  if (typeof window === "undefined") return [];
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    cache = crudo ? (JSON.parse(crudo) as string[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function guardar(siguiente: string[]) {
  cache = siguiente;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(siguiente));
  } catch {
    // Modo privado, cuota llena, etc.: el favorito no persiste entre
    // sesiones, pero no rompe nada durante la sesión actual.
  }
  listeners.forEach((l) => l());
}

export function toggleFavorito(id: string) {
  const actuales = leer();
  const siguiente = actuales.includes(id)
    ? actuales.filter((f) => f !== id)
    : [...actuales, id];
  guardar(siguiente);
}

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setFavoritos(leer());
    setListo(true);
    const actualizar = () => setFavoritos(leer());
    listeners.add(actualizar);
    return () => {
      listeners.delete(actualizar);
    };
  }, []);

  return {
    favoritos,
    // Antes de montar en el cliente no se sabe aún qué hay en
    // localStorage: "listo" evita mostrar un corazón vacío un instante
    // y que luego "parpadee" a lleno.
    listo,
    esFavorito: (id: string) => favoritos.includes(id),
  };
}
