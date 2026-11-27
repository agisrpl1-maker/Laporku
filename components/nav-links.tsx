"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/", label: "Beranda" },
  { href: "/laporan", label: "Laporan" },
  { href: "/lapor", label: "Lapor" },
  { href: "/lacak", label: "Lacak" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-wrap items-center gap-1 text-sm font-medium">
      {MENU.map((m) => {
        const aktif = m.href === "/" ? pathname === "/" : pathname === m.href || pathname.startsWith(`${m.href}/`);
        return (
          <li key={m.href}>
            <Link
              href={m.href}
              aria-current={aktif ? "page" : undefined}
              className={`rounded-lg px-3 py-1.5 transition-all duration-200 ${
                aktif
                  ? "bg-blue-50 font-semibold text-blue-700 ring-1 ring-blue-200/70"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {m.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
