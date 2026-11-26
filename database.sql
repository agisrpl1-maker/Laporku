-- =====================================================================
-- LaporKu - Skrip pembuatan basis data (Supabase / PostgreSQL)
-- Jalankan seluruh isi berkas ini di Supabase Dashboard > SQL Editor.
-- Skrip aman dijalankan ulang (menghapus tabel lama lebih dulu).
-- =====================================================================

drop table if exists public.laporan cascade;
drop table if exists public.kategori cascade;
drop function if exists public.tambah_dukungan(text);
drop function if exists public.laporan_sebelum_tambah();
drop function if exists public.laporan_sebelum_ubah();

-- ---------------------------------------------------------------------
-- Tabel kategori
-- ---------------------------------------------------------------------
create table public.kategori (
  id   bigint generated always as identity primary key,
  nama text   not null unique
       constraint kategori_nama_panjang check (char_length(btrim(nama)) between 3 and 30)
);

-- ---------------------------------------------------------------------
-- Tabel laporan
-- ---------------------------------------------------------------------
create table public.laporan (
  id          bigint generated always as identity primary key,
  -- kode dibentuk otomatis dari id, contoh: id 7 -> LP-0007
  kode        text generated always as ('LP-' || lpad(id::text, 4, '0')) stored unique,
  kategori_id bigint not null references public.kategori (id) on delete restrict,
  judul       text   not null
              constraint laporan_judul_panjang check (char_length(btrim(judul)) between 5 and 80),
  deskripsi   text   not null
              constraint laporan_deskripsi_panjang check (char_length(btrim(deskripsi)) between 10 and 500),
  lokasi      text   not null
              constraint laporan_lokasi_panjang check (char_length(btrim(lokasi)) between 3 and 60),
  pelapor     text   not null
              constraint laporan_pelapor_panjang check (char_length(btrim(pelapor)) between 3 and 40),
  status      text   not null default 'baru'
              constraint laporan_status_valid check (status in ('baru', 'diproses', 'selesai')),
  tanggapan   text,
  dukungan    integer not null default 0
              constraint laporan_dukungan_positif check (dukungan >= 0),
  dibuat      timestamptz not null default now(),
  diperbarui  timestamptz not null default now(),
  -- Status "selesai" wajib memiliki tanggapan minimal 10 huruf
  constraint laporan_selesai_wajib_tanggapan
    check (status <> 'selesai' or char_length(btrim(coalesce(tanggapan, ''))) >= 10)
);

create index laporan_kategori_idx on public.laporan (kategori_id);
create index laporan_status_idx on public.laporan (status);

-- ---------------------------------------------------------------------
-- Aturan bisnis yang dijaga basis data (lapis kedua setelah server)
-- ---------------------------------------------------------------------

-- 1) Satu pelapor (tidak peka huruf besar) maksimal 3 laporan berstatus "baru"
create function public.laporan_sebelum_tambah()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.status := coalesce(new.status, 'baru');
  if new.status = 'baru' and (
    select count(*) from public.laporan
    where lower(btrim(pelapor)) = lower(btrim(new.pelapor)) and status = 'baru'
  ) >= 3 then
    raise exception 'BATAS_LAPORAN_BARU' using errcode = 'P0001',
      hint = 'Pelapor sudah memiliki 3 laporan berstatus baru.';
  end if;
  return new;
end;
$$;

create trigger laporan_cek_tambah
before insert on public.laporan
for each row execute function public.laporan_sebelum_tambah();

-- 2) Status hanya boleh maju satu langkah: baru -> diproses -> selesai
-- 3) Kolom diperbarui otomatis terisi saat baris diubah
create function public.laporan_sebelum_ubah()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if not (
      (old.status = 'baru' and new.status = 'diproses') or
      (old.status = 'diproses' and new.status = 'selesai')
    ) then
      raise exception 'STATUS_TIDAK_VALID' using errcode = 'P0001',
        hint = format('Status tidak boleh berubah dari %s ke %s.', old.status, new.status);
    end if;
  end if;
  new.diperbarui := now();
  return new;
end;
$$;

create trigger laporan_cek_ubah
before update on public.laporan
for each row execute function public.laporan_sebelum_ubah();

-- 4) Tambah dukungan secara atomik (dipanggil server dengan kunci rahasia)
create function public.tambah_dukungan(p_kode text)
returns integer
language sql
set search_path = public
as $$
  update public.laporan
     set dukungan = dukungan + 1
   where kode = p_kode
  returning dukungan;
$$;

revoke execute on function public.tambah_dukungan(text) from public, anon, authenticated;
grant execute on function public.tambah_dukungan(text) to service_role;

-- ---------------------------------------------------------------------
-- Row Level Security (aktif pada semua tabel)
--   kategori : kunci publik hanya boleh BACA
--   laporan  : kunci publik TIDAK punya akses sama sekali (tanpa policy)
--   Kunci rahasia (service_role) melewati RLS -> baca/tambah/ubah/hapus.
-- ---------------------------------------------------------------------
alter table public.kategori enable row level security;
alter table public.laporan  enable row level security;

create policy "kategori dapat dibaca publik"
  on public.kategori for select
  to anon, authenticated
  using (true);

-- Cabut hak tulis dari peran publik sebagai lapisan tambahan
revoke insert, update, delete on public.kategori from anon, authenticated;
revoke all on public.laporan from anon, authenticated;

-- ---------------------------------------------------------------------
-- Data contoh (fiktif)
-- ---------------------------------------------------------------------
insert into public.kategori (nama) values
  ('AC dan Pendingin'),
  ('Proyektor'),
  ('Keran dan Air'),
  ('Meja dan Kursi'),
  ('Listrik dan Lampu');

-- Laporan disisipkan dengan status awal "baru", lalu dimajukan
-- sesuai alur agar konsisten dengan aturan transisi status.
insert into public.laporan (kategori_id, judul, deskripsi, lokasi, pelapor) values
  (1, 'AC kelas tidak dingin', 'AC di kelas hanya mengeluarkan angin biasa sejak hari Senin.', 'Ruang X-1', 'Budi Santoso'),
  (2, 'Proyektor tidak menyala', 'Proyektor tidak mau menyala walau kabel daya sudah terpasang.', 'Ruang XI-2', 'Siti Aminah'),
  (3, 'Keran wastafel bocor', 'Keran wastafel terus meneteskan air dan lantai menjadi licin.', 'Toilet Lantai 2', 'Andi Pratama'),
  (4, 'Kursi patah di kelas', 'Dua kursi siswa kakinya patah sehingga tidak bisa diduduki.', 'Ruang XII-3', 'Dewi Lestari'),
  (5, 'Lampu koridor mati', 'Tiga lampu di koridor lantai satu mati dan koridor gelap sore hari.', 'Koridor Lantai 1', 'Rudi Hartono'),
  (1, 'AC ruang guru berisik', 'AC di ruang guru mengeluarkan bunyi keras ketika dinyalakan.', 'Ruang Guru', 'Pak Joko'),
  (2, 'Kabel HDMI proyektor rusak', 'Gambar proyektor sering berkedip karena kabel HDMI terkelupas.', 'Laboratorium', 'Rina Wati'),
  (3, 'Air toilet tidak mengalir', 'Air di toilet putra tidak mengalir sejak pagi sehingga tidak bisa dipakai.', 'Toilet Lantai 1', 'Agus Salim'),
  (4, 'Meja guru goyang', 'Meja guru goyang karena salah satu kakinya longgar dan perlu dikencangkan.', 'Ruang X-4', 'Bu Ratna'),
  (5, 'Stopkontak gosong', 'Stopkontak di belakang kelas terlihat gosong dan berbau terbakar.', 'Ruang XI-1', 'Fajar Nugroho');

update public.laporan set status = 'diproses', dukungan = 4 where id in (2, 5, 8);
update public.laporan set status = 'diproses', dukungan = 7 where id in (3, 9);
update public.laporan set status = 'selesai', dukungan = 12,
  tanggapan = 'Keran sudah diganti dengan yang baru oleh petugas sarana-prasarana.' where id = 3;
update public.laporan set status = 'selesai', dukungan = 3,
  tanggapan = 'Kaki meja sudah dikencangkan dan meja sudah stabil kembali.' where id = 9;
update public.laporan set tanggapan = 'Teknisi dijadwalkan memeriksa proyektor hari Kamis.' where id = 2;
update public.laporan set dukungan = 2 where id in (1, 4);
