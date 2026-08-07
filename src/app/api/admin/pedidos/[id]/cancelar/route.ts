import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminAllowed } from "@/lib/admin";

// El middleware solo protege /admin/:path*, no /api/*, así que esta ruta
// comprueba la sesión y la lista blanca de admins por su cuenta.
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminAllowed(user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  const { data: pedido, error: fetchError } = await adminClient
    .from("pedidos")
    .select("id, obra_id")
    .eq("id", params.id)
    .single();

  if (fetchError || !pedido) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const { error: updateError } = await adminClient
    .from("pedidos")
    .update({ estado: "cancelado" })
    .eq("id", params.id);

  if (updateError) {
    return NextResponse.json(
      { error: "No se pudo cancelar el pedido" },
      { status: 500 }
    );
  }

  if (pedido.obra_id) {
    await adminClient
      .from("obras")
      .update({ disponible: true, estado: "en venta" })
      .eq("id", pedido.obra_id);
  }

  return NextResponse.json({ ok: true });
}
