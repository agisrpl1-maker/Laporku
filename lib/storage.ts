import "server-only";
import { randomUUID } from "node:crypto";
import { supabaseServer } from "./supabase";

export const BUCKET_FOTO = "foto-laporan";

const EKSTENSI: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Mengunggah foto kerusakan ke Supabase Storage dan mengembalikan URL publiknya. */
export async function unggahFotoLaporan(file: File): Promise<string> {
  const ext = EKSTENSI[file.type] ?? "jpg";
  const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const storage = supabaseServer().storage.from(BUCKET_FOTO);
  const { error } = await storage.upload(path, bytes, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Gagal mengunggah foto: ${error.message}`);
  }

  const { data } = storage.getPublicUrl(path);
  return data.publicUrl;
}

/** Menghapus foto dari Supabase Storage bila laporan dihapus admin (abaikan jika gagal). */
export async function hapusFotoLaporan(fotoUrl: string | null | undefined): Promise<void> {
  if (!fotoUrl) return;
  const penanda = `/storage/v1/object/public/${BUCKET_FOTO}/`;
  const idx = fotoUrl.indexOf(penanda);
  if (idx === -1) return;
  const path = fotoUrl.slice(idx + penanda.length);
  if (!path) return;
  await supabaseServer().storage.from(BUCKET_FOTO).remove([path]);
}
