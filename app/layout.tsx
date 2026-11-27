import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { MenuPengguna } from "@/components/menu-pengguna";
import { NavLinks } from "@/components/nav-links";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "LaporKu", template: "%s | LaporKu" },
  description: "Aplikasi pelaporan kerusakan fasilitas sekolah",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="group flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm text-white shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-6">
                🛠️
              </span>
              <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                LaporKu
              </span>
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <Suspense fallback={<div className="h-8 w-56 rounded-lg skeleton-shimmer" />}>
                <NavLinks />
              </Suspense>
              <Suspense fallback={<span className="h-8 w-16 rounded-lg skeleton-shimmer" />}>
                <MenuPengguna />
              </Suspense>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200/80 bg-white/70 py-5 text-center text-xs text-slate-500 backdrop-blur-sm">
          LaporKu · Aplikasi Pelaporan Kerusakan Fasilitas Sekolah
        </footer>
      </body>
    </html>
  );
}
