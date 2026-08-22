import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import type { Obra } from "@/types";

// Grosor fijo de la "caja" que representa el cuadro en AR: un plano puro
// (grosor 0) se ve raro y da problemas de sombra en algunos visores, así
// que se simula un lienzo fino en vez de una lámina de grosor cero.
const GROSOR_M = 0.015;

type ObraParaModelo = Pick<Obra, "imagen_url" | "ancho_cm" | "alto_cm">;

function cargarTextura(url: string): Promise<THREE.Texture> {
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (textura) => {
        textura.colorSpace = THREE.SRGBColorSpace;
        resolve(textura);
      },
      undefined,
      reject
    );
  });
}

// Escena mínima reutilizada tanto para el export GLB (Android) como USDZ
// (iPhone): una caja fina con las medidas reales del cuadro en metros y la
// foto ya subida como textura en la cara frontal (+z, la que mira a cámara
// por defecto en la vista inline y en AR).
export async function construirEscena(obra: ObraParaModelo): Promise<THREE.Scene> {
  if (!obra.imagen_url || !obra.ancho_cm || !obra.alto_cm) {
    throw new Error(
      "La obra necesita imagen y medidas en cm para generar la vista AR."
    );
  }

  const textura = await cargarTextura(obra.imagen_url);
  const anchoM = obra.ancho_cm / 100;
  const altoM = obra.alto_cm / 100;

  // El USDZExporter de three.js no soporta materiales de doble cara (los
  // ignora en silencio) NI varios materiales en una misma malla (los
  // descarta enteros) — comprobado leyendo su código fuente y probando
  // con un fichero real. Además, en paredes lisas/poco texturizadas el
  // anclaje automático de AR Quick Look a veces "tumba" la pieza en vez
  // de dejarla de pie, así que puede acabar viéndose desde cualquier
  // cara de la caja, no solo la frontal.
  //
  // Para que se vea la foto se mire desde donde se mire, en vez de una
  // caja con una sola cara texturizada, son seis mallas independientes
  // (una por cara), cada una con un solo material — la foto en las seis,
  // aunque en los cantos finos se vea muy recortada.
  const mitadAncho = anchoM / 2;
  const mitadAlto = altoM / 2;
  const mitadGrosor = GROSOR_M / 2;

  function crearCara(
    ancho: number,
    alto: number,
    posicion: [number, number, number],
    rotacion: [number, number, number]
  ): THREE.Mesh {
    const malla = new THREE.Mesh(
      new THREE.PlaneGeometry(ancho, alto),
      new THREE.MeshStandardMaterial({ map: textura, roughness: 0.85 })
    );
    malla.position.set(...posicion);
    malla.rotation.set(...rotacion);
    return malla;
  }

  const HPI = Math.PI / 2;
  const caras = [
    crearCara(anchoM, altoM, [0, 0, mitadGrosor], [0, 0, 0]), // frontal (+z)
    crearCara(anchoM, altoM, [0, 0, -mitadGrosor], [0, Math.PI, 0]), // trasera (-z)
    crearCara(anchoM, GROSOR_M, [0, mitadAlto, 0], [-HPI, 0, 0]), // superior (+y)
    crearCara(anchoM, GROSOR_M, [0, -mitadAlto, 0], [HPI, 0, 0]), // inferior (-y)
    crearCara(GROSOR_M, altoM, [mitadAncho, 0, 0], [0, HPI, 0]), // derecha (+x)
    crearCara(GROSOR_M, altoM, [-mitadAncho, 0, 0], [0, -HPI, 0]), // izquierda (-x)
  ];

  const escena = new THREE.Scene();
  caras.forEach((cara) => escena.add(cara));
  return escena;
}

export async function generarGLB(escena: THREE.Scene): Promise<Blob> {
  const exportador = new GLTFExporter();
  const resultado = await exportador.parseAsync(escena, { binary: true });
  if (!(resultado instanceof ArrayBuffer)) {
    throw new Error("La exportación GLB no devolvió datos binarios.");
  }
  return new Blob([resultado], { type: "model/gltf-binary" });
}

export async function generarUSDZ(escena: THREE.Scene): Promise<Blob> {
  const exportador = new USDZExporter();
  const bytes = await exportador.parseAsync(escena, {
    includeAnchoringProperties: true,
    ar: {
      anchoring: { type: "plane" },
      // El cuadro va en la pared, no en el suelo: le decimos a AR Quick
      // Look que prefiera anclarlo a una superficie vertical.
      planeAnchoring: { alignment: "vertical" },
    },
  });
  return new Blob([bytes.buffer as ArrayBuffer], { type: "model/vnd.usdz+zip" });
}
