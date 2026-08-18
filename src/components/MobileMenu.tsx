"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

const contenedor = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
};

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
            className="absolute left-0 right-0 top-20 border-b border-charcoal/10 bg-cream shadow-lg"
          >
            <motion.nav
              variants={contenedor}
              initial="hidden"
              animate="show"
              className="container-site flex flex-col py-4"
            >
              {links.map((link) => (
                <motion.div key={link.href} variants={item}>
                  <Link
                    href={link.href}
                    onClick={() => setAbierto(false)}
                    className="block border-b border-charcoal/5 py-3 text-sm tracking-wide text-charcoal/80"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={item}>
                <Link
                  href="/obras"
                  onClick={() => setAbierto(false)}
                  className="btn-primary mt-4 text-center"
                >
                  Comprar obra
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
