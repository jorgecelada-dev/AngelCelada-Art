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

// Contenido 3D reutilizado tanto para el export GLB (Android) como USDZ
// (iPhone): una caja fina con las medidas reales del cuadro en metros y la
// foto ya subida como textura, en su orientación "natural" — ancho en X,
// alto en Y, cara frontal mirando a +Z (como cualquier objeto normal:
// arriba es arriba, de frente es de frente). generarUSDZ() la reorienta
// por su cuenta para AR Quick Look (ver comentario allí); generarGLB() la
// usa tal cual, porque ar-placement="wall" de model-viewer/Android sí
// espera esta orientación natural.
export async function construirEscena(obra: ObraParaModelo): Promise<THREE.Object3D> {
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

  const contenido = new THREE.Group();
  caras.forEach((cara) => contenido.add(cara));

  // Ninguno de los dos exportadores actualiza las matrices de transform
  // por su cuenta (USDZExporter no lo hace nunca; GLTFExporter solo
  // llama a updateMatrix() en el nodo que está procesando en ese
  // momento). Sin esto, cualquier position/rotation fijados a mano se
  // quedan sin aplicar en el objeto exportado — pasa desapercibido en
  // caras individuales solo por casualidad si otro export concurrente
  // ya las ha "horneado" antes como efecto secundario, así que se hace
  // explícito aquí para no depender de esa coincidencia.
  contenido.updateMatrixWorld(true);
  return contenido;
}

export async function generarGLB(contenido: THREE.Object3D): Promise<Blob> {
  const exportador = new GLTFExporter();
  const resultado = await exportador.parseAsync(contenido, { binary: true });
  if (!(resultado instanceof ArrayBuffer)) {
    throw new Error("La exportación GLB no devolvió datos binarios.");
  }
  return new Blob([resultado], { type: "model/gltf-binary" });
}

export async function generarUSDZ(contenido: THREE.Object3D): Promise<Blob> {
  // AR Quick Look ancla siempre con la misma convención tanto en suelo
  // como en pared: el eje +Y del propio modelo pasa a ser "hacia fuera
  // de la superficie" (normal del plano detectado). Nuestro contenido
  // está construido de forma natural (arriba = +Y, frente = +Z, como
  // cualquier objeto), así que hace falta girarlo -90° en X SOLO para
  // el USDZ: el frente (+Z) pasa a +Y ("hacia fuera", lo que Quick Look
  // espera) y el alto (+Y) pasa a -Z. El GLB de Android no se toca: su
  // ar-placement="wall" ya asume la orientación natural.
  //
  // Se clona en vez de reutilizar el original para no afectar al export
  // GLB, que puede estar corriendo en paralelo sobre el mismo contenido.
  const grupoOrientadoPared = new THREE.Group();
  grupoOrientadoPared.add(contenido.clone(true));
  grupoOrientadoPared.rotation.x = -Math.PI / 2;

  // USDZExporter trata el objeto que se le pasa directamente como "la
  // escena": solo exporta el transform de sus hijos, no el suyo propio
  // (igual que una THREE.Scene normal, cuyo propio transform tampoco
  // se usa nunca). Sin este envoltorio de más, el giro de
  // grupoOrientadoPared se descartaría en silencio, tal cual pasaba
  // antes de este cambio (comprobado exportando y leyendo el .usda:
  // el nodo salía con matriz identidad pese al rotation.x fijado).
  const raiz = new THREE.Group();
  raiz.add(grupoOrientadoPared);
  raiz.updateMatrixWorld(true);

  const exportador = new USDZExporter();
  const bytes = await exportador.parseAsync(raiz, {
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
