// Dibuja recortando al centro, igual que el object-cover de CSS, en vez
// de estirar la imagen para rellenar el recuadro (lo que la deformaría).
export function dibujarCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = dw / dh;

  let sx: number;
  let sy: number;
  let sw: number;
  let sh: number;

  if (imgRatio > boxRatio) {
    sh = img.naturalHeight;
    sw = sh * boxRatio;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / boxRatio;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

// Dibuja la imagen COMPLETA contenida dentro del recuadro (nunca la
// recorta), centrada, dejando un margen en el eje que sobre si su
// proporción no coincide exactamente con la del recuadro. Al contrario
// que dibujarCover (pensado para fondos, donde recortar no importa),
// esta es la que hay que usar para la obra en sí: el recuadro se calcula
// a partir de sus medidas reales en cm, que no siempre coinciden exacto
// con la proporción de la foto (encuadre, margen del marco...) — con
// dibujarCover eso recortaba la obra de verdad en cuadros con una
// proporción muy alargada (ej. formatos panorámicos).
export function dibujarContenido(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = dw / dh;

  let drawW: number;
  let drawH: number;
  if (imgRatio > boxRatio) {
    drawW = dw;
    drawH = dw / imgRatio;
  } else {
    drawH = dh;
    drawW = dh * imgRatio;
  }

  const offsetX = dx + (dw - drawW) / 2;
  const offsetY = dy + (dh - drawH) / 2;

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

// Color medio de la pared alrededor de donde va a ir el cuadro, muestreado
// ANTES de dibujarlo. Sirve para teñir luego la obra con la misma luz
// ambiental de la foto real (cálida, fría, tenue...) en vez de que quede
// con sus colores originales "de estudio", que la delatan como pegada.
export function muestrearTonoAmbiente(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): { r: number; g: number; b: number } | null {
  try {
    const margen = Math.max(width, height) * 0.35;
    const sx = Math.max(0, Math.round(x - margen));
    const sy = Math.max(0, Math.round(y - margen));
    const sw = Math.min(ctx.canvas.width, Math.round(x + width + margen)) - sx;
    const sh = Math.min(ctx.canvas.height, Math.round(y + height + margen)) - sy;
    if (sw <= 0 || sh <= 0) return null;

    const datos = ctx.getImageData(sx, sy, sw, sh).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    // Muestreo disperso (no todos los píxeles) para no recorrer millones
    // de valores: con unos cientos de muestras el promedio ya es estable.
    const paso = Math.max(4, Math.floor(datos.length / 4 / 400) * 4);
    for (let i = 0; i < datos.length; i += paso) {
      r += datos[i];
      g += datos[i + 1];
      b += datos[i + 2];
      n++;
    }
    if (n === 0) return null;
    return { r: r / n, g: g / n, b: b / n };
  } catch {
    // getImageData falla si el canvas queda "contaminado" por una imagen
    // sin cabeceras CORS correctas; en ese caso se sigue sin teñido.
    return null;
  }
}

// Sombra suave y difusa bajo el cuadro, más parecida a la de un cuadro
// colgado de verdad que al recorte duro de un ctx.shadow por defecto.
export function dibujarSombraSuave(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.32)";
  ctx.shadowBlur = Math.max(18, width * 0.05);
  ctx.shadowOffsetX = width * 0.012;
  ctx.shadowOffsetY = height * 0.03;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}

// Aplica el tono ambiental muestreado como un tinte muy suave sobre la
// obra ya dibujada, para que "respire" el mismo ambiente que la pared.
export function aplicarTinteAmbiente(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  tono: { r: number; g: number; b: number } | null
) {
  if (!tono) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = `rgb(${tono.r}, ${tono.g}, ${tono.b})`;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}

// Filtro sutil para que la obra no se vea como una imagen digital
// perfecta pegada encima de una fotografía real.
export const FILTRO_INTEGRACION = "saturate(92%) contrast(96%) brightness(0.98)";
