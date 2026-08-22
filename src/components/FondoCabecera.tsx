const ANCHO_TILE = 1440;

export type SeccionCabecera =
  | "obras"
  | "laminas"
  | "espacio"
  | "sobre-mi"
  | "contacto";

function capasDe(seccion: SeccionCabecera) {
  return [
    {
      src: `/img/capa-cabecera-${seccion}-01.svg`,
      direccion: "izq" as const,
      duracionS: 52,
    },
    {
      src: `/img/capa-cabecera-${seccion}-02.svg`,
      direccion: "der" as const,
      duracionS: 40,
    },
  ];
}

// Fondo de las cabeceras de sección (Obras, Láminas, Tu espacio, Sobre
// mí, Contacto): dos capas oscuras onduladas moviéndose entre sí, mismo
// lenguaje visual y misma técnica que el fondo ambiental de toda la web
// (FondoOndas) — derivan horizontalmente en bucle perfecto, solo
// transform (nada de background-position, que obliga a repintar).
// Absoluto (no fijo) porque aquí va encajado dentro de la cabecera de
// cada página, no de toda la pantalla. Cada sección tiene su propio par
// de capas (mismo trazo ondulado, solo cambia el color) para que no
// todas las páginas compartan el mismo "negro".
export default function FondoCabecera({ seccion }: { seccion: SeccionCabecera }) {
  const capas = capasDe(seccion);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {capas.map((capa) => (
        <div
          key={capa.src}
          className="fondo-ondas-deriva absolute inset-y-0 will-change-transform"
          style={{
            left: -ANCHO_TILE,
            right: -ANCHO_TILE,
            backgroundImage: `url(${capa.src})`,
            backgroundRepeat: "repeat-x",
            backgroundSize: `${ANCHO_TILE}px 100%`,
            animationName:
              capa.direccion === "izq" ? "deriva-horizontal" : "deriva-horizontal-inversa",
            animationDuration: `${capa.duracionS}s`,
          }}
        />
      ))}
    </div>
  );
}
