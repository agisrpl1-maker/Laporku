"use client";

import { useActionState, useEffect, useState } from "react";
import { buatLaporan, type LaporState } from "@/app/actions";
import type { Kategori } from "@/lib/types";
import { GalatKolom, Pesan, kelasInput, kelasTombol } from "@/components/ui";

const awal: LaporState = { percobaan: 0, errors: {}, values: {} };

export function FormLapor({ kategori, namaDefault = "" }: { kategori: Kategori[]; namaDefault?: string }) {
  const [state, action, pending] = useActionState(buatLaporan, awal);
  const [fileFoto, setFileFoto] = useState<File | null>(null);
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const { errors, values } = state;

  useEffect(() => {
    return () => {
      if (pratinjau) URL.revokeObjectURL(pratinjau);
    };
  }, [pratinjau]);

  function onPilihFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (pratinjau) URL.revokeObjectURL(pratinjau);
    setFileFoto(file);
    setPratinjau(file ? URL.createObjectURL(file) : null);
  }

  function hapusFotoPilihan() {
    if (pratinjau) URL.revokeObjectURL(pratinjau);
    setFileFoto(null);
    setPratinjau(null);
  }

  function kirim(formData: FormData) {
    const entri = formData.get("foto");
    if ((!(entri instanceof File) || entri.size === 0) && fileFoto) {
      formData.set("foto", fileFoto);
    }
    action(formData);
  }

  return (
    // noValidate: semua validasi dilakukan di server agar pesan galat seragam per kolom.
    // key berubah tiap percobaan supaya isian lama (values) dipasang ulang dan tidak hilang.
    <form key={state.percobaan} action={kirim} noValidate className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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
          <input id="pelapor" name="pelapor" defaultValue={values.pelapor ?? namaDefault} aria-invalid={Boolean(errors.pelapor)} className={kelasInput} placeholder="Nama Anda" />
          <GalatKolom pesan={errors.pelapor} />
        </div>
      </div>

      <div>
        <label htmlFor="foto" className="text-sm font-medium text-slate-700">
          Foto kerusakan <span className="text-slate-400">(opsional · JPG/PNG/WebP, maks. 2 MB)</span>
        </label>
        <input
          id="foto"
          name="foto"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPilihFoto}
          aria-invalid={Boolean(errors.foto)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-700 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 aria-[invalid=true]:border-red-500"
        />
        <GalatKolom pesan={errors.foto} />
        {pratinjau && fileFoto && (
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-1.5 text-xs text-slate-600">
              <span className="truncate">{fileFoto.name}</span>
              <button
                type="button"
                onClick={hapusFotoPilihan}
                className="ml-2 font-medium text-red-600 hover:underline"
              >
                Hapus
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pratinjau} alt="Pratinjau foto kerusakan" className="max-h-60 w-full object-contain" />
          </div>
        )}
      </div>

      <button type="submit" disabled={pending} className={kelasTombol}>
        {pending ? "Mengirim…" : "Kirim laporan"}
      </button>
    </form>
  );
}
