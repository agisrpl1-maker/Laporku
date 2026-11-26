import "server-only";
import { cookies } from "next/headers";
import { POLA_KODE } from "./validasi";

/** Cookie httpOnly berisi daftar kode laporan yang sudah didukung pengunjung ini. */
export const COOKIE_DUKUNGAN = "laporku_dukungan";

export async function kodeDidukung(): Promise<string[]> {
  const nilai = (await cookies()).get(COOKIE_DUKUNGAN)?.value ?? "";
  return nilai.split("|").filter((k) => POLA_KODE.test(k));
}
