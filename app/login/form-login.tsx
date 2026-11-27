"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Pesan, kelasInput, kelasTombol } from "@/components/ui";

export function FormLogin() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="animate-fade-up space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
      {state.pesan && <Pesan jenis="galat">{state.pesan}</Pesan>}
      <div>
        <label htmlFor="sandi" className="text-sm font-medium text-slate-700">Kata sandi admin</label>
        <input id="sandi" name="sandi" type="password" autoComplete="current-password" className={kelasInput} />
      </div>
      <button type="submit" disabled={pending} className={`${kelasTombol} w-full`}>
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
