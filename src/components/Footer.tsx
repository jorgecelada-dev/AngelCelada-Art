export default function Footer() {
  return (
    <footer className="border-t border-charcoal/10 py-12">
      <div className="container-site flex flex-col items-center gap-4 text-center text-sm text-charcoal/70 md:flex-row md:justify-between md:text-left">
        <p>
          © {new Date().getFullYear()} ArteCelada. Todas las obras son
          originales.
        </p>
        <div className="flex gap-6">
          <a href="/contacto" className="hover:text-charcoal">
            Contacto
          </a>
          <a href="/sobre-mi" className="hover:text-charcoal">
            Sobre mí
          </a>
        </div>
      </div>
    </footer>
  );
}
