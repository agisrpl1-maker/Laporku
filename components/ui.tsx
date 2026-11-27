import Image from "next/image";
import Link from "next/link";
import type { LaporanPublik, Status } from "@/lib/types";
import { formatTanggal } from "@/lib/format";

const WARNA_STATUS: Record<Status, string> = {
  baru: "bg-sky-100 text-sky-800 ring-sky-200",
  diproses: "bg-amber-100 text-amber-800 ring-amber-200",
  selesai: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ${WARNA_STATUS[status]}`}
    >
      {status}
    </span>
  );
}

export function KartuLaporan({ laporan }: { laporan: LaporanPublik }) {
  return (
    <Link
      href={`/laporan/${laporan.kode}`}
      className="block overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow"
    >
      {laporan.foto_url && (
        <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={laporan.foto_url}
            alt={`Foto kerusakan: ${laporan.judul}`}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 480px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-slate-500">{laporan.kode}</span>
        <StatusBadge status={laporan.status} />
      </div>
      <h3 className="mt-2 font-semibold text-slate-900">{laporan.judul}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{laporan.deskripsi}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>📁 {laporan.kategori?.nama ?? "-"}</span>
        <span>📍 {laporan.lokasi}</span>
        <span>👍 {laporan.dukungan}</span>
        <span>🕒 {formatTanggal(laporan.dibuat)}</span>
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
    <nav aria-label="Paginasi" className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <p className="text-sm text-slate-600">
        Menampilkan {awal}–{akhir} dari {total} laporan (halaman {halaman} dari {totalHalaman})
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {halaman > 1 ? (
          <Link
            href={buatHref(halaman - 1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white"
            >
              {n}
            </span>
          ) : (
            <Link
              key={n}
              href={buatHref(n)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {n}
            </Link>
          ),
        )}

        {halaman < totalHalaman ? (
          <Link
            href={buatHref(halaman + 1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-900">{children}</h1>
      {sub && <p className="mt-1 text-slate-600">{sub}</p>}
    </div>
  );
}

export function Memuat({ teks = "Memuat data…" }: { teks?: string }) {
  return <p className="animate-pulse rounded-lg bg-slate-100 p-4 text-sm text-slate-500">{teks}</p>;
}

export function Pesan({ jenis, children }: { jenis: "sukses" | "galat"; children: React.ReactNode }) {
  const kelas =
    jenis === "sukses"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-700";
  return (
    <p role={jenis === "galat" ? "alert" : "status"} className={`rounded-lg border p-3 text-sm ${kelas}`}>
      {children}
    </p>
  );
}

export function GalatKolom({ pesan }: { pesan?: string }) {
  if (!pesan) return null;
  return <p className="mt-1 text-sm text-red-600">{pesan}</p>;
}

export const kelasInput =
  "mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 aria-[invalid=true]:border-red-500";

export const kelasTombol =
  "inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";
