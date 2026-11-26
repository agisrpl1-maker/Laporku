import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getKategoriDenganJumlah } from "@/lib/data";
import { Judul, Memuat } from "@/components/ui";
import { FormTambahKategori, TombolHapusKategori } from "./form-kategori";

export const metadata: Metadata = { title: "Kelola kategori" };

export default function KategoriPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Judul sub="Tambah kategori baru atau hapus kategori yang tidak dipakai.">Kategori</Judul>
      <Suspense fallback={<Memuat />}>
        <Konten />
      </Suspense>
    </div>
  );
}

async function Konten() {
  await requireAdmin();
  const kategori = await getKategoriDenganJumlah();

  return (
    <div className="space-y-6">
      <FormTambahKategori />
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
        {kategori.length === 0 && <li className="p-4 text-slate-500">Belum ada kategori.</li>}
        {kategori.map((k) => (
          <li key={k.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{k.nama}</p>
              <p className="text-xs text-slate-500">Dipakai {k.jumlah} laporan</p>
            </div>
            <TombolHapusKategori id={k.id} nama={k.nama} />
          </li>
        ))}
      </ul>
    </div>
  );
}
