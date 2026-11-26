import Link from "next/link";
import { Suspense } from "react";
import { getLaporanTerbaru, getRingkasan } from "@/lib/data";
import { DAFTAR_STATUS } from "@/lib/types";
import { KartuLaporan, Memuat, kelasTombol } from "@/components/ui";

export default function Beranda() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow">
        <h1 className="text-3xl font-bold">Laporkan kerusakan fasilitas sekolah</h1>
        <p className="mt-2 max-w-2xl text-blue-100">
          AC, proyektor, keran, kursi, atau lampu rusak? Laporkan lewat LaporKu dan pantau
          perkembangannya tanpa kertas.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/lapor" className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-700 hover:bg-blue-50">
            Buat laporan
          </Link>
          <Link href="/lacak" className="rounded-lg border border-white/60 px-4 py-2 font-semibold hover:bg-white/10">
            Lacak laporan
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Ringkasan laporan</h2>
        <Suspense fallback={<Memuat />}>
          <Ringkasan />
        </Suspense>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Laporan terbaru</h2>
          <Link href="/laporan" className="text-sm font-medium text-blue-700 hover:underline">
            Lihat semua →
          </Link>
        </div>
        <Suspense fallback={<Memuat />}>
          <Terbaru />
        </Suspense>
      </section>
    </div>
  );
}

async function Ringkasan() {
  const ringkasan = await getRingkasan();
  const total = DAFTAR_STATUS.reduce((n, s) => n + ringkasan[s], 0);
  const kartu = [
    { label: "Total", nilai: total, warna: "text-slate-900", href: "/laporan" },
    { label: "Baru", nilai: ringkasan.baru, warna: "text-sky-700", href: "/laporan?status=baru" },
    { label: "Diproses", nilai: ringkasan.diproses, warna: "text-amber-700", href: "/laporan?status=diproses" },
    { label: "Selesai", nilai: ringkasan.selesai, warna: "text-emerald-700", href: "/laporan?status=selesai" },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {kartu.map((k) => (
        <Link key={k.label} href={k.href} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300">
          <p className="text-sm text-slate-500">{k.label}</p>
          <p className={`mt-1 text-3xl font-bold ${k.warna}`}>{k.nilai}</p>
        </Link>
      ))}
    </div>
  );
}

async function Terbaru() {
  const laporan = await getLaporanTerbaru(5);
  if (laporan.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
        Belum ada laporan. <Link href="/lapor" className={`${kelasTombol} ml-2`}>Buat laporan pertama</Link>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {laporan.map((l) => (
        <KartuLaporan key={l.id} laporan={l} />
      ))}
    </div>
  );
}
