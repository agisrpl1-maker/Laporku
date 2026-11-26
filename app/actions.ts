"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { bacaLaporan, POLA_KODE, type FieldErrors, type LaporanField } from "@/lib/validasi";
import { pesanGalatDb } from "@/lib/format";
import { COOKIE_DUKUNGAN, kodeDidukung } from "@/lib/dukungan";

/* ============================== Buat laporan ============================== */

export type LaporState = {
  percobaan: number;
  pesan?: string;
  errors: FieldErrors<LaporanField>;
  values: Partial<Record<LaporanField, string>>;
};

export async function buatLaporan(prev: LaporState, formData: FormData): Promise<LaporState> {
  const percobaan = prev.percobaan + 1;
  const { values, errors, data, valid } = bacaLaporan(formData);
  if (!valid) {
    return { percobaan, values, errors, pesan: "Periksa kembali isian yang ditandai merah." };
  }

  const db = supabaseServer();

  // Pastikan kategori benar-benar ada.
  const { data: kategori } = await db.from("kategori").select("id").eq("id", data.kategori_id).maybeSingle();
  if (!kategori) {
    return { percobaan, values, errors: { kategori_id: "Kategori tidak ditemukan." } };
  }

  // Aturan: satu pelapor (tanpa peka huruf besar) maksimal 3 laporan berstatus "baru".
  // Dicek di server di sini, dan dijaga lagi oleh trigger di basis data.
  const { data: milikPelapor, error: errCek } = await db
    .from("laporan")
    .select("pelapor")
    .eq("status", "baru");
  if (errCek) return { percobaan, values, errors: {}, pesan: pesanGalatDb(errCek) };
  const jumlahBaru = milikPelapor.filter(
    (l) => l.pelapor.trim().toLowerCase() === data.pelapor.toLowerCase(),
  ).length;
  if (jumlahBaru >= 3) {
    return {
      percobaan,
      values,
      errors: {
        pelapor: `"${data.pelapor}" sudah memiliki 3 laporan berstatus baru. Tunggu hingga salah satunya diproses sebelum melapor lagi.`,
      },
    };
  }

  const { data: baru, error } = await db
    .from("laporan")
    .insert({
      kategori_id: data.kategori_id,
      judul: data.judul,
      deskripsi: data.deskripsi,
      lokasi: data.lokasi,
      pelapor: data.pelapor,
    })
    .select("kode")
    .single();

  if (error) {
    const pesan = pesanGalatDb(error);
    const errKolom: FieldErrors<LaporanField> = error.message.includes("BATAS_LAPORAN_BARU")
      ? { pelapor: pesan }
      : {};
    return { percobaan, values, errors: errKolom, pesan };
  }

  redirect(`/laporan/${baru.kode}?baru=1`);
}

/* ============================== Dukung laporan ============================== */


export type DukungState = { ok?: boolean; pesan?: string };

export async function dukungLaporan(kode: string): Promise<DukungState> {
  if (typeof kode !== "string" || !POLA_KODE.test(kode)) {
    return { ok: false, pesan: "Kode laporan tidak valid." };
  }

  // Satu pengunjung hanya boleh mendukung laporan yang sama satu kali.
  // Daftar kode yang sudah didukung disimpan di cookie httpOnly (tidak bisa dibaca JavaScript).
  const sudah = await kodeDidukung();
  if (sudah.includes(kode)) {
    return { ok: false, pesan: "Anda sudah mendukung laporan ini. Dukungan hanya bisa diberikan satu kali." };
  }

  const { data, error } = await supabaseServer().rpc("tambah_dukungan", { p_kode: kode });
  if (error) return { ok: false, pesan: pesanGalatDb(error) };
  if (data === null) return { ok: false, pesan: "Laporan tidak ditemukan." };

  (await cookies()).set(COOKIE_DUKUNGAN, [...sudah, kode].slice(-200).join("|"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  refresh();
  return { ok: true, pesan: "Terima kasih! Dukungan Anda sudah tercatat." };
}
