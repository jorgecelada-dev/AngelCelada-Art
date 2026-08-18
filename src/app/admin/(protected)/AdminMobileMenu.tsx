"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

const links = [
  { href: "/admin", label: "Obras" },
  { href: "/admin/nueva-obra", label: "Añadir obra" },
  { href: "/admin/colecciones", label: "Colecciones" },
  { href: "/admin/entornos", label: "Entornos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/mensajes", label: "Mensajes" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

export default function AdminMobileMenu() {
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
        <div className="absolute left-0 right-0 top-full z-40 border-b border-charcoal/10 bg-[#DDD5C4] shadow-lg">
          <nav className="container-site flex flex-col py-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setAbierto(false)}
                className="border-b border-charcoal/10 py-3 text-sm"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setAbierto(false)}
              className="border-b border-charcoal/10 py-3 text-sm text-clay"
            >
              ← Ver web pública
            </Link>
            <div className="pt-3">
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
