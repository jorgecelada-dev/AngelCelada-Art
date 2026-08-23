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
    deviceSizes: [480, 768, 1080, 1440],
    imageSizes: [128, 256, 384, 640, 780],
    formats: ["image/webp"],
  },
};

export default nextConfig;
