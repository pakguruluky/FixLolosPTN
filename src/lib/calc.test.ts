/**
 * Tes Unit Verifikasi Rumus AnalisaKu 2027
 * Memastikan akurasi rumus Bagian 4, 5, 6, 9 & 14
 */

import {
  calcNilaiMapelTerbobot,
  convertIRTto100,
  calcValidasiTKA,
  calcPeluangSNBP,
  calcSkorTO,
  calcStatistikSNBT,
  calcKetercapaianNAM,
  extractKelasNumber,
  isModulVisibleForSiswa,
  checkAkses,
  getMapelPendukungProdi,
  getPrestasiPoin,
  calcIndeksSekolah,
} from './calc';
import { Siswa, NilaiRapor, TKAData, Prestasi, Tambahan, PilihanPTNSNBP, TOData } from '../types';

export function runCalculationUnitTests(): { passed: number; failed: number; logs: string[] } {
  const logs: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      logs.push(`✅ [PASS] ${testName}`);
    } else {
      failed++;
      logs.push(`❌ [FAIL] ${testName}`);
      console.error(`Test failed: ${testName}`);
    }
  }

  // 1. Bobot Semester: Sem1=10%, Sem2=10%, Sem3=15%, Sem4=15%, Sem5=50%
  // Nilai 80, 80, 80, 80, 100 -> 80*0.1 + 80*0.1 + 80*0.15 + 80*0.15 + 100*0.5 = 8 + 8 + 12 + 12 + 50 = 90
  const tb = calcNilaiMapelTerbobot(80, 80, 80, 80, 100);
  assert(tb === 90, `Bobot semester kalkulasi tepat (harus 90, dapat ${tb})`);

  // 2. Konversi IRT ke Skala 100 dan Sebaliknya
  // IRT 500 -> (300/600)*100 = 50
  // IRT 800 -> 100
  // IRT 200 -> 0
  // Skala 0-100 tidak perlu dikonversi (misal 85 -> tetap 85)
  const c500 = convertIRTto100(500);
  const c800 = convertIRTto100(800);
  const c200 = convertIRTto100(200);
  const c85 = convertIRTto100(85);
  assert(c500 === 50, `Konversi IRT 500 -> 50 (dapat ${c500})`);
  assert(c800 === 100, `Konversi IRT 800 -> 100 (dapat ${c800})`);
  assert(c200 === 0, `Konversi IRT 200 -> 0 (dapat ${c200})`);
  assert(c85 === 85, `Input skala 0-100 tidak dikonversi (harus 85, dapat ${c85})`);

  // 3. Validasi TKA vs Rapor (Mode IRT & Mode 0-100)
  // Formula: validasi = 1.6 * TKA100 - 0.6 * (TKA100^2 / raporVal)
  // TKA100 = 80, raporVal = 80 -> 1.6*80 - 0.6*(6400/80) = 128 - 48 = 80
  const dummyTka: TKAData = {
    nis: 'TEST1',
    skala_mode: 'IRT',
    tka_indo: 680,
    tka_ing: 500,
    tka_mat: 680,
    mapel_pilihan1: '',
    nilai_tka1: 0,
    mapel_pilihan2: '',
    nilai_tka2: 0,
    timestamp: '2026-09-01',
  };
  const dummyRapor: NilaiRapor[] = [
    { nis: 'TEST1', kurikulum: 'MERDEKA', jurusan_peminatan: 'Saintek', mapel: 'Bahasa Indonesia', sem1: 80, sem2: 80, sem3: 80, sem4: 80, sem5: 80, timestamp: '' },
  ];
  const tkaRes = calcValidasiTKA(dummyTka, dummyRapor, 80);
  assert(tkaRes.hasTKA === true, 'Validasi TKA terdeteksi');
  assert(tkaRes.items.length === 3, 'TKA 3 mapel wajib dihitung');

  // Uji input TKA skala 0-100 langsung
  const dummyTka100: TKAData = {
    nis: 'TEST2',
    skala_mode: '100',
    tka_indo: 85,
    tka_ing: 75,
    tka_mat: 90,
    mapel_pilihan1: '',
    nilai_tka1: 0,
    mapel_pilihan2: '',
    nilai_tka2: 0,
    timestamp: '2026-09-01',
  };
  const tkaRes100 = calcValidasiTKA(dummyTka100, dummyRapor, 80);
  assert(tkaRes100.hasTKA === true, 'Validasi TKA skala 0-100 terdeteksi');
  assert(tkaRes100.items[0].skala100 === 85, 'TKA skala 0-100 tidak perlu dikonversi (nilai tetap 85)');

  // 4. Mapel Pendukung Prodi
  const [m1, m2] = getMapelPendukungProdi('Teknik Informatika');
  assert(m1 === 'Matematika Tingkat Lanjut' && m2 === 'Fisika', 'Mapel pendukung Teknik Informatika tepat');
  const [d1, d2] = getMapelPendukungProdi('Pendidikan Dokter');
  assert(
    (d1 === 'Kimia' && d2 === 'Biologi') || (d1 === 'Biologi' && d2 === 'Kimia'),
    'Mapel pendukung Kedokteran tepat (Biologi & Kimia)'
  );

  // 5. Prestasi Point
  const ptOlimp = getPrestasiPoin('Olimpiade & Penelitian', 'Perorangan', 'Terakreditasi', 'Nasional', 'Juara 1');
  assert(ptOlimp === 80.66, `Prestasi Olimpiade Perorangan Akred Nasional J1 = 80.66 (dapat ${ptOlimp})`);

  // 6. SNBT Formula 60:40 (Rentang 200–1000)
  // TPS (0.15 * 4 = 0.60), Lit (0.1333, 0.1333, 0.1334 = 0.40)
  // Semua 700 -> hasil tertimbang harus 700
  const toAll700 = calcSkorTO(700, 700, 700, 700, 700, 700, 700);
  assert(Math.round(toAll700.skor_tertimbang) === 700, `SNBT lengkap semua 700 menghasilkan 700 (dapat ${toAll700.skor_tertimbang})`);

  // Uji skor tinggi rentang 200-1000 (misal 850)
  const toAll850 = calcSkorTO(850, 850, 850, 850, 850, 850, 850);
  assert(Math.round(toAll850.skor_tertimbang) === 850, `SNBT lengkap skor 850 menghasilkan 850 (dapat ${toAll850.skor_tertimbang})`);

  // Parsial: hanya TPS diisi (semua 600)
  const toPartial = calcSkorTO(600, 600, 600, 600, 0, 0, 0);
  assert(Math.round(toPartial.skor_tertimbang) === 600, `SNBT parsial dinormalisasi proporsional menghasilkan 600 (dapat ${toPartial.skor_tertimbang})`);

  // 7. Ketercapaian NAM
  const kc = calcKetercapaianNAM(700, 680);
  assert(kc.status === 'Tercapai', `Skor 700 target 680 -> Tercapai (gap ${kc.gap})`);

  // 8. Ekstraksi Kelas & Visibilitas Modul
  assert(extractKelasNumber('12 MIPA 1') === '12', 'Ekstraksi kelas 12 MIPA 1 -> 12');
  assert(extractKelasNumber('XII IPS') === '12', 'Ekstraksi kelas XII IPS -> 12');
  assert(extractKelasNumber('XI') === '11', 'Ekstraksi kelas XI -> 11');
  assert(extractKelasNumber('10-1') === '10', 'Ekstraksi kelas 10-1 -> 10');

  const vis1 = isModulVisibleForSiswa('12', 'SNBT', '12 MIPA', 'SNBT');
  assert(vis1 === true, 'Modul target 12 SNBT terlihat oleh siswa kelas 12 SNBT');
  const vis2 = isModulVisibleForSiswa('11', 'SNBT', '12 MIPA', 'SNBT');
  assert(vis2 === false, 'Modul target 11 tidak terlihat oleh siswa kelas 12');

  // 9. checkAkses
  const activeSiswa: Siswa = {
    nis: 'T1',
    nama_siswa: 'T',
    nama_ortu: 'O',
    username: 'u',
    password_hash: '',
    password_ortu_hash: '',
    kelas: '12',
    asal_sekolah: 'S',
    provinsi_sekolah: 'P',
    cabang: 'C',
    akreditasi: 'A',
    no_hp_siswa: '',
    no_hp_ortu: '',
    pilihan_program: 'SNBP',
    status: 'AKTIF',
    status_daftar: 'AKTIF',
    akses: '1BULAN',
    akses_mulai: new Date().toISOString(),
    akses_akhir: new Date(Date.now() + 86400000).toISOString(),
    created: '',
  };
  assert(checkAkses(activeSiswa).valid === true, 'Siswa aktif belum expired -> valid');

  const expiredSiswa: Siswa = {
    ...activeSiswa,
    akses_akhir: new Date(Date.now() - 86400000).toISOString(),
  };
  assert(checkAkses(expiredSiswa).valid === false, 'Siswa expired -> tidak valid');

  // 10. Indeks Sekolah (School Index SNBP Indonesia)
  // Sekolah Top Elite: Akreditasi A (20), Top 50 LTMPT (35), Alumni >=30 PTN & >=3 Jurusan (30), Seprovinsi (15) = 100
  const topSiswa: Siswa = {
    ...activeSiswa,
    provinsi_sekolah: 'Jawa Barat',
    akreditasi: 'A',
  };
  const topTambahan: Tambahan = {
    nis: 'T1',
    ranking_kelas: 1,
    ranking_sekolah: 1,
    ranking_top_1000: 45,
    alumni_ptn: 35,
    alumni_jurusan: 5,
    timestamp: '',
  };
  const topPilihan: PilihanPTNSNBP[] = [
    {
      nis: 'T1',
      pilihan_ke: 1,
      ptn: 'Institut Teknologi Bandung',
      prodi: 'Teknik Informatika',
      provinsi_ptn: 'Jawa Barat',
      timestamp: '',
    },
  ];
  const indElite = calcIndeksSekolah(topSiswa, topTambahan, topPilihan);
  assert(Math.round(indElite.indeksTotal) === 100, `Indeks sekolah elite = 100 (dapat ${indElite.indeksTotal})`);
  assert(indElite.kategori === 'Sangat Tinggi (Elite)', 'Kategori elite tepat');
  assert(indElite.komponen.length === 4, 'Komponen indeks sekolah terdiri dari 4 parameter resmi');
  assert(indElite.analisisPilihan[0].peluangKelulusanIndeks === 'Sangat Besar', 'Daya dukung kelulusan sekolah elite sangat besar');

  // Sekolah Reguler / Luar Top 1000: Akreditasi B (15), Ranking Kota 20 (17.5), Alumni 0 PTN (1.5+3=4.5), Luar Provinsi Tier 2 (11.25)
  const regSiswa: Siswa = {
    ...activeSiswa,
    provinsi_sekolah: 'Sumatera Utara',
    akreditasi: 'B',
  };
  const regTambahan: Tambahan = {
    nis: 'T1',
    ranking_kelas: 5,
    ranking_sekolah: 20,
    alumni_ptn: 0,
    alumni_jurusan: 0,
    timestamp: '',
  };
  const regPilihan: PilihanPTNSNBP[] = [
    {
      nis: 'T1',
      pilihan_ke: 1,
      ptn: 'Universitas Diponegoro',
      prodi: 'Manajemen',
      provinsi_ptn: 'Jawa Tengah',
      timestamp: '',
    },
  ];
  const indReg = calcIndeksSekolah(regSiswa, regTambahan, regPilihan);
  assert(indReg.indeksTotal < 70, `Indeks sekolah reguler terukur proporsional (dapat ${indReg.indeksTotal})`);
  assert(indReg.analisisPilihan[0].statusWilayah === 'Luar Provinsi', 'Status wilayah luar provinsi terdeteksi');

  return { passed, failed, logs };
}
