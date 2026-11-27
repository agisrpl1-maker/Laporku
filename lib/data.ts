import "server-only";
import { connection } from "next/server";
import { supabaseServer } from "./supabase";
import { POLA_KODE } from "./validasi";
import {
  DAFTAR_STATUS,
  type Kategori,
  type LaporanLengkap,
  type LaporanPublik,
  type Status,
} from "./types";

/** Kolom yang aman untuk publik: nama pelapor sengaja tidak diambil. */
const KOLOM_PUBLIK =
  "id, kode, kategori_id, judul, deskripsi, lokasi, foto_url, status, tanggapan, dukungan, dibuat, diperbarui, kategori(nama)";
const KOLOM_ADMIN = `${KOLOM_PUBLIK}, pelapor`;

export const PER_HALAMAN_PUBLIK = 6;
export const PER_HALAMAN_ADMIN = 10;

export type HasilPaginasi<T> = {
  items: T[];
  total: number;
  halaman: number;
  totalHalaman: number;
  perHalaman: number;
};

/**
 * Setiap fungsi baca memanggil connection() agar data selalu diambil saat permintaan
 * (bukan saat build), sehingga perubahan di basis data langsung terlihat.
 */
function gagal(context: string, message: string): never {
  throw new Error(`Gagal memuat ${context}: ${message}`);
}

export async function getKategori(): Promise<Kategori[]> {
  await connection();
  const { data, error } = await supabaseServer()
    .from("kategori")
    .select("id, nama")
    .order("nama");
  if (error) gagal("kategori", error.message);
  return data;
}

export async function getRingkasan(): Promise<Record<Status, number>> {
  await connection();
  const db = supabaseServer();
  const hasil = await Promise.all(
    DAFTAR_STATUS.map((status) =>
      db.from("laporan").select("id", { count: "exact", head: true }).eq("status", status),
    ),
  );
  const ringkasan = { baru: 0, diproses: 0, selesai: 0 } as Record<Status, number>;
  hasil.forEach(({ count, error }, i) => {
    if (error) gagal("ringkasan", error.message);
    ringkasan[DAFTAR_STATUS[i]] = count ?? 0;
  });
  return ringkasan;
}

export async function getLaporanTerbaru(jumlah = 5): Promise<LaporanPublik[]> {
  await connection();
  const { data, error } = await supabaseServer()
    .from("laporan")
    .select(KOLOM_PUBLIK)
    .order("dibuat", { ascending: false })
    .order("id", { ascending: false })
    .limit(jumlah)
    .returns<LaporanPublik[]>();
  if (error) gagal("laporan terbaru", error.message);
  return data;
}

export type FilterLaporan = {
  kategori?: number;
  status?: Status;
  q?: string;
  halaman?: number;
};

/** Membersihkan kata kunci dari karakter khusus sintaks filter PostgREST. */
function bersihkanKataKunci(q: string): string {
  return q.replace(/[%,()*\\:."']/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

function bangunQueryDaftar(filter: FilterLaporan) {
  let query = supabaseServer().from("laporan").select(KOLOM_PUBLIK, { count: "exact" });
  if (filter.kategori) query = query.eq("kategori_id", filter.kategori);
  if (filter.status) query = query.eq("status", filter.status);
  const q = filter.q ? bersihkanKataKunci(filter.q) : "";
  if (q) {
    query = query.or(`judul.ilike.%${q}%,deskripsi.ilike.%${q}%,lokasi.ilike.%${q}%`);
  }
  return query.order("dibuat", { ascending: false }).order("id", { ascending: false });
}

export async function getDaftarLaporan(filter: FilterLaporan): Promise<HasilPaginasi<LaporanPublik>> {
  await connection();
  const perHalaman = PER_HALAMAN_PUBLIK;
  const halamanDiminta = Math.max(1, Math.floor(filter.halaman ?? 1));
  const mulai = (halamanDiminta - 1) * perHalaman;

  const { data, count, error } = await bangunQueryDaftar(filter)
    .range(mulai, mulai + perHalaman - 1)
    .returns<LaporanPublik[]>();
  if (error) gagal("daftar laporan", error.message);

  const total = count ?? 0;
  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));

  // Bila halaman di URL melebihi jumlah halaman yang tersedia, muat halaman terakhir.
  if (total > 0 && halamanDiminta > totalHalaman) {
    const mulaiAkhir = (totalHalaman - 1) * perHalaman;
    const { data: dataAkhir, error: errAkhir } = await bangunQueryDaftar(filter)
      .range(mulaiAkhir, mulaiAkhir + perHalaman - 1)
      .returns<LaporanPublik[]>();
    if (errAkhir) gagal("daftar laporan", errAkhir.message);
    return { items: dataAkhir ?? [], total, halaman: totalHalaman, totalHalaman, perHalaman };
  }

  return { items: data ?? [], total, halaman: halamanDiminta, totalHalaman, perHalaman };
}

export async function getLaporanByKode(kode: string): Promise<LaporanPublik | null> {
  await connection();
  if (!POLA_KODE.test(kode)) return null;
  const { data, error } = await supabaseServer()
    .from("laporan")
    .select(KOLOM_PUBLIK)
    .eq("kode", kode)
    .returns<LaporanPublik[]>()
    .maybeSingle();
  if (error) gagal("laporan", error.message);
  return data;
}

/* ------------------------------ Khusus admin ------------------------------ */
/* Fungsi di bawah hanya dipanggil dari halaman yang sudah memanggil requireAdmin(). */

export async function getSemuaLaporanAdmin(halaman = 1): Promise<HasilPaginasi<LaporanLengkap>> {
  await connection();
  const perHalaman = PER_HALAMAN_ADMIN;
  const halamanDiminta = Math.max(1, Math.floor(halaman));
  const mulai = (halamanDiminta - 1) * perHalaman;

  const { data, count, error } = await supabaseServer()
    .from("laporan")
    .select(KOLOM_ADMIN, { count: "exact" })
    .order("id", { ascending: false })
    .range(mulai, mulai + perHalaman - 1)
    .returns<LaporanLengkap[]>();
  if (error) gagal("laporan", error.message);

  const total = count ?? 0;
  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));

  if (total > 0 && halamanDiminta > totalHalaman) {
    const mulaiAkhir = (totalHalaman - 1) * perHalaman;
    const { data: dataAkhir, error: errAkhir } = await supabaseServer()
      .from("laporan")
      .select(KOLOM_ADMIN)
      .order("id", { ascending: false })
      .range(mulaiAkhir, mulaiAkhir + perHalaman - 1)
      .returns<LaporanLengkap[]>();
    if (errAkhir) gagal("laporan", errAkhir.message);
    return { items: dataAkhir ?? [], total, halaman: totalHalaman, totalHalaman, perHalaman };
  }

  return { items: data ?? [], total, halaman: halamanDiminta, totalHalaman, perHalaman };
}

export async function getLaporanAdminById(id: number): Promise<LaporanLengkap | null> {
  await connection();
  if (!Number.isInteger(id) || id <= 0) return null;
  const { data, error } = await supabaseServer()
    .from("laporan")
    .select(KOLOM_ADMIN)
    .eq("id", id)
    .returns<LaporanLengkap[]>()
    .maybeSingle();
  if (error) gagal("laporan", error.message);
  return data;
}

export async function getKategoriDenganJumlah(): Promise<(Kategori & { jumlah: number })[]> {
  await connection();
  const { data, error } = await supabaseServer()
    .from("kategori")
    .select("id, nama, laporan(count)")
    .order("nama")
    .returns<(Kategori & { laporan: { count: number }[] })[]>();
  if (error) gagal("kategori", error.message);
  return data.map((k) => ({ id: k.id, nama: k.nama, jumlah: k.laporan[0]?.count ?? 0 }));
}
