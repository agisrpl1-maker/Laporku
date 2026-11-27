import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getLaporanAdminById } from "@/lib/data";
import { formatTanggal } from "@/lib/format";
import { Memuat, StatusBadge } from "@/components/ui";
import { FormUbah, TombolHapus } from "./form-ubah";

export const metadata: Metadata = { title: "Kelola laporan" };

export default function KelolaLaporanPage({ params }: PageProps<"/admin/laporan/[id]">) {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-sm text-blue-700 hover:underline">← Kembali ke semua laporan</Link>
      <Suspense fallback={<div className="mt-4"><Memuat /></div>}>
        <Konten params={params} />
      </Suspense>
    </div>
  );
}

async function Konten({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: idText } = await params;
  if (!/^\d+$/.test(idText)) notFound();
  const laporan = await getLaporanAdminById(Number(idText));
  if (!laporan) notFound();

  return (
    <div className="mt-4 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href={`/laporan/${laporan.kode}`} className="font-mono text-sm text-blue-700 hover:underline">{laporan.kode}</Link>
          <StatusBadge status={laporan.status} />
        </div>
        <h1 className="mt-2 text-2xl font-bold">{laporan.judul}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Kategori</dt><dd className="font-medium">{laporan.kategori?.nama ?? "-"}</dd></div>
          <div><dt className="text-slate-500">Lokasi</dt><dd className="font-medium">{laporan.lokasi}</dd></div>
          <div><dt className="text-slate-500">Pelapor</dt><dd className="font-medium">{laporan.pelapor}</dd></div>
          <div><dt className="text-slate-500">Dukungan</dt><dd className="font-medium">{laporan.dukungan}</dd></div>
          <div><dt className="text-slate-500">Dibuat</dt><dd className="font-medium">{formatTanggal(laporan.dibuat)}</dd></div>
          <div><dt className="text-slate-500">Diperbarui</dt><dd className="font-medium">{formatTanggal(laporan.diperbarui)}</dd></div>
        </dl>
        <p className="mt-4 whitespace-pre-line text-slate-700">{laporan.deskripsi}</p>
        {laporan.foto_url && (
          <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <Image
              src={laporan.foto_url}
              alt={`Foto kerusakan: ${laporan.judul}`}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-contain"
            />
          </div>
        )}
      </div>

      <FormUbah id={laporan.id} status={laporan.status} tanggapan={laporan.tanggapan ?? ""} />

      <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-red-700">Hapus laporan</h2>
        <p className="mt-1 text-sm text-slate-600">Laporan yang dihapus tidak dapat dikembalikan.</p>
        <div className="mt-4"><TombolHapus id={laporan.id} kode={laporan.kode} /></div>
      </div>
    </div>
  );
}
