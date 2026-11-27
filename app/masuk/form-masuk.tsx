"use client";

import Link from "next/link";
import { useActionState } from "react";
import { masukPengguna, type MasukState } from "./actions";
import { GalatKolom, Pesan, kelasInput, kelasTombol } from "@/components/ui";

const awal: MasukState = { percobaan: 0, errors: {} };

export function FormMasuk({ kembali }: { kembali: string }) {
  const [state, action, pending] = useActionState(masukPengguna, awal);
  const hrefDaftar = kembali !== "/laporan" ? `/daftar?kembali=${encodeURIComponent(kembali)}` : "/daftar";

  return (
    <form
      key={state.percobaan}
      action={action}
      noValidate
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="kembali" value={kembali} />
      {state.pesan && <Pesan jenis="galat">{state.pesan}</Pesan>}

      <div>
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          aria-invalid={Boolean(state.errors.email)}
          className={kelasInput}
          placeholder="nama@sekolah.sch.id"
        />
        <GalatKolom pesan={state.errors.email} />
      </div>

      <div>
        <label htmlFor="sandi" className="text-sm font-medium text-slate-700">
          Kata sandi
        </label>
        <input
          id="sandi"
          name="sandi"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(state.errors.sandi)}
          className={kelasInput}
        />
        <GalatKolom pesan={state.errors.sandi} />
      </div>

      <button type="submit" disabled={pending} className={`${kelasTombol} w-full`}>
        {pending ? "Memproses…" : "Masuk"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Belum punya akun?{" "}
        <Link href={hrefDaftar} className="font-semibold text-blue-700 hover:underline">
          Daftar di sini
        </Link>
      </p>
    </form>
  );
}
