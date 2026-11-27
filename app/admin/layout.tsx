import Link from "next/link";
import { logout } from "@/app/login/actions";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="space-y-6">
      <div className="animate-fade-up flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
          <span className="mr-2 rounded-md bg-gradient-to-r from-slate-800 to-slate-900 px-2.5 py-0.5 text-xs font-bold tracking-wider text-white">
            ADMIN
          </span>
          <Link href="/admin" className="rounded-lg px-3 py-1.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900">
            Semua laporan
          </Link>
          <Link href="/admin/kategori" className="rounded-lg px-3 py-1.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900">
            Kategori
          </Link>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-xl border border-red-200 bg-red-50/60 px-3.5 py-1.5 text-sm font-semibold text-red-700 transition-all hover:border-red-300 hover:bg-red-100 active:scale-95"
          >
            Keluar
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
