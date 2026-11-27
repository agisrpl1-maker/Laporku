import Link from "next/link";
import { getPenggunaAktif } from "@/lib/user-auth";
import { keluarPengguna } from "@/app/masuk/actions";

export async function MenuPengguna() {
  const pengguna = await getPenggunaAktif();

  if (!pengguna) {
    return (
      <Link
        href="/masuk"
        className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
      >
        Masuk
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="max-w-36 truncate rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
        👤 {pengguna.nama}
      </span>
      <form action={keluarPengguna}>
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          Keluar
        </button>
      </form>
    </div>
  );
}
