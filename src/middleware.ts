// Protege todas las rutas /admin (excepto /admin/login): si no hay sesión
// de Supabase válida, redirige al login del artista.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminAllowed } from "@/lib/admin";

function createFallbackSupabaseAuth() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  };
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

  const supabase = hasSupabaseConfig
    ? createServerClient(supabaseUrl!, supabaseAnonKey!, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: { name: string; value: string; options: CookieOptions }[]
          ) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      })
    : createFallbackSupabaseAuth();

  const user = hasSupabaseConfig
    ? (await supabase.auth.getUser()).data.user
    : null;

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (user && !isAdminAllowed(user.email) && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("error", "not-authorized");
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
