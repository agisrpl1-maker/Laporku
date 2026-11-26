# LaporKu — Aplikasi Pelaporan Kerusakan Fasilitas Sekolah

Warga sekolah (murid, guru, tenaga kependidikan) dapat melaporkan kerusakan fasilitas
(AC, proyektor, keran, kursi, lampu) lewat web, memantau perkembangannya, dan memberi
dukungan. Petugas sarana-prasarana (admin) mengelola status, tanggapan, dan kategori.

## 1. Nama aplikasi dan alamat Vercel

- **Nama aplikasi:** LaporKu
- **Alamat Vercel:** `https://<nama-proyek>.vercel.app` ← _ganti dengan alamat hasil deploy_
- **Repositori:** `https://github.com/<akun>/laporku`

Teknologi: Next.js 16 (App Router, Server Components, Server Actions), React 19,
TypeScript, Tailwind CSS 4, Supabase (PostgreSQL + RLS), Vercel.

## 2. Cara menjalankan di laptop

Prasyarat: Node.js 20+, Git, proyek Supabase.

1. Klon repositori lalu pasang dependensi:
   ```bash
   git clone https://github.com/<akun>/laporku.git
   cd laporku
   npm install
   ```
2. Buka **Supabase Dashboard → SQL Editor**, tempel seluruh isi [`database.sql`](database.sql),
   lalu **Run**. Skrip membuat tabel, aturan, RLS, dan data contoh (5 kategori, 10 laporan).
3. Buat berkas `.env.local` di akar proyek (berkas ini diabaikan Git) berisi variabel berikut
   **(nilai tidak dicantumkan di sini)**:

   | Variabel | Keterangan |
   | --- | --- |
   | `SUPABASE_URL` | URL proyek Supabase (Project Settings → API) |
   | `SUPABASE_SECRET_KEY` | Kunci rahasia (`sb_secret_…`), hanya dipakai di server |
   | `ADMIN_PASSWORD` | Kata sandi login admin |
   | `SESSION_SECRET` | String acak ≥ 32 karakter untuk menandatangani cookie sesi admin |

4. Jalankan: `npm run dev` lalu buka http://localhost:3000.
5. Pemeriksaan kualitas: `npm run lint` dan `npm run build`.

**Deploy ke Vercel:** impor repositori GitHub di Vercel, isi keempat variabel lingkungan di
_Project Settings → Environment Variables_, lalu Deploy.

## 3. Daftar halaman dan fungsinya

| Halaman | Fungsi | Akses |
| --- | --- | --- |
| `/` | Ringkasan jumlah laporan per status + 5 laporan terbaru | Publik |
| `/laporan` | Daftar laporan; saring `?kategori=`, `?status=`, `?q=` lewat URL | Publik |
| `/laporan/[kode]` | Detail laporan (mis. `LP-0007`), tanggapan petugas, tombol **Dukung** | Publik |
| `/lapor` | Formulir lapor: kategori, judul, deskripsi, lokasi, nama pelapor | Publik |
| `/lacak` | Cari laporan berdasarkan kode | Publik |
| `/login` | Login admin dengan kata sandi; yang sudah masuk dialihkan ke `/admin` | Publik |
| `/admin` | Daftar semua laporan beserta status dan pelapor | Admin |
| `/admin/laporan/[id]` | Ubah status, isi tanggapan, hapus laporan | Admin |
| `/admin/kategori` | Tambah dan hapus kategori | Admin |
| Tombol **Keluar** | Menghapus cookie sesi lalu kembali ke `/login` | Admin |

URL yang tidak valid (`/laporan/abc`, `/laporan/LP-9999`) menampilkan halaman 404.

## 4. Aturan bisnis dan lapisan penerapannya

Semua aturan **selalu diperiksa di server** (Server Action). Sebagian juga dijaga **basis data**
sehingga tetap aman walau ada yang memanggil API langsung.

| Aturan | Server (Server Action) | Basis data |
| --- | --- | --- |
| Judul 5–80, deskripsi 10–500, lokasi 3–60, pelapor 3–40 huruf; galat tampil per kolom & isian tidak hilang | `lib/validasi.ts` → `bacaLaporan` | `CHECK` constraint panjang kolom |
| Satu pelapor (tidak peka huruf besar) maks. 3 laporan berstatus `baru` | `app/actions.ts` → `buatLaporan` | Trigger `laporan_sebelum_tambah` |
| Status hanya maju: baru → diproses → selesai | `bacaUbahLaporan` | Trigger `laporan_sebelum_ubah` |
| Status `selesai` wajib tanggapan ≥ 10 huruf | `bacaUbahLaporan` | `CHECK laporan_selesai_wajib_tanggapan` |
| Dukung +1; satu pengunjung tidak bisa mendukung laporan sama dua kali | `dukungLaporan` (cookie httpOnly berisi kode yang sudah didukung) | Fungsi atomik `tambah_dukungan`, `CHECK dukungan >= 0` |
| Kategori yang masih dipakai tidak bisa dihapus (pesan ramah) | `hapusKategori` menghitung pemakaian | `FOREIGN KEY … ON DELETE RESTRICT` |
| Status hanya `baru/diproses/selesai`, nama kategori unik | validasi server | `CHECK` status, `UNIQUE` nama |
| `/laporan/abc` & `/laporan/LP-9999` → 404 | `notFound()` setelah cek pola `^LP-\d{4,}$` dan pencarian | `kode` unik, dibentuk otomatis dari `id` |

Galat basis data diterjemahkan menjadi pesan ramah oleh `lib/format.ts → pesanGalatDb`.

## 5. Keamanan

- **Kunci yang dipakai:** aplikasi hanya memakai **kunci rahasia** (`SUPABASE_SECRET_KEY`) di
  server (`lib/supabase.ts` diberi `import "server-only"` sehingga build gagal bila terimpor ke
  browser). Kunci publik (_publishable_) tidak dipakai aplikasi; tidak ada kunci yang dikirim ke browser.
- **RLS aktif di semua tabel:**
  - `kategori`: kunci publik hanya **baca** (policy `select`), tulis dicabut.
  - `laporan`: kunci publik **tidak punya akses sama sekali** (tanpa policy + `revoke all`),
    sehingga data pribadi (nama pelapor) tidak bisa dibaca publik.
  - Kunci rahasia (`service_role`) melewati RLS → baca/tambah/ubah/hapus, hanya di server.
- **Data pribadi:** nama pelapor tidak pernah ditampilkan di halaman publik; hanya di halaman admin.
- **Admin:** sesi berupa cookie `httpOnly`, `sameSite=lax`, `secure` (produksi), ditandatangani
  HMAC-SHA256 dengan `SESSION_SECRET` dan kedaluwarsa 8 jam. Perlindungan tiga lapis:
  1. `proxy.ts` mengalihkan setiap `/admin/*` tanpa sesi valid ke `/login`;
  2. setiap halaman admin memanggil `requireAdmin()`;
  3. **setiap Server Action admin** memanggil `requireAdmin()` lebih dulu, sehingga aksi tidak
     bisa dijalankan tanpa login walau dipanggil langsung.
- Kata sandi dibandingkan dengan waktu konstan (HMAC) untuk mencegah serangan _timing_.
- Berkas `.env*` diabaikan Git; tidak ada rahasia di repositori.

## 6. Masalah yang ditemukan dan perbaikannya

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| Setelah galat validasi, pilihan **kategori** di formulir lapor kembali kosong padahal teks lain tetap | React mereset formulir setelah Server Action; `defaultValue` pada `<select>` tidak diperbarui setelah render pertama | State action menyimpan `values` + penghitung `percobaan`; formulir diberi `key={percobaan}` sehingga dipasang ulang dengan nilai terakhir |
| Kata kunci berisi koma/kurung (mis. `ac,(`) membuat halaman `/laporan` galat | Karakter tersebut adalah sintaks filter `or()` PostgREST | Kata kunci dibersihkan (`bersihkanKataKunci`) sebelum dipakai di filter |
| Tombol **Dukung** bisa ditekan berulang untuk menaikkan angka | Tidak ada penanda pengunjung yang sudah mendukung | Kode yang sudah didukung disimpan di cookie httpOnly dan dicek di server; penambahan dilakukan atomik oleh fungsi `tambah_dukungan` |
| Halaman admin bisa dibuka lewat URL langsung bila hanya menyembunyikan menu | Proteksi hanya di tampilan | Ditambahkan `proxy.ts` + `requireAdmin()` di halaman dan di setiap Server Action |

## 7. Bagian yang belum selesai

- Pembatasan dukungan memakai cookie; pengunjung yang menghapus cookie / memakai peramban
  lain masih bisa mendukung lagi (perlu login pengunjung untuk pembatasan yang mutlak).
- Belum ada paginasi pada daftar laporan dan unggah foto kerusakan.
- _Isi alamat Vercel dan GitHub pada bagian 1 setelah deploy._
