import "server-only";
import { supabaseServer } from "./supabase";

/** Mengecek di basis data apakah pengguna sudah pernah mendukung laporan ini. */
export async function sudahDidukungPengguna(laporanId: number, penggunaId: number): Promise<boolean> {
  const { data, error } = await supabaseServer()
    .from("dukungan_laporan")
    .select("id")
    .eq("laporan_id", laporanId)
    .eq("pengguna_id", penggunaId)
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}
