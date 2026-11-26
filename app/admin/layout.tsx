import Link from "next/link";
import { logout } from "@/app/login/actions";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1 text-sm font-medium">
          <span className="mr-2 rounded bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">ADMIN</span>
          <Link href="/admin" className="rounded-md px-3 py-1.5 hover:bg-slate-100">Semua laporan</Link>
          <Link href="/admin/kategori" className="rounded-md px-3 py-1.5 hover:bg-slate-100">Kategori</Link>
        </div>
        <form action={logout}>
          <button type="submit" className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50">
            Keluar
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
