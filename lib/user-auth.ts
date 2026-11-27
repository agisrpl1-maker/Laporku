import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { supabaseServer } from "./supabase";
import { bacaTokenPengguna, USER_SESSION_COOKIE } from "./user-session";
import type { Pengguna } from "./types";

/** Mengembalikan data pengguna yang sedang masuk, atau null jika belum masuk. */
export async function getPenggunaAktif(): Promise<Pengguna | null> {
  await connection();
  const token = (await cookies()).get(USER_SESSION_COOKIE)?.value;
  const userId = await bacaTokenPengguna(token, Date.now());
  if (!userId) return null;

  const { data, error } = await supabaseServer()
    .from("pengguna")
    .select("id, nama, email")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Pengguna;
}
