import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json();
  const { nombre, email, telefono, mensaje, tipo, encargoTipo } = body ?? {};

  if (!nombre || !email || !mensaje) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios" },
      { status: 400 }
    );
  }

  const esPresupuesto = tipo === "presupuesto";

  const supabase = createAdminClient();

  const { error } = await supabase.from("mensajes_contacto").insert({
    nombre,
    email,
    telefono: telefono || null,
    mensaje,
    tipo: esPresupuesto ? "presupuesto" : "general",
    encargo_tipo: esPresupuesto && encargoTipo ? encargoTipo : null,
  });

  if (error) {
    console.error("Error guardando mensaje de contacto:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el mensaje" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
