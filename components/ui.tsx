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
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow"
    >
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
