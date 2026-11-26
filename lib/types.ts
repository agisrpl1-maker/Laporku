export const DAFTAR_STATUS = ["baru", "diproses", "selesai"] as const;
export type Status = (typeof DAFTAR_STATUS)[number];

export type Kategori = {
  id: number;
  nama: string;
};

/** Data laporan yang aman ditampilkan ke publik (tanpa nama pelapor). */
export type LaporanPublik = {
  id: number;
  kode: string;
  kategori_id: number;
  judul: string;
  deskripsi: string;
  lokasi: string;
  status: Status;
  tanggapan: string | null;
  dukungan: number;
  dibuat: string;
  diperbarui: string;
  kategori: { nama: string } | null;
};

/** Data lengkap laporan, hanya untuk halaman admin. */
export type LaporanLengkap = LaporanPublik & { pelapor: string };

export function isStatus(value: unknown): value is Status {
  return typeof value === "string" && (DAFTAR_STATUS as readonly string[]).includes(value);
}

/** Status berikutnya yang diizinkan (hanya maju satu langkah). */
export function statusBerikutnya(status: Status): Status | null {
  if (status === "baru") return "diproses";
  if (status === "diproses") return "selesai";
  return null;
}
