"use client";

import { useActionState } from "react";
import { hapusLaporan, ubahLaporan, type HapusState, type UbahState } from "@/app/admin/actions";
import { DAFTAR_STATUS, statusBerikutnya, type Status } from "@/lib/types";
import { GalatKolom, Pesan, kelasInput, kelasTombol } from "@/components/ui";

export function FormUbah({ id, status, tanggapan }: { id: number; status: Status; tanggapan: string }) {
  const [state, action, pending] = useActionState<UbahState, FormData>(ubahLaporan.bind(null, id), {
    percobaan: 0,
    errors: {},
  });
  const nilai = state.values ?? { status, tanggapan };
  const berikutnya = statusBerikutnya(status);

  return (
    <form
      key={`${state.percobaan}-${status}`}
      action={action}
      noValidate
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="font-semibold">Ubah status &amp; tanggapan</h2>
      {state.pesan && <Pesan jenis={state.ok ? "sukses" : "galat"}>{state.pesan}</Pesan>}

      <div>
        <label htmlFor="status" className="text-sm font-medium text-slate-700">Status</label>
        <select id="status" name="status" defaultValue={nilai.status} aria-invalid={Boolean(state.errors.status)} className={kelasInput}>
          {DAFTAR_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
              {s === status ? " (saat ini)" : s === berikutnya ? " (langkah berikutnya)" : " (tidak diizinkan)"}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">Status hanya boleh maju: baru → diproses → selesai.</p>
        <GalatKolom pesan={state.errors.status} />
      </div>

      <div>
        <label htmlFor="tanggapan" className="text-sm font-medium text-slate-700">
          Tanggapan petugas <span className="text-slate-400">(wajib min. 10 huruf bila selesai)</span>
        </label>
        <textarea id="tanggapan" name="tanggapan" rows={4} defaultValue={nilai.tanggapan} aria-invalid={Boolean(state.errors.tanggapan)} className={kelasInput} />
        <GalatKolom pesan={state.errors.tanggapan} />
      </div>

      <button type="submit" disabled={pending} className={kelasTombol}>
        {pending ? "Menyimpan…" : "Simpan perubahan"}
      </button>
    </form>
  );
}

export function TombolHapus({ id, kode }: { id: number; kode: string }) {
  const [state, action, pending] = useActionState<HapusState>(hapusLaporan.bind(null, id), {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Hapus laporan ${kode}? Tindakan ini tidak dapat dibatalkan.`)) e.preventDefault();
      }}
      className="space-y-2"
    >
      <button type="submit" disabled={pending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
        {pending ? "Menghapus…" : "Hapus laporan"}
      </button>
      {state.pesan && <Pesan jenis="galat">{state.pesan}</Pesan>}
    </form>
  );
}
