import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import type { Obra } from "@/types";

// Grosor fijo de la "caja" que representa el cuadro en AR: un plano puro
// (grosor 0) se ve raro y da problemas de sombra en algunos visores, así
// que se simula un lienzo fino en vez de una lámina de grosor cero.
const GROSOR_M = 0.015;
const COLOR_CANTO = 0x2b2b28; // charcoal del sitio

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

  // Dos mallas independientes, cada una con UN solo material (no un
  // array de materiales por cara): el USDZExporter de three.js solo
  // soporta un material por malla y descarta en silencio cualquier
  // malla con material múltiple (comprobado leyendo su código — con un
  // array de materiales exportaba un .usdz vacío, sin avisar de error).
  const cuerpo = new THREE.Mesh(
    new THREE.BoxGeometry(anchoM, altoM, GROSOR_M),
    new THREE.MeshStandardMaterial({ color: COLOR_CANTO, roughness: 0.9 })
  );
  cuerpo.castShadow = true;

  const frente = new THREE.Mesh(
    new THREE.PlaneGeometry(anchoM, altoM),
    new THREE.MeshStandardMaterial({ map: textura, roughness: 0.85 })
  );
  frente.position.z = GROSOR_M / 2 + 0.0005;

  const escena = new THREE.Scene();
  escena.add(cuerpo);
  escena.add(frente);
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
