import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminAllowed } from "@/lib/admin";

function validatePassword(pw: unknown) {
  if (typeof pw !== "string") return "La contraseña debe ser una cadena";
  if (pw.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  // Requerir mayúscula, minúscula y número
  if (!/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/[0-9]/.test(pw))
    return "La contraseña debe incluir mayúscula, minúscula y número";
  return null;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
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
    const { password } = body ?? {};

    const pwError = validatePassword(password);
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

    const admin = createAdminClient();

    const targetUserId = params.id;
    if (!targetUserId) {
      return NextResponse.json({ error: "Falta id de usuario" }, { status: 400 });
    }

    // No registrar la contraseña en logs.
    const { data, error } = await admin.auth.admin.updateUserById(targetUserId, {
      password: password,
    });

    if (error) {
      return NextResponse.json({ error: error.message || error }, { status: 500 });
    }

    // Opcional: aquí podríamos crear un registro de auditoría.
    return NextResponse.json({ ok: true, user: data.user }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 });
  }
}
