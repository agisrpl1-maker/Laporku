import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { getLaporanByKode } from "@/lib/data";
import { normalisasiKode, POLA_KODE } from "@/lib/validasi";
import { Judul, KartuLaporan, Memuat, kelasInput, kelasTombol } from "@/components/ui";

export const metadata: Metadata = { title: "Lacak laporan" };

export default function LacakPage({ searchParams }: PageProps<"/lacak">) {
  return (
    <div className="mx-auto max-w-2xl">
      <Judul sub="Masukkan kode laporan (contoh: LP-0007) untuk melihat perkembangannya.">Lacak laporan</Judul>
      <Suspense fallback={<Memuat />}>
        <Konten searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Konten({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const mentah = Array.isArray(sp.kode) ? sp.kode[0] : sp.kode;
  const kode = mentah ? normalisasiKode(mentah) : "";

  let hasil: React.ReactNode = null;
  if (mentah !== undefined) {
    if (!kode) {
      hasil = <p className="text-sm text-red-600">Kode laporan wajib diisi.</p>;
    } else if (!POLA_KODE.test(kode)) {
      hasil = <p className="text-sm text-red-600">Format kode salah. Gunakan format LP-0001.</p>;
    } else {
      const laporan = await getLaporanByKode(kode);
      hasil = laporan ? (
        <div className="space-y-2">
          <KartuLaporan laporan={laporan} />
          <Link href={`/laporan/${laporan.kode}`} className="text-sm text-blue-700 hover:underline">Lihat detail →</Link>
        </div>
      ) : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Laporan dengan kode <strong className="font-mono">{kode}</strong> tidak ditemukan.
        </p>
      );
    }
  }

  return (
    <div className="space-y-6">
      <Form action="/lacak" className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label htmlFor="kode" className="sr-only">Kode laporan</label>
        <input id="kode" name="kode" defaultValue={mentah ?? ""} placeholder="LP-0001" className={`${kelasInput} mt-0 font-mono uppercase`} />
        <button type="submit" className={kelasTombol}>Cari</button>
      </Form>
      {hasil}
    </div>
  );
}
