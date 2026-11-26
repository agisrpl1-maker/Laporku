import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isAdmin } from "@/lib/auth";
import { Judul, Memuat } from "@/components/ui";
import { FormLogin } from "./form-login";

export const metadata: Metadata = { title: "Login admin" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm">
      <Judul sub="Khusus petugas sarana-prasarana.">Login admin</Judul>
      <Suspense fallback={<Memuat />}>
        <Konten />
      </Suspense>
    </div>
  );
}

async function Konten() {
  // Admin yang sudah masuk langsung dialihkan ke /admin
  if (await isAdmin()) redirect("/admin");
  return <FormLogin />;
}
