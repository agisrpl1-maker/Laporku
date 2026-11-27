-- =====================================================================
-- LaporKu - Migrasi tambahan (aman dijalankan tanpa menghapus data lama)
-- Jalankan di Supabase Dashboard > SQL Editor untuk proyek yang sudah ada.
-- =====================================================================

-- 1. Kolom foto_url untuk unggah foto kerusakan
alter table public.laporan
  add column if not exists foto_url text;

-- 2. Tabel pengguna (akun pengunjung untuk pembatasan dukungan mutlak)
create table if not exists public.pengguna (
  id            bigint generated always as identity primary key,
  nama          text   not null
                constraint pengguna_nama_panjang check (char_length(btrim(nama)) between 3 and 40),
  email         text   not null unique
                constraint pengguna_email_valid check (position('@' in btrim(email)) > 1),
  password_hash text   not null,
  dibuat        timestamptz not null default now()
);

create unique index if not exists pengguna_email_lower_idx on public.pengguna (lower(btrim(email)));

-- 3. Tabel dukungan_laporan (1 akun maksimal 1 dukungan per laporan)
create table if not exists public.dukungan_laporan (
  id          bigint generated always as identity primary key,
  laporan_id  bigint not null references public.laporan (id) on delete cascade,
  pengguna_id bigint not null references public.pengguna (id) on delete cascade,
  dibuat      timestamptz not null default now(),
  constraint dukungan_unik_per_akun unique (laporan_id, pengguna_id)
);

create index if not exists dukungan_laporan_pengguna_idx on public.dukungan_laporan (pengguna_id);

-- 4. Fungsi atomik dukungan berbasis akun
create or replace function public.tambah_dukungan_pengguna(p_kode text, p_pengguna_id bigint)
returns integer
language plpgsql
set search_path = public
as $$
declare
  v_laporan_id bigint;
  v_dukungan   integer;
begin
  select id into v_laporan_id from public.laporan where kode = p_kode;
  if v_laporan_id is null then
    return null;
  end if;

  insert into public.dukungan_laporan (laporan_id, pengguna_id)
  values (v_laporan_id, p_pengguna_id);

  update public.laporan
     set dukungan = dukungan + 1
   where id = v_laporan_id
  returning dukungan into v_dukungan;

  return v_dukungan;
exception
  when unique_violation then
    raise exception 'SUDAH_DIDUKUNG' using errcode = 'P0001',
      hint = 'Akun ini sudah mendukung laporan tersebut.';
end;
$$;

revoke execute on function public.tambah_dukungan_pengguna(text, bigint) from public, anon, authenticated;
grant execute on function public.tambah_dukungan_pengguna(text, bigint) to service_role;

-- 5. RLS pada tabel baru
alter table public.pengguna         enable row level security;
alter table public.dukungan_laporan enable row level security;
revoke all on public.pengguna from anon, authenticated;
revoke all on public.dukungan_laporan from anon, authenticated;
