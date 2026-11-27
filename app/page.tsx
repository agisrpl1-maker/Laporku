import Link from "next/link";
import { Suspense } from "react";
import { getLaporanTerbaru, getRingkasan } from "@/lib/data";
import { DAFTAR_STATUS } from "@/lib/types";
import { KartuLaporan, kelasTombol } from "@/components/ui";

export default function Beranda() {
  return (
    <div className="space-y-10">
      <section className="animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl shadow-blue-900/15 sm:p-10">
        {/* Elemen dekoratif melayang */}
        <div
          aria-hidden="true"
          className="animate-float-slow pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="animate-float-slow pointer-events-none absolute -bottom-16 right-24 h-44 w-44 rounded-full bg-sky-300/15 blur-2xl"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-blue-50 ring-1 ring-white/25 backdrop-blur-xs">
            ✨ Layanan Sarana &amp; Prasarana Sekolah
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Laporkan kerusakan fasilitas sekolah dengan cepat
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-blue-100">
            AC, proyektor, keran, kursi, atau lampu rusak? Laporkan lewat LaporKu lengkap dengan
            foto dan pantau perkembangannya secara transparan tanpa kertas.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/lapor"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
            >
              ✍️ Buat laporan
            </Link>
            <Link
              href="/lacak"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0 active:scale-[0.98]"
            >
              🔍 Lacak laporan
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900">Ringkasan laporan</h2>
        <Suspense fallback={<SkeletonRingkasan />}>
          <Ringkasan />
        </Suspense>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Laporan terbaru</h2>
          <Link
            href="/laporan"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-blue-700 transition-colors hover:text-indigo-700"
          >
            Lihat semua
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <Suspense fallback={<SkeletonTerbaru />}>
          <Terbaru />
        </Suspense>
      </section>
    </div>
  );
}

function SkeletonRingkasan() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 rounded-2xl skeleton-shimmer" />
      ))}
    </div>
  );
}

function SkeletonTerbaru() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-44 rounded-2xl skeleton-shimmer" />
      ))}
    </div>
  );
}

async function Ringkasan() {
  const ringkasan = await getRingkasan();
  const total = DAFTAR_STATUS.reduce((n, s) => n + ringkasan[s], 0);
  const kartu = [
    {
      label: "Total laporan",
      nilai: total,
      ikon: "📋",
      warna: "text-slate-900",
      aksen: "from-slate-500 to-slate-700",
      href: "/laporan",
      stagger: "stagger-1",
    },
    {
      label: "Baru",
      nilai: ringkasan.baru,
      ikon: "🆕",
      warna: "text-sky-700",
      aksen: "from-sky-400 to-blue-500",
      href: "/laporan?status=baru",
      stagger: "stagger-2",
    },
    {
      label: "Diproses",
      nilai: ringkasan.diproses,
      ikon: "⚙️",
      warna: "text-amber-700",
      aksen: "from-amber-400 to-orange-500",
      href: "/laporan?status=diproses",
      stagger: "stagger-3",
    },
    {
      label: "Selesai",
      nilai: ringkasan.selesai,
      ikon: "✅",
      warna: "text-emerald-700",
      aksen: "from-emerald-400 to-teal-500",
      href: "/laporan?status=selesai",
      stagger: "stagger-4",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {kartu.map((k) => (
        <Link
          key={k.label}
          href={k.href}
          className={`group animate-fade-up ${k.stagger} relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md`}
        >
          <span
            aria-hidden="true"
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${k.aksen} opacity-80 transition-opacity group-hover:opacity-100`}
          />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{k.label}</p>
            <span className="text-base transition-transform duration-200 group-hover:scale-110">{k.ikon}</span>
          </div>
          <p className={`mt-2 text-3xl font-extrabold tracking-tight ${k.warna}`}>{k.nilai}</p>
        </Link>
      ))}
    </div>
  );
}

async function Terbaru() {
  const laporan = await getLaporanTerbaru(5);
  if (laporan.length === 0) {
    return (
      <div className="animate-fade-up rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-500">
        Belum ada laporan.{" "}
        <Link href="/lapor" className={`${kelasTombol} ml-2`}>
          Buat laporan pertama
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {laporan.map((l, idx) => (
        <KartuLaporan key={l.id} laporan={l} indeks={idx} />
      ))}
    </div>
  );
}
