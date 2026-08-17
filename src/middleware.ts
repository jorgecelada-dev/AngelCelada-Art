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
  // Propaga la ruta actual en una cabecera, para que los Server Components
  // (como AdminBar) puedan saber si están dentro de /admin sin repetir la
  // comprobación de sesión que ya hace este middleware.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return response;
  }

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
            response = NextResponse.next({
              request: { headers: requestHeaders },
            });
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

  if (user && isAdminAllowed(user.email) && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Corre en todas las rutas (para poder propagar x-pathname a AdminBar),
  // pero la comprobación de sesión de arriba solo se ejecuta para /admin.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
