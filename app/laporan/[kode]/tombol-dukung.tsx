"use client";

import { useActionState } from "react";
import { dukungLaporan, type DukungState } from "@/app/actions";
import { kelasTombol } from "@/components/ui";

export function TombolDukung({ kode, sudah }: { kode: string; sudah: boolean }) {
  const [state, action, pending] = useActionState<DukungState>(dukungLaporan.bind(null, kode), {});
  const nonaktif = pending || sudah || state.ok === true;

  return (
    <form action={action} className="space-y-2">
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
