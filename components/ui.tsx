import Image from "next/image";
import Link from "next/link";
import type { LaporanPublik, Status } from "@/lib/types";
import { formatTanggal } from "@/lib/format";

const WARNA_STATUS: Record<Status, { badge: string; dot: string; pulse: boolean }> = {
  baru: {
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
    pulse: true,
  },
  diproses: {
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
    pulse: true,
  },
  selesai: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    pulse: false,
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const gaya = WARNA_STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ${gaya.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${gaya.dot} ${gaya.pulse ? "animate-pulse" : ""}`} />
      {status}
    </span>
  );
}

const STAGGER = ["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5", "stagger-6"];

export function KartuLaporan({ laporan, indeks = 0 }: { laporan: LaporanPublik; indeks?: number }) {
  const delay = STAGGER[indeks % STAGGER.length];
  return (
    <Link
      href={`/laporan/${laporan.kode}`}
      className={`group animate-fade-up ${delay} flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5`}
    >
      {laporan.foto_url && (
        <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={laporan.foto_url}
            alt={`Foto kerusakan: ${laporan.judul}`}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 480px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600">
          {laporan.kode}
        </span>
        <StatusBadge status={laporan.status} />
      </div>
      <h3 className="mt-2.5 text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
        {laporan.judul}
      </h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">{laporan.deskripsi}</p>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5">
          📁 {laporan.kategori?.nama ?? "-"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5">
          📍 {laporan.lokasi}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50/70 px-2 py-0.5 font-medium text-blue-700">
          👍 {laporan.dukungan}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-slate-400">
          🕒 {formatTanggal(laporan.dibuat)}
        </span>
      </div>
    </Link>
  );
}

export function Paginasi({
  halaman,
  totalHalaman,
  total,
  perHalaman,
  buatHref,
}: {
  halaman: number;
  totalHalaman: number;
  total: number;
  perHalaman: number;
  buatHref: (hal: number) => string;
}) {
  if (totalHalaman <= 1) return null;

  const awal = (halaman - 1) * perHalaman + 1;
  const akhir = Math.min(total, halaman * perHalaman);
  const nomorHalaman = Array.from({ length: totalHalaman }, (_, i) => i + 1);

  return (
    <nav aria-label="Paginasi" className="animate-fade-up flex flex-wrap items-center justify-between gap-3 pt-2">
      <p className="text-sm text-slate-600">
        Menampilkan <strong className="text-slate-900">{awal}–{akhir}</strong> dari{" "}
        <strong className="text-slate-900">{total}</strong> laporan (halaman {halaman} dari {totalHalaman})
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {halaman > 1 ? (
          <Link
            href={buatHref(halaman - 1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 active:scale-95"
          >
            ← Sebelumnya
          </Link>
        ) : (
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400">
            ← Sebelumnya
          </span>
        )}

        {nomorHalaman.map((n) =>
          n === halaman ? (
            <span
              key={n}
              aria-current="page"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
            >
              {n}
            </span>
          ) : (
            <Link
              key={n}
              href={buatHref(n)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 active:scale-95"
            >
              {n}
            </Link>
          ),
        )}

        {halaman < totalHalaman ? (
          <Link
            href={buatHref(halaman + 1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 active:scale-95"
          >
            Berikutnya →
          </Link>
        ) : (
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400">
            Berikutnya →
          </span>
        )}
      </div>
    </nav>
  );
}

export function Judul({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="animate-fade-up mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{children}</h1>
      {sub && <p className="mt-1.5 text-slate-600">{sub}</p>}
    </div>
  );
}

export function Memuat({ teks = "Memuat data…" }: { teks?: string }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label={teks}>
      <div className="h-12 w-full rounded-xl skeleton-shimmer" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-36 rounded-2xl skeleton-shimmer" />
        <div className="h-36 rounded-2xl skeleton-shimmer" />
      </div>
    </div>
  );
}

export function Pesan({ jenis, children }: { jenis: "sukses" | "galat"; children: React.ReactNode }) {
  const kelas =
    jenis === "sukses"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-700";
  const ikon = jenis === "sukses" ? "✓" : "!";
  const warnaIkon = jenis === "sukses" ? "bg-emerald-600 text-white" : "bg-red-600 text-white";
  return (
    <div
      role={jenis === "galat" ? "alert" : "status"}
      className={`animate-scale-in flex items-start gap-2.5 rounded-xl border p-3.5 text-sm shadow-xs ${kelas}`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${warnaIkon}`}
      >
        {ikon}
      </span>
      <p>{children}</p>
    </div>
  );
}

export function GalatKolom({ pesan }: { pesan?: string }) {
  if (!pesan) return null;
  return <p className="animate-scale-in mt-1 text-sm text-red-600">{pesan}</p>;
}

export const kelasInput =
  "mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-xs transition-all duration-150 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/15";

export const kelasTombol =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md hover:shadow-blue-600/25 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";
