import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminBar from "@/components/AdminBar";

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
      <body className="font-sans">
        <AdminBar />
        <Navbar />
        <main className="min-h-[70vh] bg-organic-texture">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
