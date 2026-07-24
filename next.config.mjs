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
  },
};

export default nextConfig;
