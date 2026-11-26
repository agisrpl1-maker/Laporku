/**
 * Sesi admin berbasis cookie yang ditandatangani HMAC-SHA256 memakai SESSION_SECRET.
 * Isi token: "<kedaluwarsa_ms>.<tanda_tangan>". Tanpa SESSION_SECRET token tidak
 * bisa dipalsukan. Memakai Web Crypto agar bisa dipakai di proxy maupun server.
 */
export const SESSION_COOKIE = "laporku_admin";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 jam (detik)

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

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

/** Perbandingan string dengan waktu konstan untuk mencegah serangan timing. */
export function samaAman(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function buatToken(nowMs: number): Promise<string> {
  const exp = nowMs + SESSION_MAX_AGE * 1000;
  return `${exp}.${await hmac(`admin:${exp}`)}`;
}

export async function tokenValid(token: string | undefined, nowMs: number): Promise<boolean> {
  if (!token) return false;
  const [expText, signature] = token.split(".");
  const exp = Number(expText);
  if (!signature || !Number.isFinite(exp) || exp < nowMs) return false;
  try {
    return samaAman(signature, await hmac(`admin:${exp}`));
  } catch {
    return false;
  }
}

/** Membandingkan kata sandi lewat HMAC agar panjang & isi tidak bocor lewat timing. */
export async function sandiBenar(input: string): Promise<boolean> {
  const sandi = process.env.ADMIN_PASSWORD;
  if (!sandi) return false;
  return samaAman(await hmac(`pw:${input}`), await hmac(`pw:${sandi}`));
}
