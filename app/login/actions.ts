"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buatToken, sandiBenar, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export type LoginState = { pesan?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const sandi = formData.get("sandi");
  if (typeof sandi !== "string" || sandi.length === 0) {
    return { pesan: "Kata sandi wajib diisi." };
  }
  if (!(await sandiBenar(sandi))) {
    return { pesan: "Kata sandi salah. Silakan coba lagi." };
  }

  (await cookies()).set(SESSION_COOKIE, await buatToken(Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
