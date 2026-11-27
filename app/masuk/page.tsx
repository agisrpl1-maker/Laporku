import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getPenggunaAktif } from "@/lib/user-auth";
import { tujuanAman } from "@/lib/validasi";
import { Judul, Memuat } from "@/components/ui";
import { FormMasuk } from "./form-masuk";

export const metadata: Metadata = { title: "Masuk warga sekolah" };

export default function MasukPage({ searchParams }: PageProps<"/masuk">) {
  return (
    <div className="mx-auto max-w-sm">
      <Judul sub="Masuk untuk memberi dukungan pada laporan kerusakan (1 dukungan per akun).">
        Masuk warga sekolah
      </Judul>
      <Suspense fallback={<Memuat />}>
        <Konten searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Konten({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const mentah = Array.isArray(sp.kembali) ? sp.kembali[0] : sp.kembali;
  const kembali = tujuanAman(mentah);

  const pengguna = await getPenggunaAktif();
  if (pengguna) redirect(kembali);

  return <FormMasuk kembali={kembali} />;
}
