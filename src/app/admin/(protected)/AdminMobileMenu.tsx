"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

const links = [
  { href: "/admin", label: "Obras" },
  { href: "/admin/nueva-obra", label: "Añadir obra" },
  { href: "/admin/mosaico", label: "Mosaico" },
  { href: "/admin/sobre-mi", label: "Sobre mí" },
  { href: "/admin/colecciones", label: "Colecciones" },
  { href: "/admin/entornos", label: "Entornos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/mensajes", label: "Mensajes" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

const contenedor = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
};

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
        <motion.span
          animate={abierto ? { y: 8, rotate: 45 } : { y: 0, rotate: 0 }}
          transition={{ duration: 0.25 }}
          className="block h-0.5 w-6 bg-charcoal"
        />
        <motion.span
          animate={{ opacity: abierto ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="block h-0.5 w-6 bg-charcoal"
        />
        <motion.span
          animate={abierto ? { y: -8, rotate: -45 } : { y: 0, rotate: 0 }}
          transition={{ duration: 0.25 }}
          className="block h-0.5 w-6 bg-charcoal"
        />
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-40 border-b border-charcoal/10 bg-[#DDD5C4] shadow-lg"
          >
            <motion.nav
              variants={contenedor}
              initial="hidden"
              animate="show"
              className="container-site flex flex-col py-2"
            >
              {links.map((link) => (
                <motion.div key={link.href} variants={item}>
                  <Link
                    href={link.href}
                    onClick={() => setAbierto(false)}
                    className="block border-b border-charcoal/10 py-3 text-sm"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={item} className="pt-3">
                <LogoutButton />
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
