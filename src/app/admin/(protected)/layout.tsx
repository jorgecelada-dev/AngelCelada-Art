import Link from "next/link";
import LogoutButton from "./LogoutButton";
import AdminMobileMenu from "./AdminMobileMenu";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#DDD5C4]">
      <div className="container-site py-10">
        <div className="relative mb-10 flex items-center justify-between border-b border-charcoal/10 pb-6">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-serif text-xl">
              Panel privado
            </Link>
            <nav className="hidden gap-6 text-sm md:flex">
              <Link href="/admin" className="hover:underline">
                Obras
              </Link>
              <Link href="/admin/nueva-obra" className="hover:underline">
                Añadir obra
              </Link>
              <Link href="/admin/colecciones" className="hover:underline">
                Colecciones
              </Link>
              <Link href="/admin/entornos" className="hover:underline">
                Entornos
              </Link>
              <Link href="/admin/pedidos" className="hover:underline">
                Pedidos
              </Link>
              <Link href="/admin/mensajes" className="hover:underline">
                Mensajes
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link href="/" className="text-sm text-clay hover:underline">
              ← Ver web pública
            </Link>
            <Link href="/admin/ajustes" className="text-sm hover:underline">
              Ajustes
            </Link>
            <LogoutButton />
          </div>

          <AdminMobileMenu />
        </div>
        {children}
      </div>
    </div>
  );
}
