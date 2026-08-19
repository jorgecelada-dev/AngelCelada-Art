"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";

const links = [
  { href: "/obras", label: "Obras" },
  { href: "/laminas", label: "Láminas" },
  { href: "/mi-espacio", label: "Tu espacio" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-cream/90 backdrop-blur">
      <div className="container-site relative flex h-20 items-center justify-between">
        <Link href="/" className="font-serif text-xl font-bold tracking-wide">
          ArteCelada
        </Link>

        <nav className="hidden gap-1 md:flex">
          {links.map((link) => {
            const activo =
              pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={activo ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm tracking-wide transition ${
                  activo
                    ? "bg-charcoal text-cream"
                    : "text-charcoal/80 hover:text-charcoal"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/obras" className="btn-primary hidden md:inline-flex">
          Comprar obra
        </Link>

        <MobileMenu links={links} />
      </div>
    </header>
  );
}
