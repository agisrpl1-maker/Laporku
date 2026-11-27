import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getSemuaLaporanAdmin } from "@/lib/data";
import { formatTanggal } from "@/lib/format";
import { Judul, Memuat, Paginasi, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Admin" };

type SP = Record<string, string | string[] | undefined>;

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <Judul sub="Semua laporan beserta statusnya. Klik Kelola untuk mengubah status atau menghapus.">
        Semua laporan
      </Judul>
      <Suspense fallback={<Memuat />}>
        <Tabel searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Tabel({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;
  const halRaw = Array.isArray(sp.hal) ? sp.hal[0] : sp.hal;
  const halNum = Number(halRaw);
  const halaman = Number.isInteger(halNum) && halNum > 0 ? halNum : 1;

  const hasil = await getSemuaLaporanAdmin(halaman);

  if (hasil.total === 0) return <p className="text-slate-500">Belum ada laporan.</p>;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Pelapor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Dukungan</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hasil.items.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{l.kode}</td>
                <td className="px-4 py-3 font-medium">
                  {l.judul}
                  {l.foto_url && (
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-600">
                      📷 Foto
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{l.kategori?.nama ?? "-"}</td>
                <td className="px-4 py-3">{l.pelapor}</td>
                <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                <td className="px-4 py-3">{l.dukungan}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatTanggal(l.dibuat)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/laporan/${l.id}`} className="font-semibold text-blue-700 hover:underline">Kelola</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Paginasi
        halaman={hasil.halaman}
        totalHalaman={hasil.totalHalaman}
        total={hasil.total}
        perHalaman={hasil.perHalaman}
        buatHref={(hal) => (hal > 1 ? `/admin?hal=${hal}` : "/admin")}
      />
    </div>
  );
}
