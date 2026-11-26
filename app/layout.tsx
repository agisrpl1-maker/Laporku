import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "LaporKu", template: "%s | LaporKu" },
  description: "Aplikasi pelaporan kerusakan fasilitas sekolah",
};

const MENU = [
  { href: "/", label: "Beranda" },
  { href: "/laporan", label: "Laporan" },
  { href: "/lapor", label: "Lapor" },
  { href: "/lacak", label: "Lacak" },
  { href: "/admin", label: "Admin" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="text-lg font-bold text-blue-700">
              🛠️ LaporKu
            </Link>
            <ul className="flex flex-wrap gap-1 text-sm font-medium">
              {MENU.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          LaporKu · Aplikasi Pelaporan Kerusakan Fasilitas Sekolah
        </footer>
      </body>
    </html>
  );
}
