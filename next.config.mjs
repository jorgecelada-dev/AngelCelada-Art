/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Sustituye esto por el hostname de tu proyecto Supabase, p.ej:
        // hostname: "abcd1234.supabase.co",
        hostname: "*.supabase.co",
      },
    ],
    // Por defecto Next.js prueba 8 deviceSizes x 8 imageSizes x 2
    // formatos (avif+webp): hasta 32 variantes distintas por cada
    // imagen que se pida, y cada combinación nueva de ancho/calidad/
    // formato cuenta como una "transformación" contra la cuota gratuita
    // de Vercel. Para un catálogo de este tamaño eso se agota enseguida
    // sin que haya tráfico real de por medio. Aquí solo los anchos que
    // de verdad se usan en el sitio (mosaico, popup ampliado, ficha de
    // obra, miniaturas de detalle) y un único formato.
    // 2048 como techo (no el 3840 de por defecto, que ya es más ancho
    // que cualquier caso real aquí) para no perder nitidez en pantallas
    // retina/4K viendo la foto grande de una obra: la resolución
    // servida sigue siendo alta, solo se recortan los pasos intermedios
    // que este sitio nunca llega a pedir.
    deviceSizes: [480, 768, 1080, 1440, 2048],
    imageSizes: [128, 256, 384, 640, 780],
    formats: ["image/webp"],
    // Por defecto Next.js solo guarda cada imagen ya optimizada 60
    // segundos: pasado ese minuto, la siguiente visita a la MISMA foto
    // la vuelve a transformar y a escribir en caché de cero, aunque no
    // haya cambiado nada — así se disparaban tanto las transformaciones
    // como (sobre todo) las escrituras en caché con solo repasar la web
    // varias veces. Las fotos de una obra no cambian nunca sin subir un
    // archivo nuevo (que además genera una URL nueva por el sello de
    // tiempo en el nombre), así que no hay riesgo de servir algo
    // desactualizado con una caché larga: 31 días.
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
