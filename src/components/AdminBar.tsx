import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdminAllowed } from "@/lib/admin";

export default async function AdminBar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminAllowed(user.email)) return null;

  return (
    <div className="flex h-9 items-center justify-between bg-charcoal px-4 text-xs tracking-wide text-cream md:px-8">
      <Link href="/" className="text-cream/80 transition hover:text-clay">
        ← Ver web pública
      </Link>
      <span className="text-cream/50">Sesión de administrador</span>
      <Link href="/admin" className="text-cream/80 transition hover:text-clay">
        Panel privado →
      </Link>
    </div>
  );
}
