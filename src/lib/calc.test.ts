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

  // 2. Konversi IRT ke Skala 100: skala100 = (IRT - 200) / 600 * 100
  // IRT 500 -> (300/600)*100 = 50
  // IRT 800 -> 100
  // IRT 200 -> 0
  const c500 = convertIRTto100(500);
  const c800 = convertIRTto100(800);
  const c200 = convertIRTto100(200);
  assert(c500 === 50, `Konversi IRT 500 -> 50 (dapat ${c500})`);
  assert(c800 === 100, `Konversi IRT 800 -> 100 (dapat ${c800})`);
  assert(c200 === 0, `Konversi IRT 200 -> 0 (dapat ${c200})`);

  // 3. Validasi TKA vs Rapor
  // Formula: validasi = 1.6 * TKA100 - 0.6 * (TKA100^2 / raporVal)
  // TKA100 = 80, raporVal = 80 -> 1.6*80 - 0.6*(6400/80) = 128 - 48 = 80
  const dummyTka: TKAData = {
    nis: 'TEST1',
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

  // 6. SNBT Formula 60:40
  // TPS (0.15 * 4 = 0.60), Lit (0.1333, 0.1333, 0.1334 = 0.40)
  // Semua 700 -> hasil tertimbang harus 700
  const toAll700 = calcSkorTO(700, 700, 700, 700, 700, 700, 700);
  assert(Math.round(toAll700.skor_tertimbang) === 700, `SNBT lengkap semua 700 menghasilkan 700 (dapat ${toAll700.skor_tertimbang})`);

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

  return { passed, failed, logs };
}
