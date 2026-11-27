"use client";

import Link from "next/link";
import { useActionState } from "react";
import { dukungLaporan, type DukungState } from "@/app/actions";
import { kelasTombol } from "@/components/ui";

export function TombolDukung({
  kode,
  sudah,
  sudahMasuk,
}: {
  kode: string;
  sudah: boolean;
  sudahMasuk: boolean;
}) {
  const [state, action, pending] = useActionState<DukungState>(dukungLaporan.bind(null, kode), {});

  if (!sudahMasuk) {
    return (
      <div className="space-y-1 text-right">
        <Link
          href={`/masuk?kembali=${encodeURIComponent(`/laporan/${kode}`)}`}
          className={kelasTombol}
        >
          👍 Masuk untuk mendukung
        </Link>
        <p className="text-xs text-slate-500">1 akun maksimal 1 dukungan per laporan.</p>
      </div>
    );
  }

  const nonaktif = pending || sudah || state.ok === true;

  return (
    <form action={action} className="space-y-2 text-right">
      <button type="submit" disabled={nonaktif} className={kelasTombol}>
        👍 {pending ? "Mengirim…" : sudah || state.ok ? "Sudah didukung" : "Dukung"}
      </button>
      {state.pesan && (
        <p role="status" className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`}>
          {state.pesan}
        </p>
      )}
    </form>
  );
}
