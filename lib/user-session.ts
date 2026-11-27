import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { samaAman } from "./session";

/**
 * Sesi pengunjung (warga sekolah) berbasis cookie httpOnly yang ditandatangani
 * HMAC-SHA256 memakai SESSION_SECRET.
 * Isi token: "<user_id>.<kedaluwarsa_ms>.<tanda_tangan>".
 */
export const USER_SESSION_COOKIE = "laporku_user";
export const USER_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari (detik)

const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET belum diatur (minimal 16 karakter).");
  }
  return secret;
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacUser(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

export async function buatTokenPengguna(userId: number, nowMs: number): Promise<string> {
  const exp = nowMs + USER_SESSION_MAX_AGE * 1000;
  return `${userId}.${exp}.${await hmacUser(`user:${userId}:${exp}`)}`;
}

export async function bacaTokenPengguna(token: string | undefined, nowMs: number): Promise<number | null> {
  if (!token) return null;
  const bagian = token.split(".");
  if (bagian.length !== 3) return null;
  const [idText, expText, signature] = bagian;
  const userId = Number(idText);
  const exp = Number(expText);
  if (!Number.isInteger(userId) || userId <= 0 || !Number.isFinite(exp) || exp < nowMs || !signature) {
    return null;
  }
  try {
    const cocok = samaAman(signature, await hmacUser(`user:${userId}:${exp}`));
    return cocok ? userId : null;
  } catch {
    return null;
  }
}

/** Hash kata sandi memakai scrypt dengan salt acak 16 byte. */
export function hashSandi(sandi: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(sandi, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

/** Verifikasi kata sandi terhadap hash scrypt dengan perbandingan waktu konstan. */
export function verifikasiSandi(sandi: string, tersimpan: string): boolean {
  const [salt, hashHex] = tersimpan.split(":");
  if (!salt || !hashHex) return false;
  try {
    const hashAsli = Buffer.from(hashHex, "hex");
    const hashCek = scryptSync(sandi, salt, 64);
    if (hashAsli.length !== hashCek.length) return false;
    return timingSafeEqual(hashAsli, hashCek);
  } catch {
    return false;
  }
}
