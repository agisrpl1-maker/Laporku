import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, tokenValid } from "@/lib/session";

/**
 * Pemeriksaan awal: semua URL /admin tanpa sesi valid langsung dialihkan ke /login.
 * Ini hanya lapisan pertama; halaman & Server Action admin tetap memeriksa ulang
 * sesi lewat requireAdmin().
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await tokenValid(token, Date.now()))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
