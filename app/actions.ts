"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { bacaLaporan, POLA_KODE, type FieldErrors, type LaporanField } from "@/lib/validasi";
import { pesanGalatDb } from "@/lib/format";
import { getPenggunaAktif } from "@/lib/user-auth";
import { hapusFotoLaporan, unggahFotoLaporan } from "@/lib/storage";

/* ============================== Buat laporan ============================== */

export type LaporState = {
  percobaan: number;
  pesan?: string;
  errors: FieldErrors<LaporanField>;
  values: Partial<Record<Exclude<LaporanField, "foto">, string>>;
};

export async function buatLaporan(prev: LaporState, formData: FormData): Promise<LaporState> {
  const percobaan = prev.percobaan + 1;
  const { values, errors, data, foto, valid } = bacaLaporan(formData);
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

  let fotoUrl: string | null = null;
  if (foto) {
    try {
      fotoUrl = await unggahFotoLaporan(foto);
    } catch (err) {
      const pesan = err instanceof Error ? err.message : "Gagal mengunggah foto.";
      return { percobaan, values, errors: { foto: pesan }, pesan };
    }
  }

  const { data: baru, error } = await db
    .from("laporan")
    .insert({
      kategori_id: data.kategori_id,
      judul: data.judul,
      deskripsi: data.deskripsi,
      lokasi: data.lokasi,
      pelapor: data.pelapor,
      foto_url: fotoUrl,
    })
    .select("kode")
    .single();

  if (error) {
    if (fotoUrl) await hapusFotoLaporan(fotoUrl);
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

  // Pembatasan mutlak berbasis akun: wajib masuk terlebih dahulu.
  const pengguna = await getPenggunaAktif();
  if (!pengguna) {
    return { ok: false, pesan: "Silakan masuk terlebih dahulu untuk mendukung laporan ini." };
  }

  // Fungsi atomik di basis data menjamin 1 akun maksimal 1 dukungan per laporan
  // (constraint UNIQUE(laporan_id, pengguna_id)).
  const { data, error } = await supabaseServer().rpc("tambah_dukungan_pengguna", {
    p_kode: kode,
    p_pengguna_id: pengguna.id,
  });
  if (error) return { ok: false, pesan: pesanGalatDb(error) };
  if (data === null) return { ok: false, pesan: "Laporan tidak ditemukan." };

  refresh();
  return { ok: true, pesan: "Terima kasih! Dukungan Anda sudah tercatat." };
}
