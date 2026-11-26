"use client";

import { useActionState } from "react";
import { hapusKategori, tambahKategori, type KategoriState } from "@/app/admin/actions";
import { GalatKolom, Pesan, kelasInput, kelasTombol } from "@/components/ui";

export function FormTambahKategori() {
  const [state, action, pending] = useActionState<KategoriState, FormData>(tambahKategori, { percobaan: 0 });
  return (
    <form key={state.percobaan} action={action} noValidate className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {state.ok && state.pesan && <Pesan jenis="sukses">{state.pesan}</Pesan>}
      <label htmlFor="nama" className="text-sm font-medium text-slate-700">
        Nama kategori baru <span className="text-slate-400">(3–30 huruf)</span>
      </label>
      <div className="flex gap-2">
        <input id="nama" name="nama" defaultValue={state.nama} aria-invalid={Boolean(state.error)} className={`${kelasInput} mt-0`} />
        <button type="submit" disabled={pending} className={kelasTombol}>{pending ? "Menyimpan…" : "Tambah"}</button>
      </div>
      <GalatKolom pesan={state.error} />
    </form>
  );
}

export function TombolHapusKategori({ id, nama }: { id: number; nama: string }) {
  const [state, action, pending] = useActionState<{ pesan?: string }>(hapusKategori.bind(null, id), {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Hapus kategori "${nama}"?`)) e.preventDefault();
      }}
      className="max-w-xs space-y-1 text-right"
    >
      <button type="submit" disabled={pending} className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
        {pending ? "Menghapus…" : "Hapus"}
      </button>
      {state.pesan && <p role="alert" className="text-left text-sm text-red-600">{state.pesan}</p>}
    </form>
  );
}
