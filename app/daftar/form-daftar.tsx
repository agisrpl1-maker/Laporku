"use client";

import Link from "next/link";
import { useActionState } from "react";
import { daftarPengguna, type DaftarState } from "@/app/masuk/actions";
import { GalatKolom, Pesan, kelasInput, kelasTombol } from "@/components/ui";

const awal: DaftarState = { percobaan: 0, errors: {}, values: {} };

export function FormDaftar({ kembali }: { kembali: string }) {
  const [state, action, pending] = useActionState(daftarPengguna, awal);
  const hrefMasuk = kembali !== "/laporan" ? `/masuk?kembali=${encodeURIComponent(kembali)}` : "/masuk";

  return (
    <form
      key={state.percobaan}
      action={action}
      noValidate
      className="animate-fade-up space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="kembali" value={kembali} />
      {state.pesan && <Pesan jenis="galat">{state.pesan}</Pesan>}

      <div>
        <label htmlFor="nama" className="text-sm font-medium text-slate-700">
          Nama lengkap <span className="text-slate-400">(3–40 huruf)</span>
        </label>
        <input
          id="nama"
          name="nama"
          defaultValue={state.values.nama}
          aria-invalid={Boolean(state.errors.nama)}
          className={kelasInput}
          placeholder="mis. Budi Santoso"
        />
        <GalatKolom pesan={state.errors.nama} />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values.email}
          aria-invalid={Boolean(state.errors.email)}
          className={kelasInput}
          placeholder="nama@sekolah.sch.id"
        />
        <GalatKolom pesan={state.errors.email} />
      </div>

      <div>
        <label htmlFor="sandi" className="text-sm font-medium text-slate-700">
          Kata sandi <span className="text-slate-400">(minimal 6 karakter)</span>
        </label>
        <input
          id="sandi"
          name="sandi"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(state.errors.sandi)}
          className={kelasInput}
        />
        <GalatKolom pesan={state.errors.sandi} />
      </div>

      <button type="submit" disabled={pending} className={`${kelasTombol} w-full`}>
        {pending ? "Mendaftar…" : "Daftar"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link href={hrefMasuk} className="font-semibold text-blue-700 hover:underline">
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
