import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { getDaftarLaporan, getKategori } from "@/lib/data";
import { DAFTAR_STATUS, isStatus } from "@/lib/types";
import { Judul, KartuLaporan, Memuat, Paginasi, kelasInput, kelasTombol } from "@/components/ui";

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
  const halParam = Number(satu(sp.hal));

  const status = isStatus(statusParam) ? statusParam : undefined;
  const kategoriId = Number(kategoriParam);
  const kategori = Number.isInteger(kategoriId) && kategoriId > 0 ? kategoriId : undefined;
  const halaman = Number.isInteger(halParam) && halParam > 0 ? halParam : 1;

  const [daftarKategori, hasil] = await Promise.all([
    getKategori(),
    getDaftarLaporan({ q, status, kategori, halaman }),
  ]);
  const adaFilter = Boolean(q || status || kategori);

  function buatHref(hal: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (kategori) params.set("kategori", String(kategori));
    if (status) params.set("status", status);
    if (hal > 1) params.set("hal", String(hal));
    const qs = params.toString();
    return qs ? `/laporan?${qs}` : "/laporan";
  }

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

      <p className="text-sm text-slate-600">{hasil.total} laporan ditemukan.</p>

      {hasil.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
          Tidak ada laporan yang cocok dengan saringan.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {hasil.items.map((l, idx) => (
              <KartuLaporan key={l.id} laporan={l} indeks={idx} />
            ))}
          </div>
          <Paginasi
            halaman={hasil.halaman}
            totalHalaman={hasil.totalHalaman}
            total={hasil.total}
            perHalaman={hasil.perHalaman}
            buatHref={buatHref}
          />
        </>
      )}
    </div>
  );
}
