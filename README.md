# LaporKu — Aplikasi Pelaporan Kerusakan Fasilitas Sekolah

Warga sekolah (murid, guru, tenaga kependidikan) dapat melaporkan kerusakan fasilitas
(AC, proyektor, keran, kursi, lampu) lengkap dengan foto kerusakan lewat web, memantau
perkembangannya, dan memberi dukungan berbasis akun. Petugas sarana-prasarana (admin)
mengelola status, tanggapan, dan kategori.

## 1. Nama aplikasi dan alamat Vercel

- **Nama aplikasi:** LaporKu
- **Alamat Vercel:** `https://<nama-proyek>.vercel.app` ← _ganti dengan alamat hasil deploy_
- **Repositori:** https://github.com/agisrpl1-maker/Laporku

Teknologi: Next.js 16 (App Router, Server Components, Server Actions), React 19,
TypeScript, Tailwind CSS 4, Supabase (PostgreSQL + RLS + Storage), Vercel.

## 2. Cara menjalankan di laptop

Prasyarat: Node.js 20+, Git, proyek Supabase.

1. Klon repositori lalu pasang dependensi:
   ```bash
   git clone https://github.com/agisrpl1-maker/Laporku.git
   cd Laporku
   npm install
   ```
2. Buka **Supabase Dashboard → SQL Editor**, tempel seluruh isi [`database.sql`](database.sql),
   lalu **Run**. Skrip membuat tabel (`kategori`, `laporan`, `pengguna`, `dukungan_laporan`),
   aturan, RLS, fungsi atomik, dan data contoh (5 kategori, 10 laporan).
   - Bila basis data sudah berisi data lama, jalankan [`migration.sql`](migration.sql) agar data lama tidak terhapus.
3. Buka **Supabase Dashboard → Storage**, buat bucket publik bernama `foto-laporan` untuk menyimpan foto kerusakan.
4. Buat berkas `.env.local` di akar proyek (berkas ini diabaikan Git) berisi variabel berikut
   **(nilai tidak dicantumkan di sini)**:

   | Variabel | Keterangan |
   | --- | --- |
   | `SUPABASE_URL` | URL proyek Supabase (Project Settings → API) |
   | `SUPABASE_SECRET_KEY` | Kunci rahasia (`sb_secret_…`), hanya dipakai di server |
   | `ADMIN_PASSWORD` | Kata sandi login admin |
   | `SESSION_SECRET` | String acak ≥ 32 karakter untuk menandatangani cookie sesi admin & pengunjung |

5. Jalankan: `npm run dev` lalu buka http://localhost:3000.
6. Pemeriksaan kualitas: `npm run lint` dan `npm run build`.

**Deploy ke Vercel:** impor repositori GitHub di Vercel, isi keempat variabel lingkungan di
_Project Settings → Environment Variables_, lalu Deploy.

## 3. Daftar halaman dan fungsinya

| Halaman | Fungsi | Akses |
| --- | --- | --- |
| `/` | Ringkasan jumlah laporan per status + 5 laporan terbaru | Publik |
| `/laporan` | Daftar laporan dengan paginasi (`?hal=`); saring `?kategori=`, `?status=`, `?q=` lewat URL | Publik |
| `/laporan/[kode]` | Detail laporan (mis. `LP-0007`), foto kerusakan, tanggapan petugas, tombol **Dukung** | Publik (dukungan wajib masuk akun) |
| `/lapor` | Formulir lapor: kategori, judul, deskripsi, lokasi, nama pelapor, unggah foto kerusakan (opsional) | Publik |
| `/lacak` | Cari laporan berdasarkan kode | Publik |
| `/daftar` | Pendaftaran akun warga sekolah (nama, email, kata sandi) | Publik |
| `/masuk` | Login akun warga sekolah untuk mendukung laporan | Publik |
| `/login` | Login admin dengan kata sandi; yang sudah masuk dialihkan ke `/admin` | Publik |
| `/admin` | Daftar semua laporan beserta status dan pelapor | Admin |
| `/admin/laporan/[id]` | Lihat detail & foto, ubah status, isi tanggapan, hapus laporan (beserta fotonya) | Admin |
| `/admin/kategori` | Tambah dan hapus kategori | Admin |
| Tombol **Keluar** | Menghapus cookie sesi lalu kembali ke `/login` (admin) atau `/` (pengunjung) | Admin / Pengunjung |

URL yang tidak valid (`/laporan/abc`, `/laporan/LP-9999`) menampilkan halaman 404.

## 4. Aturan bisnis dan lapisan penerapannya

Semua aturan **selalu diperiksa di server** (Server Action). Sebagian juga dijaga **basis data**
sehingga tetap aman walau ada yang memanggil API langsung.

| Aturan | Server (Server Action) | Basis data |
| --- | --- | --- |
| Judul 5–80, deskripsi 10–500, lokasi 3–60, pelapor 3–40 huruf; galat tampil per kolom & isian tidak hilang | `lib/validasi.ts` → `bacaLaporan` | `CHECK` constraint panjang kolom |
| Foto kerusakan opsional: hanya JPG/PNG/WebP, maksimal 2 MB | `lib/validasi.ts` + `lib/storage.ts` | Kolom `foto_url` (opsional) + Supabase Storage `foto-laporan` |
| Satu pelapor (tidak peka huruf besar) maks. 3 laporan berstatus `baru` | `app/actions.ts` → `buatLaporan` | Trigger `laporan_sebelum_tambah` |
| Status hanya maju: baru → diproses → selesai | `bacaUbahLaporan` | Trigger `laporan_sebelum_ubah` |
| Status `selesai` wajib tanggapan ≥ 10 huruf | `bacaUbahLaporan` | `CHECK laporan_selesai_wajib_tanggapan` |
| Dukung +1; 1 akun maksimal 1 dukungan per laporan | `dukungLaporan` memeriksa sesi akun (`getPenggunaAktif`) | Fungsi atomik `tambah_dukungan_pengguna` + `UNIQUE(laporan_id, pengguna_id)` di `dukungan_laporan` |
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
  - `laporan`, `pengguna`, `dukungan_laporan`: kunci publik **tidak punya akses sama sekali**
    (tanpa policy + `revoke all`), sehingga data pribadi (nama pelapor, email, hash sandi) tidak bisa dibaca publik.
  - Kunci rahasia (`service_role`) melewati RLS → baca/tambah/ubah/hapus, hanya di server.
- **Data pribadi:** nama pelapor tidak pernah ditampilkan di halaman publik; hanya di halaman admin. Kata sandi akun pengunjung di-hash memakai `scrypt` dengan salt acak (`lib/user-session.ts`).
- **Admin:** sesi berupa cookie `httpOnly`, `sameSite=lax`, `secure` (produksi), ditandatangani
  HMAC-SHA256 dengan `SESSION_SECRET` dan kedaluwarsa 8 jam. Perlindungan tiga lapis:
  1. `proxy.ts` mengalihkan setiap `/admin/*` tanpa sesi valid ke `/login`;
  2. setiap halaman admin memanggil `requireAdmin()`;
  3. **setiap Server Action admin** memanggil `requireAdmin()` lebih dulu, sehingga aksi tidak
     bisa dijalankan tanpa login walau dipanggil langsung.
- Kata sandi dibandingkan dengan waktu konstan untuk mencegah serangan _timing_.
- Berkas `.env*` diabaikan Git; tidak ada rahasia di repositori.

## 6. Masalah yang ditemukan dan perbaikannya

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| Galat `Blocking Route` di `/login`: `Next.js encountered the unstable value Date.now() while prerendering` | Di Next.js 16 dengan `cacheComponents: true`, `cookies()` di `lib/auth.ts` dapat dievaluasi saat prerender runtime sehingga `Date.now()` dianggap tidak stabil | Menambahkan `await connection()` dari `next/server` sebelum `cookies()` dan `Date.now()` di `isAdmin()` |
| Setelah galat validasi, pilihan **kategori** di formulir lapor kembali kosong padahal teks lain tetap | React mereset formulir setelah Server Action; `defaultValue` pada `<select>` tidak diperbarui setelah render pertama | State action menyimpan `values` + penghitung `percobaan`; formulir diberi `key={percobaan}` sehingga dipasang ulang dengan nilai terakhir |
| Kata kunci berisi koma/kurung (mis. `ac,(`) membuat halaman `/laporan` galat | Karakter tersebut adalah sintaks filter `or()` PostgREST | Kata kunci dibersihkan (`bersihkanKataKunci`) sebelum dipakai di filter |
| Halaman admin bisa dibuka lewat URL langsung bila hanya menyembunyikan menu | Proteksi hanya di tampilan | Ditambahkan `proxy.ts` + `requireAdmin()` di halaman dan di setiap Server Action |
