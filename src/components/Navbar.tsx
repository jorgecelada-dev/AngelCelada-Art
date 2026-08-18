import Link from "next/link";
import MobileMenu from "./MobileMenu";

const links = [
  { href: "/obras", label: "Obras" },
  { href: "/mi-espacio", label: "Mi espacio" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-cream/90 backdrop-blur">
      <div className="container-site relative flex h-20 items-center justify-between">
        <Link href="/" className="font-serif text-xl tracking-wide">
          ArteCelada
        </Link>

        <nav className="hidden gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-charcoal/80 transition hover:text-charcoal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/obras" className="btn-primary hidden md:inline-flex">
          Comprar obra
        </Link>

        <MobileMenu links={links} />
      </div>
    </header>
  );
}
