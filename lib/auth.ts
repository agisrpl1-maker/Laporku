import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { SESSION_COOKIE, tokenValid } from "./session";

/** Mengecek apakah permintaan saat ini berasal dari admin yang sudah login. */
export async function isAdmin(): Promise<boolean> {
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return tokenValid(token, Date.now());
}

/**
 * Wajib dipanggil di setiap halaman admin DAN setiap Server Action admin.
 * Pengunjung yang belum login dialihkan ke /login.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/login");
  }
}
