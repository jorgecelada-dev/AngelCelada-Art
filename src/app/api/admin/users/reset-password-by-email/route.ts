import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminAllowed } from "@/lib/admin";

function validatePassword(pw: unknown) {
  if (typeof pw !== "string") return "La contraseña debe ser una cadena";
  if (pw.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (!/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/[0-9]/.test(pw))
    return "La contraseña debe incluir mayúscula, minúscula y número";
  return null;
}

export async function POST(req: Request) {
  try {
    const serverSupabase = createServerSupabase();
    const authRes = await serverSupabase.auth.getUser();
    const currentUser = authRes.data.user;

    if (!currentUser || !currentUser.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!isAdminAllowed(currentUser.email)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { email, password } = body ?? {};
    if (!email) return NextResponse.json({ error: "Falta email" }, { status: 400 });

    const pwError = validatePassword(password);
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

    const admin = createAdminClient();

    const { data: listData, error: listError } = await admin.auth.admin.listUsers();
    if (listError) return NextResponse.json({ error: listError.message || listError }, { status: 500 });

    const users = (listData && (listData as any).users) || [];
    const target = users.find((u: any) => (u.email || "").toLowerCase() === String(email).toLowerCase());
    if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const { data, error } = await admin.auth.admin.updateUserById(target.id, {
      password,
    });

    if (error) return NextResponse.json({ error: error.message || error }, { status: 500 });

    return NextResponse.json({ ok: true, user: data.user }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 });
  }
}
