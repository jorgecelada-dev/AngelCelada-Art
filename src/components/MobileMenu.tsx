"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileMenu({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={abierto}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
      >
        <span
          className={`block h-0.5 w-6 bg-charcoal transition-transform ${
            abierto ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-charcoal transition-opacity ${
            abierto ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-charcoal transition-transform ${
            abierto ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {abierto && (
        <div className="absolute left-0 right-0 top-20 border-b border-charcoal/10 bg-cream shadow-lg">
          <nav className="container-site flex flex-col py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setAbierto(false)}
                className="border-b border-charcoal/5 py-3 text-sm tracking-wide text-charcoal/80"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/obras"
              onClick={() => setAbierto(false)}
              className="btn-primary mt-4 text-center"
            >
              Comprar obra
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
