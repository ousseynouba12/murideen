import { NextRequest, NextResponse } from "next/server";

const STAFF_ROLES = ["PROPRIETAIRE", "GESTIONNAIRE", "PREPARATION"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/connexion") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const role = request.cookies.get("murideen_role")?.value;
    if (!role || !STAFF_ROLES.includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/connexion";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
