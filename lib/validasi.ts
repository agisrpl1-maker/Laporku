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

/* ------------------------------ Foto kerusakan ------------------------------ */

export const TIPE_FOTO_IZIN = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAKS_UKURAN_FOTO = 2 * 1024 * 1024; // 2 MB

export function bacaFoto(formData: FormData): { file: File | null; error?: string } {
  const entri = formData.get("foto");
  if (!(entri instanceof File) || entri.size === 0) {
    return { file: null };
  }
  if (!(TIPE_FOTO_IZIN as readonly string[]).includes(entri.type)) {
    return { file: null, error: "Format foto harus JPG, PNG, atau WebP." };
  }
  if (entri.size > MAKS_UKURAN_FOTO) {
    return { file: null, error: "Ukuran foto maksimal 2 MB." };
  }
  return { file: entri };
}

/* ------------------------------ Laporan baru ------------------------------ */

export type LaporanField = "kategori_id" | "judul" | "deskripsi" | "lokasi" | "pelapor" | "foto";

export type LaporanInput = {
  kategori_id: number;
  judul: string;
  deskripsi: string;
  lokasi: string;
  pelapor: string;
};

export function bacaLaporan(formData: FormData) {
  const values: Record<Exclude<LaporanField, "foto">, string> = {
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

  const { file: foto, error: errFoto } = bacaFoto(formData);
  if (errFoto) errors.foto = errFoto;

  const data: LaporanInput = { ...values, kategori_id: kategoriId };
  return { values, errors, data, foto, valid: Object.keys(errors).length === 0 };
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

/* ------------------------------- Akun pengunjung ------------------------------- */

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type DaftarField = "nama" | "email" | "sandi";

export function bacaDaftar(formData: FormData) {
  const values = {
    nama: teks(formData, "nama"),
    email: teks(formData, "email").toLowerCase(),
  };
  const sandi = typeof formData.get("sandi") === "string" ? String(formData.get("sandi")) : "";
  const errors: FieldErrors<DaftarField> = {};

  const errNama = cekPanjang(values.nama, "Nama", 3, 40);
  if (errNama) errors.nama = errNama;
  if (!values.email) errors.email = "Email wajib diisi.";
  else if (!POLA_EMAIL.test(values.email) || values.email.length > 100) {
    errors.email = "Format email tidak valid.";
  }
  if (!sandi) errors.sandi = "Kata sandi wajib diisi.";
  else if (sandi.length < 6) errors.sandi = "Kata sandi minimal 6 karakter.";
  else if (sandi.length > 72) errors.sandi = "Kata sandi maksimal 72 karakter.";

  return { values, sandi, errors, valid: Object.keys(errors).length === 0 };
}

export type MasukField = "email" | "sandi";

export function bacaMasuk(formData: FormData) {
  const email = teks(formData, "email").toLowerCase();
  const sandi = typeof formData.get("sandi") === "string" ? String(formData.get("sandi")) : "";
  const errors: FieldErrors<MasukField> = {};

  if (!email) errors.email = "Email wajib diisi.";
  else if (!POLA_EMAIL.test(email)) errors.email = "Format email tidak valid.";
  if (!sandi) errors.sandi = "Kata sandi wajib diisi.";

  return { email, sandi, errors, valid: Object.keys(errors).length === 0 };
}

/** Memastikan alamat pengalihan setelah login hanya berupa path internal yang aman. */
export function tujuanAman(kembali: string | undefined, fallback = "/laporan"): string {
  if (!kembali) return fallback;
  const bersih = kembali.trim();
  if (!bersih.startsWith("/") || bersih.startsWith("//")) return fallback;
  return bersih;
}

/* ------------------------------- Kode laporan ------------------------------- */

export const POLA_KODE = /^LP-\d{4,}$/;

export function normalisasiKode(input: string): string {
  return input.trim().toUpperCase();
}
