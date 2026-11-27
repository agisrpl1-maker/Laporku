"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import {
  buatTokenPengguna,
  hashSandi,
  USER_SESSION_COOKIE,
  USER_SESSION_MAX_AGE,
  verifikasiSandi,
} from "@/lib/user-session";
import {
  bacaDaftar,
  bacaMasuk,
  tujuanAman,
  type DaftarField,
  type FieldErrors,
  type MasukField,
} from "@/lib/validasi";
import { pesanGalatDb } from "@/lib/format";

async function simpanCookiePengguna(userId: number) {
  const token = await buatTokenPengguna(userId, Date.now());
  (await cookies()).set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: USER_SESSION_MAX_AGE,
  });
}

/* ============================== Masuk pengunjung ============================== */

export type MasukState = {
  percobaan: number;
  pesan?: string;
  errors: FieldErrors<MasukField>;
  email?: string;
};

export async function masukPengguna(prev: MasukState, formData: FormData): Promise<MasukState> {
  const percobaan = prev.percobaan + 1;
  const { email, sandi, errors, valid } = bacaMasuk(formData);
  const kembali = tujuanAman(
    typeof formData.get("kembali") === "string" ? String(formData.get("kembali")) : undefined,
  );

  if (!valid) {
    return { percobaan, email, errors, pesan: "Periksa kembali email dan kata sandi Anda." };
  }

  const { data: user, error } = await supabaseServer()
    .from("pengguna")
    .select("id, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return { percobaan, email, errors: {}, pesan: pesanGalatDb(error) };
  }

  if (!user || !verifikasiSandi(sandi, user.password_hash)) {
    return { percobaan, email, errors: {}, pesan: "Email atau kata sandi salah." };
  }

  await simpanCookiePengguna(user.id);
  redirect(kembali);
}

/* ============================== Daftar pengunjung ============================== */

export type DaftarState = {
  percobaan: number;
  pesan?: string;
  errors: FieldErrors<DaftarField>;
  values: Partial<Record<"nama" | "email", string>>;
};

export async function daftarPengguna(prev: DaftarState, formData: FormData): Promise<DaftarState> {
  const percobaan = prev.percobaan + 1;
  const { values, sandi, errors, valid } = bacaDaftar(formData);
  const kembali = tujuanAman(
    typeof formData.get("kembali") === "string" ? String(formData.get("kembali")) : undefined,
  );

  if (!valid) {
    return { percobaan, values, errors, pesan: "Periksa kembali isian yang ditandai merah." };
  }

  const db = supabaseServer();
  const { data: ada } = await db
    .from("pengguna")
    .select("id")
    .eq("email", values.email)
    .maybeSingle();

  if (ada) {
    return {
      percobaan,
      values,
      errors: { email: "Email ini sudah terdaftar. Silakan masuk dengan akun tersebut." },
    };
  }

  const { data: baru, error } = await db
    .from("pengguna")
    .insert({
      nama: values.nama,
      email: values.email,
      password_hash: hashSandi(sandi),
    })
    .select("id")
    .single();

  if (error || !baru) {
    const errEmail = error?.code === "23505" ? "Email ini sudah terdaftar." : undefined;
    return {
      percobaan,
      values,
      errors: errEmail ? { email: errEmail } : {},
      pesan: errEmail ?? pesanGalatDb(error ?? {}),
    };
  }

  await simpanCookiePengguna(baru.id);
  redirect(kembali);
}

/* ============================== Keluar pengunjung ============================== */

export async function keluarPengguna() {
  (await cookies()).delete(USER_SESSION_COOKIE);
  redirect("/");
}
