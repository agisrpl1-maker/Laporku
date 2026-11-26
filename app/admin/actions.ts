"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";
import { bacaKategori, bacaUbahLaporan, type FieldErrors, type UbahField } from "@/lib/validasi";
import { isStatus } from "@/lib/types";
import { pesanGalatDb } from "@/lib/format";

/* Setiap aksi di file ini WAJIB memanggil requireAdmin() terlebih dahulu,
   karena Server Action bisa dipanggil langsung tanpa membuka halamannya. */

function idValid(id: unknown): id is number {
  return typeof id === "number" && Number.isInteger(id) && id > 0;
}

/* =========================== Ubah status & tanggapan =========================== */

export type UbahState = {
  percobaan: number;
  ok?: boolean;
  pesan?: string;
  errors: FieldErrors<UbahField>;
  values?: { status: string; tanggapan: string };
};

export async function ubahLaporan(id: number, prev: UbahState, formData: FormData): Promise<UbahState> {
  await requireAdmin();
  const percobaan = prev.percobaan + 1;
  if (!idValid(id)) return { percobaan, errors: {}, pesan: "ID laporan tidak valid." };

  const db = supabaseServer();
  const { data: lama, error: errLama } = await db.from("laporan").select("status").eq("id", id).maybeSingle();
  if (errLama) return { percobaan, errors: {}, pesan: pesanGalatDb(errLama) };
  if (!lama || !isStatus(lama.status)) return { percobaan, errors: {}, pesan: "Laporan tidak ditemukan." };

  const { values, errors, valid } = bacaUbahLaporan(formData, lama.status);
  if (!valid) return { percobaan, errors, values, pesan: "Perubahan belum disimpan. Periksa isian yang ditandai." };

  const { error } = await db
    .from("laporan")
    .update({ status: values.status, tanggapan: values.tanggapan || null })
    .eq("id", id);
  if (error) return { percobaan, errors: {}, values, pesan: pesanGalatDb(error) };

  refresh();
  return { percobaan, ok: true, errors: {}, pesan: "Perubahan berhasil disimpan." };
}

/* =============================== Hapus laporan =============================== */

export type HapusState = { pesan?: string };

export async function hapusLaporan(id: number): Promise<HapusState> {
  await requireAdmin();
  if (!idValid(id)) return { pesan: "ID laporan tidak valid." };

  const { error } = await supabaseServer().from("laporan").delete().eq("id", id);
  if (error) return { pesan: pesanGalatDb(error) };

  redirect("/admin");
}

/* ================================== Kategori ================================== */

export type KategoriState = { percobaan: number; ok?: boolean; pesan?: string; error?: string; nama?: string };

export async function tambahKategori(prev: KategoriState, formData: FormData): Promise<KategoriState> {
  await requireAdmin();
  const percobaan = prev.percobaan + 1;
  const { nama, error: galat } = bacaKategori(formData);
  if (galat) return { percobaan, nama, error: galat };

  const db = supabaseServer();
  const { data: ada } = await db.from("kategori").select("id").ilike("nama", nama.replace(/[\\%_]/g, "\\$&"));
  if (ada && ada.length > 0) return { percobaan, nama, error: `Kategori "${nama}" sudah ada.` };

  const { error } = await db.from("kategori").insert({ nama });
  if (error) {
    return {
      percobaan,
      nama,
      error: error.code === "23505" ? `Kategori "${nama}" sudah ada.` : pesanGalatDb(error),
    };
  }

  refresh();
  return { percobaan, ok: true, pesan: `Kategori "${nama}" berhasil ditambahkan.` };
}

export async function hapusKategori(id: number): Promise<{ pesan?: string }> {
  await requireAdmin();
  if (!idValid(id)) return { pesan: "ID kategori tidak valid." };

  const db = supabaseServer();
  // Aturan: kategori yang masih dipakai laporan tidak boleh dihapus.
  // Dicek di server, dan dijaga juga oleh foreign key ON DELETE RESTRICT di basis data.
  const { count, error: errHitung } = await db
    .from("laporan")
    .select("id", { count: "exact", head: true })
    .eq("kategori_id", id);
  if (errHitung) return { pesan: pesanGalatDb(errHitung) };
  if ((count ?? 0) > 0) {
    return { pesan: `Kategori ini masih dipakai oleh ${count} laporan sehingga tidak dapat dihapus.` };
  }

  const { error } = await db.from("kategori").delete().eq("id", id);
  if (error) {
    return {
      pesan:
        error.code === "23503"
          ? "Kategori ini masih dipakai oleh laporan sehingga tidak dapat dihapus."
          : pesanGalatDb(error),
    };
  }

  refresh();
  return {};
}
