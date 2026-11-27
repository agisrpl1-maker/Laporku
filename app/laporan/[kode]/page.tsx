import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getLaporanByKode } from "@/lib/data";
import { normalisasiKode, POLA_KODE } from "@/lib/validasi";
import { formatTanggal } from "@/lib/format";
import { sudahDidukungPengguna } from "@/lib/dukungan";
import { getPenggunaAktif } from "@/lib/user-auth";
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

  const [laporan, sp, pengguna] = await Promise.all([
    getLaporanByKode(kode),
    searchParams,
    getPenggunaAktif(),
  ]);
  if (!laporan) notFound();
  const sudah = pengguna ? await sudahDidukungPengguna(laporan.id, pengguna.id) : false;

  const langkah = ["baru", "diproses", "selesai"] as const;
  const idxStatus = langkah.indexOf(laporan.status);

  return (
    <article className="animate-fade-up mt-4 space-y-6">
      {sp.baru === "1" && (
        <Pesan jenis="sukses">
          Laporan berhasil dikirim! Simpan kode <strong className="font-mono">{laporan.kode}</strong> untuk melacak
          perkembangannya di halaman Lacak.
        </Pesan>
      )}

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600">
            {laporan.kode}
          </span>
          <StatusBadge status={laporan.status} />
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{laporan.judul}</h1>

        {/* Alur perkembangan status */}
        <ol className="mt-5 grid grid-cols-3 gap-2">
          {langkah.map((s, i) => {
            const aktif = i <= idxStatus;
            return (
              <li key={s} className="flex flex-col gap-1.5">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    aktif ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-slate-200"
                  }`}
                />
                <span
                  className={`text-xs capitalize ${
                    i === idxStatus
                      ? "font-semibold text-blue-700"
                      : aktif
                        ? "font-medium text-slate-700"
                        : "text-slate-400"
                  }`}
                >
                  {i + 1}. {s}
                </span>
              </li>
            );
          })}
        </ol>

        <dl className="mt-5 grid gap-3 rounded-xl bg-slate-50/80 p-4 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-slate-500">Kategori</dt><dd className="font-medium text-slate-900">{laporan.kategori?.nama ?? "-"}</dd></div>
          <div><dt className="text-xs text-slate-500">Lokasi</dt><dd className="font-medium text-slate-900">{laporan.lokasi}</dd></div>
          <div><dt className="text-xs text-slate-500">Dibuat</dt><dd className="font-medium text-slate-900">{formatTanggal(laporan.dibuat)}</dd></div>
          <div><dt className="text-xs text-slate-500">Diperbarui</dt><dd className="font-medium text-slate-900">{formatTanggal(laporan.diperbarui)}</dd></div>
        </dl>
        <h2 className="mt-6 text-sm font-semibold text-slate-500">Deskripsi</h2>
        <p className="mt-1.5 whitespace-pre-line leading-relaxed text-slate-700">{laporan.deskripsi}</p>

        {laporan.foto_url && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-500">Foto kerusakan</h2>
            <div className="relative mt-2 aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <Image
                src={laporan.foto_url}
                alt={`Foto kerusakan: ${laporan.judul}`}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Tanggapan petugas</h2>
        {laporan.tanggapan ? (
          <p className="mt-2.5 whitespace-pre-line rounded-xl border border-blue-100 bg-blue-50/70 p-4 leading-relaxed text-slate-800">
            {laporan.tanggapan}
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Belum ada tanggapan dari petugas.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm text-slate-500">Dukungan warga sekolah</p>
          <p className="text-3xl font-extrabold text-slate-900">{laporan.dukungan}</p>
        </div>
        <TombolDukung kode={laporan.kode} sudah={sudah} sudahMasuk={Boolean(pengguna)} />
      </div>
    </article>
  );
}
