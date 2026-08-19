import type { Metadata } from "next";
import { Domine, PT_Serif } from "next/font/google";
import "./globals.css";

// Pareja tipográfica de estilo periódico: Domine para titulares (con
// pesos gruesos para la negrita) y PT Serif para el cuerpo de texto.
const domine = Domine({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArteCelada — Arte orgánico",
  description:
    "Cuadros de arte orgánico de Ángel Celada, hechos con materiales naturales. Descubre las colecciones, la historia y las técnicas del artista.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${domine.variable} ${ptSerif.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
