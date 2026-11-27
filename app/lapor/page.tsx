import type { Metadata } from "next";
import { Suspense } from "react";
import { getKategori } from "@/lib/data";
import { getPenggunaAktif } from "@/lib/user-auth";
import { Judul, Memuat } from "@/components/ui";
import { FormLapor } from "./form-lapor";

export const metadata: Metadata = { title: "Buat laporan" };

export default function LaporPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Judul sub="Isi formulir berikut untuk melaporkan kerusakan fasilitas sekolah.">Buat laporan</Judul>
      <Suspense fallback={<Memuat />}>
        <Konten />
      </Suspense>
    </div>
  );
}

async function Konten() {
  const [kategori, pengguna] = await Promise.all([getKategori(), getPenggunaAktif()]);
  return <FormLapor kategori={kategori} namaDefault={pengguna?.nama ?? ""} />;
}
