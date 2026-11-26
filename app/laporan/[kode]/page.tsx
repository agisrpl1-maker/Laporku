import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getLaporanByKode } from "@/lib/data";
import { normalisasiKode, POLA_KODE } from "@/lib/validasi";
import { formatTanggal } from "@/lib/format";
import { kodeDidukung } from "@/lib/dukungan";
import { Memuat, Pesan, StatusBadge } from "@/components/ui";
import { TombolDukung } from "./tombol-dukung";

export default function DetailLaporanPage({ params, searchParams }: PageProps<"/laporan/[kode]">) {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/laporan" className="text-sm text-blue-700 hover:underline">← Kembali ke daftar</Link>
      <Suspense fallback={<div className="mt-4"><Memuat /></div>}>
        <Detail params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Detail({
  params,
  searchParams,
}: {
  params: Promise<{ kode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { kode: kodeMentah } = await params;
  const kode = normalisasiKode(kodeMentah);
  // Format kode salah (mis. /laporan/abc) atau tidak ada (mis. LP-9999) -> 404
  if (!POLA_KODE.test(kode)) notFound();

  const [laporan, sp, didukung] = await Promise.all([
    getLaporanByKode(kode),
    searchParams,
    kodeDidukung(),
  ]);
  if (!laporan) notFound();
  const sudah = didukung.includes(kode);

  return (
    <article className="mt-4 space-y-6">
      {sp.baru === "1" && (
        <Pesan jenis="sukses">
          Laporan berhasil dikirim! Simpan kode <strong className="font-mono">{laporan.kode}</strong> untuk melacak
          perkembangannya di halaman Lacak.
        </Pesan>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-sm text-slate-500">{laporan.kode}</span>
          <StatusBadge status={laporan.status} />
        </div>
        <h1 className="mt-2 text-2xl font-bold">{laporan.judul}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Kategori</dt><dd className="font-medium">{laporan.kategori?.nama ?? "-"}</dd></div>
          <div><dt className="text-slate-500">Lokasi</dt><dd className="font-medium">{laporan.lokasi}</dd></div>
          <div><dt className="text-slate-500">Dibuat</dt><dd className="font-medium">{formatTanggal(laporan.dibuat)}</dd></div>
          <div><dt className="text-slate-500">Diperbarui</dt><dd className="font-medium">{formatTanggal(laporan.diperbarui)}</dd></div>
        </dl>
        <h2 className="mt-6 text-sm font-semibold text-slate-500">Deskripsi</h2>
        <p className="mt-1 whitespace-pre-line">{laporan.deskripsi}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Tanggapan petugas</h2>
        {laporan.tanggapan ? (
          <p className="mt-2 whitespace-pre-line rounded-lg bg-blue-50 p-3 text-slate-800">{laporan.tanggapan}</p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Belum ada tanggapan dari petugas.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm text-slate-500">Dukungan</p>
          <p className="text-3xl font-bold">{laporan.dukungan}</p>
        </div>
        <TombolDukung kode={laporan.kode} sudah={sudah} />
      </div>
    </article>
  );
}
