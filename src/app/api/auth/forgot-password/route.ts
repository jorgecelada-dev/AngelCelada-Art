import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Falta email" }, { status: 400 });

    const supabase = createServerSupabase();

    const redirectTo = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") + "/auth/reset-password";

    const { data, error } = await supabase.auth.resetPasswordForEmail(String(email), { redirectTo });

    if (error) return NextResponse.json({ error: error.message || error }, { status: 500 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 });
  }
}
