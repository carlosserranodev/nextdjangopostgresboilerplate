import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token");
  const isPublicPath = request.nextUrl.pathname.startsWith("/(public)");
  const isLoginPath = request.nextUrl.pathname === "/(public)/login";
  const isRegisterPath = request.nextUrl.pathname === "/(public)/register";
  const isDashboardPath = request.nextUrl.pathname.startsWith("/(protected)");

  // Si el usuario no está autenticado y trata de acceder a una ruta protegida
  if (!token && isDashboardPath) {
    return NextResponse.redirect(new URL("/(public)/login", request.url));
  }

  // Si el usuario está autenticado y trata de acceder a login o register
  if (token && (isLoginPath || isRegisterPath)) {
    return NextResponse.redirect(
      new URL("/(protected)/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
