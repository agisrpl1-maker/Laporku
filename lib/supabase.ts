import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Klien Supabase khusus server memakai kunci rahasia (SUPABASE_SECRET_KEY).
 * Kunci rahasia melewati RLS, sehingga TIDAK BOLEH dipakai di Client Component.
 * `import "server-only"` membuat build gagal bila berkas ini terimpor ke browser.
 */
let client: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error(
      "Variabel lingkungan SUPABASE_URL dan SUPABASE_SECRET_KEY belum diatur.",
    );
  }

  client = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
