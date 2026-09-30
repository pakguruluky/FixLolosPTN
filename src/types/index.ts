export type ProgramType = 'SNBP' | 'SNBT' | 'SNBP+SNBT';
export type UserStatus = 'AKTIF' | 'NONAKTIF' | 'PENDING';
export type DaftarStatus = 'AKTIF' | 'PENDING' | 'DITOLAK';
export type PaketAkses = 'TRIAL' | '1MINGGU' | '1BULAN' | '3BULAN' | '1TAHUN' | 'UNLIMITED';
export type AkreditasiSekolah = 'A' | 'B' | 'C' | 'Tidak Terakreditasi';

export interface Siswa {
  nis: string;
  nama_siswa: string;
  nama_ortu: string;
  username: string;
  password?: string;
  password_hash: string;
  password_ortu_hash: string;
  kelas: string;
  asal_sekolah: string;
  provinsi_sekolah: string;
  cabang: string;
  akreditasi: AkreditasiSekolah;
  no_hp_siswa: string;
  no_hp_ortu: string;
  pilihan_program: ProgramType;
  status: UserStatus;
  status_daftar: DaftarStatus;
  akses: PaketAkses;
  akses_mulai: string; // ISO
  akses_akhir: string; // ISO
  created: string;
  token_daftar?: string;
}

export interface NilaiRapor {
  nis: string;
  kurikulum: 'K13' | 'MERDEKA';
  jurusan_peminatan: string;
  mapel: string;
  sem1: number;
  sem2: number;
  sem3: number;
  sem4: number;
  sem5: number;
  timestamp: string;
}

export interface TKAData {
  nis: string;
  tka_indo: number;
  tka_ing: number;
  tka_mat: number;
  mapel_pilihan1: string;
  nilai_tka1: number;
  mapel_pilihan2: string;
  nilai_tka2: number;
  timestamp: string;
}

export interface Prestasi {
  id?: string;
  nis: string;
  kategori: 'Kepengurusan Organisasi' | 'Olah Raga & Seni' | 'Olimpiade & Penelitian';
  slot: number; // 1-3
  tingkat: string;
  spesifikasi: string;
  jenis: string;
  status_akred: 'Terakreditasi' | 'Non Terakreditasi';
  poin: number;
  timestamp: string;
}

export interface Tambahan {
  nis: string;
  ranking_kelas: number;
  ranking_sekolah: number;
  alumni_jurusan: number;
  alumni_ptn: number;
  timestamp: string;
}

export interface PilihanPTNSNBP {
  nis: string;
  pilihan_ke: number; // 1 | 2
  ptn: string;
  prodi: string;
  provinsi_ptn: string;
  timestamp: string;
  isCustom?: boolean;
  tier?: string;
  ptnTier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Vokasi';
  prodiTier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';
  jenjang?: 'S1' | 'D4' | 'D3';
  nrmTarget?: number;
  keketatanTarget?: string;
}

export interface TOData {
  nis: string;
  to_ke: number; // 1 - 9
  bulan: string; // AGS, SEPT, OKT, NOV, DES, JAN, FEB, MAR, APR
  pu: number;
  pbm: number;
  ppu: number;
  pk: number;
  lbi: number;
  lbe: number;
  pm: number;
  total: number;
  skor_tps: number;
  skor_literasi: number;
  skor_tertimbang: number;
  timestamp: string;
}

export interface PilihanPTNSNBT {
  nis: string;
  pilihan_ke: number; // 1 - 4
  singk_ptn: string;
  prodi: string;
  ptn_nama?: string;
  isCustom?: boolean;
  tier?: string;
  ptnTier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' | 'Vokasi';
  prodiTier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';
  jenjang?: 'S1' | 'D4' | 'D3';
  namTarget?: number;
  skorAman?: number;
}

export interface ChatMessage {
  id: string;
  from: string; // nis or 'ADMIN'
  to: string; // nis or 'ADMIN'
  pesan: string;
  timestamp: string;
  dibaca: boolean;
}

export interface AppSettings {
  NAMA_LEMBAGA: string;
  WA_ADMIN: string;
  SNBP_DATE: string;
  SNBT_DATE: string;
  DAFTAR_OPEN: 'YA' | 'TIDAK';
  TOKEN_REQUIRED: 'YA' | 'TIDAK';
}

export interface Cabang {
  nama_cabang: string;
  id?: string;
}

export interface HistoryLog {
  id: string;
  timestamp: string; // WIB: dd/MM/yyyy HH:mm:ss
  actor: string;
  role: 'ADMIN' | 'SISWA' | 'ORTU';
  aksi: string;
  detail: string;
}

export interface TokenDaftar {
  token: string;
  pilihan_program: ProgramType;
  created: string;
  expired: string;
  digunakan: 'YA' | 'TIDAK';
  digunakan_oleh?: string;
}

export interface Modul {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  tipe_file: 'pdf' | 'video' | 'doc' | 'ppt' | 'spreadsheet' | 'youtube' | 'gdrive' | 'link';
  url: string;
  urutan: number;
  status: 'AKTIF' | 'DRAFT';
  kelas_target: string; // 'SEMUA' or comma-separated like '10,11,12'
  target_program: 'SEMUA' | 'SNBP' | 'SNBT' | 'SNBP+SNBT';
  created_by: string;
  timestamp: string;
}

export interface PTNSNBPItem {
  id: string;
  ptn: string;
  singkatan: string;
  prodi: string;
  portfolio: string;
  prov: string;
  nrm: number;
  strata: string;
  tingkatKetetatan: string;
  keketatan: string;
  mapelUnggulan1: string;
  mapelUnggulan2: string;
  deskripsiProdi: string;
  mataKuliah: string;
  prospekKerja: string;
  prodiAlternatif: string;
  point: number;
  kategori: string;
  minat: string;
  web: string;
  ukt: [number, number, number, number, number]; // UKT KAT 1-5
  tier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Vokasi';
}

export interface PTNSNBTItem {
  id: string;
  singk: string;
  ptn: string;
  pt: string; // full name
  prodi: string;
  skor: number; // NAM target
  portofolio: string;
  daya_tampung: number;
  pesaing: number;
  des: string;
  matkul: string;
  alm: string; // career / alumni
  peminat: number;
  tier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' | 'Vokasi';
}
