"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const contenedor = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function HeroAnimado() {
  return (
    <motion.section
      variants={contenedor}
      initial="hidden"
      animate="show"
      className="container-site flex flex-col items-center gap-8 py-24 text-center md:py-32"
    >
      <motion.span
        variants={item}
        className="text-sm uppercase tracking-[0.3em] text-clay"
      >
        Arte orgánico hecho a mano
      </motion.span>
      <motion.h1
        variants={item}
        className="max-w-3xl text-4xl leading-tight md:text-6xl"
      >
        Cuadros que nacen de la tierra, el color y el tiempo.
      </motion.h1>
      <motion.p variants={item} className="max-w-xl text-charcoal/70">
        Bienvenido/a a mi espacio. Aquí encontrarás cada obra original,
        pintada con materiales naturales, junto con la historia que hay
        detrás de cada una.
      </motion.p>
      <motion.div variants={item} className="flex flex-wrap justify-center gap-4">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link href="/obras" className="btn-primary">
            Ver colecciones
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link href="/sobre-mi" className="btn-secondary">
            Conocer mi historia
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
