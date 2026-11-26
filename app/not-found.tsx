import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-6xl font-bold text-blue-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-slate-600">
        Laporan atau halaman yang Anda cari tidak ada. Periksa kembali kode atau alamatnya.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/laporan" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Daftar laporan</Link>
        <Link href="/lacak" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">Lacak laporan</Link>
      </div>
    </div>
  );
}
