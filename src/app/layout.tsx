import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-worksans",
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
    <html lang="es" className={`${playfair.variable} ${workSans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
