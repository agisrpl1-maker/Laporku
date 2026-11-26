"use client";

import { useActionState } from "react";
import { buatLaporan, type LaporState } from "@/app/actions";
import type { Kategori } from "@/lib/types";
import { GalatKolom, Pesan, kelasInput, kelasTombol } from "@/components/ui";

const awal: LaporState = { percobaan: 0, errors: {}, values: {} };

export function FormLapor({ kategori }: { kategori: Kategori[] }) {
  const [state, action, pending] = useActionState(buatLaporan, awal);
  const { errors, values } = state;

  return (
    // noValidate: semua validasi dilakukan di server agar pesan galat seragam per kolom.
    // key berubah tiap percobaan supaya isian lama (values) dipasang ulang dan tidak hilang.
    <form key={state.percobaan} action={action} noValidate className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {state.pesan && <Pesan jenis="galat">{state.pesan}</Pesan>}

      <div>
        <label htmlFor="kategori_id" className="text-sm font-medium text-slate-700">Kategori</label>
        <select
          id="kategori_id"
          name="kategori_id"
          defaultValue={values.kategori_id ?? ""}
          aria-invalid={Boolean(errors.kategori_id)}
          className={kelasInput}
        >
          <option value="">— Pilih kategori —</option>
          {kategori.map((k) => (
            <option key={k.id} value={k.id}>{k.nama}</option>
          ))}
        </select>
        <GalatKolom pesan={errors.kategori_id} />
      </div>

      <div>
        <label htmlFor="judul" className="text-sm font-medium text-slate-700">Judul <span className="text-slate-400">(5–80 huruf)</span></label>
        <input id="judul" name="judul" defaultValue={values.judul} aria-invalid={Boolean(errors.judul)} className={kelasInput} placeholder="mis. AC kelas tidak dingin" />
        <GalatKolom pesan={errors.judul} />
      </div>

      <div>
        <label htmlFor="deskripsi" className="text-sm font-medium text-slate-700">Deskripsi <span className="text-slate-400">(10–500 huruf)</span></label>
        <textarea id="deskripsi" name="deskripsi" rows={4} defaultValue={values.deskripsi} aria-invalid={Boolean(errors.deskripsi)} className={kelasInput} placeholder="Jelaskan kerusakan yang terjadi" />
        <GalatKolom pesan={errors.deskripsi} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lokasi" className="text-sm font-medium text-slate-700">Lokasi <span className="text-slate-400">(3–60 huruf)</span></label>
          <input id="lokasi" name="lokasi" defaultValue={values.lokasi} aria-invalid={Boolean(errors.lokasi)} className={kelasInput} placeholder="mis. Ruang X-1" />
          <GalatKolom pesan={errors.lokasi} />
        </div>
        <div>
          <label htmlFor="pelapor" className="text-sm font-medium text-slate-700">Nama pelapor <span className="text-slate-400">(3–40 huruf)</span></label>
          <input id="pelapor" name="pelapor" defaultValue={values.pelapor} aria-invalid={Boolean(errors.pelapor)} className={kelasInput} placeholder="Nama Anda" />
          <GalatKolom pesan={errors.pelapor} />
        </div>
      </div>

      <button type="submit" disabled={pending} className={kelasTombol}>
        {pending ? "Mengirim…" : "Kirim laporan"}
      </button>
    </form>
  );
}
