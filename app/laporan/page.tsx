import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { getDaftarLaporan, getKategori } from "@/lib/data";
import { DAFTAR_STATUS, isStatus } from "@/lib/types";
import { Judul, KartuLaporan, Memuat, kelasInput, kelasTombol } from "@/components/ui";

export const metadata: Metadata = { title: "Daftar laporan" };

type SP = Record<string, string | string[] | undefined>;

function satu(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

export default function DaftarLaporanPage({ searchParams }: PageProps<"/laporan">) {
  return (
    <>
      <Judul sub="Saring laporan berdasarkan kategori, status, atau kata kunci.">Daftar laporan</Judul>
      <Suspense fallback={<Memuat />}>
        <Konten searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Konten({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = satu(sp.q);
  const statusParam = satu(sp.status);
  const kategoriParam = satu(sp.kategori);

  const status = isStatus(statusParam) ? statusParam : undefined;
  const kategoriId = Number(kategoriParam);
  const kategori = Number.isInteger(kategoriId) && kategoriId > 0 ? kategoriId : undefined;

  const [daftarKategori, laporan] = await Promise.all([
    getKategori(),
    getDaftarLaporan({ q, status, kategori }),
  ]);
  const adaFilter = Boolean(q || status || kategori);

  return (
    <div className="space-y-6">
      {/* Form GET: filter tersimpan di URL, misalnya /laporan?status=baru&kategori=2&q=ac */}
      <Form action="/laporan" className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
        <label className="text-sm font-medium text-slate-700">
          Kata kunci
          <input name="q" defaultValue={q} placeholder="mis. proyektor" className={kelasInput} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Kategori
          <select name="kategori" defaultValue={kategori ? String(kategori) : ""} className={kelasInput}>
            <option value="">Semua kategori</option>
            {daftarKategori.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Status
          <select name="status" defaultValue={status ?? ""} className={kelasInput}>
            <option value="">Semua status</option>
            {DAFTAR_STATUS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className={`${kelasTombol} flex-1`}>
            Terapkan
          </button>
          {adaFilter && (
            <Link href="/laporan" className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
              Reset
            </Link>
          )}
        </div>
      </Form>

      <p className="text-sm text-slate-600">{laporan.length} laporan ditemukan.</p>

      {laporan.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
          Tidak ada laporan yang cocok dengan saringan.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {laporan.map((l) => (
            <KartuLaporan key={l.id} laporan={l} />
          ))}
        </div>
      )}
    </div>
  );
}
