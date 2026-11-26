import { isStatus, type Status } from "./types";

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

function teks(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}

function cekPanjang(nilai: string, label: string, min: number, max: number): string | undefined {
  if (!nilai) return `${label} wajib diisi.`;
  if (nilai.length < min) return `${label} minimal ${min} huruf (sekarang ${nilai.length}).`;
  if (nilai.length > max) return `${label} maksimal ${max} huruf (sekarang ${nilai.length}).`;
  return undefined;
}

/* ------------------------------ Laporan baru ------------------------------ */

export type LaporanField = "kategori_id" | "judul" | "deskripsi" | "lokasi" | "pelapor";

export type LaporanInput = {
  kategori_id: number;
  judul: string;
  deskripsi: string;
  lokasi: string;
  pelapor: string;
};

export function bacaLaporan(formData: FormData) {
  const values: Record<LaporanField, string> = {
    kategori_id: teks(formData, "kategori_id"),
    judul: teks(formData, "judul"),
    deskripsi: teks(formData, "deskripsi"),
    lokasi: teks(formData, "lokasi"),
    pelapor: teks(formData, "pelapor"),
  };

  const errors: FieldErrors<LaporanField> = {};
  const kategoriId = Number(values.kategori_id);
  if (!values.kategori_id) errors.kategori_id = "Kategori wajib dipilih.";
  else if (!Number.isInteger(kategoriId) || kategoriId <= 0) errors.kategori_id = "Kategori tidak valid.";

  const judul = cekPanjang(values.judul, "Judul", 5, 80);
  if (judul) errors.judul = judul;
  const deskripsi = cekPanjang(values.deskripsi, "Deskripsi", 10, 500);
  if (deskripsi) errors.deskripsi = deskripsi;
  const lokasi = cekPanjang(values.lokasi, "Lokasi", 3, 60);
  if (lokasi) errors.lokasi = lokasi;
  const pelapor = cekPanjang(values.pelapor, "Nama pelapor", 3, 40);
  if (pelapor) errors.pelapor = pelapor;

  const data: LaporanInput = { ...values, kategori_id: kategoriId };
  return { values, errors, data, valid: Object.keys(errors).length === 0 };
}

/* ---------------------------- Ubah laporan (admin) ---------------------------- */

export type UbahField = "status" | "tanggapan";

export function bacaUbahLaporan(formData: FormData, statusLama: Status) {
  const values = { status: teks(formData, "status"), tanggapan: teks(formData, "tanggapan") };
  const errors: FieldErrors<UbahField> = {};

  if (!isStatus(values.status)) {
    errors.status = "Status harus baru, diproses, atau selesai.";
  } else if (values.status !== statusLama) {
    const boleh =
      (statusLama === "baru" && values.status === "diproses") ||
      (statusLama === "diproses" && values.status === "selesai");
    if (!boleh) {
      errors.status = `Status hanya boleh maju satu langkah (baru → diproses → selesai). Tidak bisa dari "${statusLama}" ke "${values.status}".`;
    }
  }

  if (values.tanggapan.length > 500) {
    errors.tanggapan = `Tanggapan maksimal 500 huruf (sekarang ${values.tanggapan.length}).`;
  } else if (values.status === "selesai" && values.tanggapan.length < 10) {
    errors.tanggapan = "Status selesai wajib disertai tanggapan minimal 10 huruf.";
  }

  return { values, errors, valid: Object.keys(errors).length === 0 };
}

/* ------------------------------- Kategori ------------------------------- */

export function bacaKategori(formData: FormData) {
  const nama = teks(formData, "nama");
  const error = cekPanjang(nama, "Nama kategori", 3, 30);
  return { nama, error };
}

/* ------------------------------- Kode laporan ------------------------------- */

export const POLA_KODE = /^LP-\d{4,}$/;

export function normalisasiKode(input: string): string {
  return input.trim().toUpperCase();
}
