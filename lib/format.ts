export function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Menerjemahkan galat basis data menjadi pesan yang ramah. */
export function pesanGalatDb(error: { code?: string; message?: string; hint?: string }): string {
  const msg = error.message ?? "";
  if (msg.includes("BATAS_LAPORAN_BARU"))
    return "Pelapor ini sudah memiliki 3 laporan berstatus baru. Tunggu hingga salah satunya diproses.";
  if (msg.includes("STATUS_TIDAK_VALID"))
    return "Status hanya boleh maju satu langkah: baru → diproses → selesai.";
  if (msg.includes("laporan_selesai_wajib_tanggapan"))
    return "Status selesai wajib disertai tanggapan minimal 10 huruf.";
  if (error.code === "23503")
    return "Data masih dipakai oleh data lain sehingga tidak dapat diproses.";
  if (error.code === "23505") return "Data dengan nilai tersebut sudah ada.";
  if (error.code === "23514") return "Data tidak memenuhi aturan yang berlaku. Periksa kembali isian Anda.";
  return "Terjadi kesalahan pada server. Silakan coba lagi.";
}
