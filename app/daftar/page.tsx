import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getPenggunaAktif } from "@/lib/user-auth";
import { tujuanAman } from "@/lib/validasi";
import { Judul, Memuat } from "@/components/ui";
import { FormDaftar } from "./form-daftar";

export const metadata: Metadata = { title: "Daftar akun" };

export default function DaftarPage({ searchParams }: PageProps<"/daftar">) {
  return (
    <div className="mx-auto max-w-sm">
      <Judul sub="Buat akun warga sekolah agar dapat mendukung laporan fasilitas.">
        Daftar akun
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

  return <FormDaftar kembali={kembali} />;
}
