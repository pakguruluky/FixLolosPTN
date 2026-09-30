import {
  NilaiRapor,
  TKAData,
  Prestasi,
  Tambahan,
  PilihanPTNSNBP,
  TOData,
  PilihanPTNSNBT,
  Siswa,
  PTNSNBPItem,
  PTNSNBTItem,
} from '../types';

// ==========================================
// BAGIAN 4 - KONSTANTA KURIKULUM & MAPEL
// ==========================================

export const BOBOT_SEMESTER = [0.1, 0.1, 0.15, 0.15, 0.5]; // sem1..sem5

export const MAPEL_UMUM_K13 = [
  'Pendidikan Pancasila dan Kewarganegaraan',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Matematika',
  'Sejarah Indonesia',
  'Seni Budaya',
  'Pendidikan Jasmani Olah raga dan Kesehatan',
];

export const MAPEL_UMUM_MERDEKA = [
  'Pendidikan Pancasila',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Matematika',
  'Sejarah',
  'Seni Budaya',
  'Pendidikan Jasmani Olah raga dan Kesehatan',
  'Informatika',
];

export const MAPEL_PEMINATAN_K13: Record<string, string[]> = {
  IPA: ['Biologi', 'Fisika', 'Kimia', 'Matematika Peminatan'],
  IPS: ['Ekonomi', 'Sosiologi', 'Geografi', 'Sejarah Peminatan'],
  Bahasa: ['Bahasa dan Sastra Indonesia', 'Bahasa dan Sastra Inggris', 'Antropologi', 'Bahasa Asing Lainnya'],
  Umum: [],
};

export const MAPEL_PEMINATAN_MERDEKA: Record<string, { group: string; mapel: string[] }[]> = {
  Saintek: [{ group: '⚗️ Saintek', mapel: ['Matematika Tingkat Lanjut', 'Fisika', 'Kimia', 'Biologi'] }],
  Soshum: [{ group: '🌍 Soshum', mapel: ['Sosiologi', 'Ekonomi', 'Geografi', 'Sejarah Tingkat Lanjut'] }],
  'Bahasa & Budaya': [
    {
      group: '🗣️ Bahasa & Budaya',
      mapel: ['Bahasa Indonesia Tingkat Lanjut', 'Bahasa Inggris Tingkat Lanjut', 'Antropologi', 'Bahasa Asing Lainnya'],
    },
  ],
  Campuran: [
    { group: '⚗️ Saintek', mapel: ['Matematika Tingkat Lanjut', 'Fisika', 'Kimia', 'Biologi'] },
    { group: '🌍 Soshum', mapel: ['Sosiologi', 'Ekonomi', 'Geografi', 'Sejarah Tingkat Lanjut'] },
    {
      group: '🗣️ Bahasa & Budaya',
      mapel: ['Bahasa Indonesia Tingkat Lanjut', 'Bahasa Inggris Tingkat Lanjut', 'Antropologi', 'Bahasa Asing Lainnya'],
    },
  ],
};

export const TKA_MAPEL_WAJIB = ['Bahasa Indonesia', 'Bahasa Inggris', 'Matematika'];
export const TKA_MAPEL_PILIHAN = [
  'Fisika',
  'Kimia',
  'Biologi',
  'Geografi',
  'Ekonomi',
  'Sosiologi',
  'Sejarah',
  'Antropologi',
  'PPKn',
  'Matematika Lanjut',
  'Bahasa Indonesia Lanjut',
  'Bahasa Inggris Lanjut',
  'Bahasa Arab',
  'Jepang',
  'Mandarin',
  'Jerman',
  'Korea',
  'Prancis',
];

export const RATA_NASIONAL_TKA: Record<string, number> = {
  'Bahasa Indonesia': 62.5,
  'Bahasa Inggris': 55.0,
  Matematika: 48.0,
  Fisika: 52.0,
  Kimia: 50.5,
  Biologi: 54.0,
  Geografi: 56.5,
  Ekonomi: 58.0,
  Sosiologi: 61.0,
  Sejarah: 59.0,
  Antropologi: 57.5,
  PPKn: 60.0,
  'Matematika Lanjut': 46.0,
};

// ==========================================
// BAGIAN 5 - RUMUS SNBP
// ==========================================

export function calcNilaiMapelTerbobot(sem1: number, sem2: number, sem3: number, sem4: number, sem5: number): number {
  const s = [sem1 || 0, sem2 || 0, sem3 || 0, sem4 || 0, sem5 || 0];
  const terbobot = s.reduce((acc, val, idx) => acc + val * BOBOT_SEMESTER[idx], 0);
  return Number(terbobot.toFixed(2));
}

export function calcRataRapor(nilaiRaporList: NilaiRapor[]): {
  terbobotPerMapel: { mapel: string; terbobot: number }[];
  rata_rapor: number;
} {
  const terbobotPerMapel = nilaiRaporList.map((r) => ({
    mapel: r.mapel,
    terbobot: calcNilaiMapelTerbobot(r.sem1, r.sem2, r.sem3, r.sem4, r.sem5),
  }));

  const valid = terbobotPerMapel.filter((x) => x.terbobot > 0);
  const rata_rapor = valid.length > 0 ? Number((valid.reduce((acc, x) => acc + x.terbobot, 0) / valid.length).toFixed(2)) : 0;

  return { terbobotPerMapel, rata_rapor };
}

// 5.2 Konversi IRT ke Skala 100
export function convertIRTto100(irt: number): number {
  if (!irt || irt <= 0) return 0;
  if (irt <= 100) return Number(irt.toFixed(2));
  const sanitized = Math.min(800, Math.max(200, irt));
  const skala100 = ((sanitized - 200) / 600) * 100;
  return Number(Math.max(0, Math.min(100, skala100)).toFixed(2));
}

export function getKategoriTKA(irt: number): { label: string; rentang100: string; deskripsi: string; color: string } {
  if (!irt || irt <= 0) {
    return { label: 'Belum Ada', rentang100: '-', deskripsi: 'Belum mengikuti TKA', color: 'text-gray-400' };
  }
  const sanitized = Math.min(800, Math.max(200, irt));
  if (sanitized >= 725) {
    return {
      label: 'Istimewa',
      rentang100: '87.50 – 100.00',
      deskripsi: 'Penguasaan materi sangat mendalam dan luar biasa',
      color: 'text-purple-600 dark:text-purple-400',
    };
  }
  if (sanitized >= 625) {
    return {
      label: 'Baik',
      rentang100: '70.83 – 87.33',
      deskripsi: 'Penguasaan materi kuat dan kompetitif',
      color: 'text-emerald-600 dark:text-emerald-400',
    };
  }
  if (sanitized >= 500) {
    return {
      label: 'Memadai',
      rentang100: '50.00 – 70.67',
      deskripsi: 'Penguasaan standar kompetensi minimal',
      color: 'text-amber-600 dark:text-amber-400',
    };
  }
  return {
    label: 'Kurang',
    rentang100: '0.00 – 49.83',
    deskripsi: 'Perlu penguatan konsep dan latihan intensif',
    color: 'text-rose-600 dark:text-rose-400',
  };
}

// 5.3 Validasi TKA vs Rapor
export function calcValidasiTKA(
  tka: TKAData | null,
  nilaiRaporList: NilaiRapor[],
  rata_rapor: number
): {
  items: {
    mapel: string;
    irt: number;
    skala100: number;
    raporVal: number;
    validasi: number;
    nilai_digunakan: number;
    kategori: string;
    gap: number;
    rataNasional: number;
  }[];
  rata_tka_irt: number;
  rata_tka_100: number;
  total_gap: number;
  hasTKA: boolean;
} {
  if (!tka) {
    return { items: [], rata_tka_irt: 0, rata_tka_100: 0, total_gap: 0, hasTKA: false };
  }

  const { terbobotPerMapel } = calcRataRapor(nilaiRaporList);

  const tkaList: { mapel: string; irt: number }[] = [
    { mapel: 'Bahasa Indonesia', irt: tka.tka_indo || 0 },
    { mapel: 'Bahasa Inggris', irt: tka.tka_ing || 0 },
    { mapel: 'Matematika', irt: tka.tka_mat || 0 },
  ];
  if (tka.mapel_pilihan1 && tka.nilai_tka1) {
    tkaList.push({ mapel: tka.mapel_pilihan1, irt: tka.nilai_tka1 });
  }
  if (tka.mapel_pilihan2 && tka.nilai_tka2) {
    tkaList.push({ mapel: tka.mapel_pilihan2, irt: tka.nilai_tka2 });
  }

  const activeTKA = tkaList.filter((x) => x.irt > 0);
  if (activeTKA.length === 0) {
    return { items: [], rata_tka_irt: 0, rata_tka_100: 0, total_gap: 0, hasTKA: false };
  }

  let sumGap = 0;
  const items = activeTKA.map((t) => {
    const skala100 = convertIRTto100(t.irt);

    // match substring two-way case-insensitive
    const match = terbobotPerMapel.find((m) => {
      const a = m.mapel.toLowerCase();
      const b = t.mapel.toLowerCase();
      return a.includes(b) || b.includes(a);
    });

    const raporVal = match && match.terbobot > 0 ? match.terbobot : rata_rapor;

    let validasi = 0;
    if (raporVal > 0) {
      validasi = 1.6 * skala100 - 0.6 * ((skala100 * skala100) / raporVal);
      validasi = Number(validasi.toFixed(2));
    }

    const nilai_digunakan = Number(Math.max(raporVal, validasi).toFixed(2));
    const gap = Number(Math.abs(skala100 - raporVal).toFixed(2));
    sumGap += gap;

    return {
      mapel: t.mapel,
      irt: t.irt,
      skala100,
      raporVal,
      validasi,
      nilai_digunakan,
      kategori: getKategoriTKA(t.irt).label,
      gap,
      rataNasional: RATA_NASIONAL_TKA[t.mapel] || 55.0,
    };
  });

  const rata_tka_irt = Number((activeTKA.reduce((acc, x) => acc + x.irt, 0) / activeTKA.length).toFixed(2));
  const rata_tka_100 = Number((items.reduce((acc, x) => acc + x.skala100, 0) / items.length).toFixed(2));

  return {
    items,
    rata_tka_irt,
    rata_tka_100,
    total_gap: Number(sumGap.toFixed(2)),
    hasTKA: true,
  };
}

// 5.6 Mapel Pendukung per Prodi berdasarkan Keputusan Mendikdasmen Nomor 102/M/2025
// Rumpun Humaniora, Ilmu Sosial, Ilmu Alam, Ilmu Formal, dan Ilmu Terapan
const PRODI_MAPEL_MAP: { keys: string[]; mapels: [string, string] }[] = [
  // 1. Kedokteran, Kedokteran Gigi, Farmasi (Ilmu Terapan / Kesehatan)
  // Kurikulum Merdeka & K13: Kimia dan/atau Biologi
  { keys: ['pendidikan dokter gigi', 'dokter gigi', 'kedokteran gigi'], mapels: ['Biologi', 'Kimia'] },
  { keys: ['pendidikan dokter', 'kedokteran', 'dokter umum', 'dokter'], mapels: ['Kimia', 'Biologi'] },
  { keys: ['farmasi', 'farmakologi', 'apoteker'], mapels: ['Kimia', 'Biologi'] },
  { keys: ['keperawatan', 'kebidanan', 'kesehatan masyarakat', 'gizi', 'fisioterapi', 'radiologi', 'analis kesehatan', 'teknologi laboratorium medis'], mapels: ['Biologi', 'Kimia'] },
  { keys: ['kedokteran hewan', 'kedokteran ternak'], mapels: ['Biologi', 'Kimia'] },

  // 2. Teknik & Rekayasa
  { keys: ['teknik kimia', 'rekayasa kimia'], mapels: ['Kimia', 'Matematika Tingkat Lanjut'] },
  { keys: ['teknik sipil', 'rekayasa infrastruktur', 'teknik kelautan'], mapels: ['Matematika Tingkat Lanjut', 'Fisika'] },
  { keys: ['teknik mesin', 'teknik penerbangan', 'teknik perkapalan', 'rekayasa material'], mapels: ['Fisika', 'Matematika Tingkat Lanjut'] },
  { keys: ['teknik elektro', 'teknik telekomunikasi', 'teknik tenaga listrik', 'teknik mekatronika'], mapels: ['Fisika', 'Matematika Tingkat Lanjut'] },
  { keys: ['teknik industri', 'manajemen rekayasa', 'sistem logistik'], mapels: ['Matematika Tingkat Lanjut', 'Fisika'] },
  { keys: ['teknik lingkungan', 'teknik sanitasi'], mapels: ['Kimia', 'Biologi'] },
  { keys: ['teknik pertambangan', 'teknik perminyakan', 'teknik geologi', 'geofisika'], mapels: ['Fisika', 'Matematika Tingkat Lanjut'] },
  { keys: ['arsitektur', 'desain produk'], mapels: ['Fisika', 'Matematika Tingkat Lanjut'] },
  { keys: ['perencanaan wilayah kota', 'perencanaan wilayah dan kota', 'pwk', 'planologi'], mapels: ['Matematika Tingkat Lanjut', 'Geografi'] },

  // 3. Ilmu Formal & Komputer
  {
    keys: ['teknik informatika', 'ilmu komputer', 'sistem informasi', 'sains data', 'teknologi informasi', 'rekayasa perangkat lunak', 'kecerdasan buatan'],
    mapels: ['Matematika Tingkat Lanjut', 'Fisika'],
  },
  { keys: ['matematika', 'statistika', 'ilmu aktuaria', 'aktuaria'], mapels: ['Matematika Tingkat Lanjut', 'Fisika'] },

  // 4. Ilmu Alam
  { keys: ['fisika', 'astronomi'], mapels: ['Fisika', 'Matematika Tingkat Lanjut'] },
  { keys: ['kimia', 'biokimia'], mapels: ['Kimia', 'Matematika Tingkat Lanjut'] },
  { keys: ['biologi', 'bioteknologi', 'mikrobiologi'], mapels: ['Biologi', 'Kimia'] },
  { keys: ['pertanian', 'agroteknologi', 'agribisnis', 'kehutanan', 'peternakan', 'kelautan', 'perikanan', 'akuakultur', 'ilmu tanah'], mapels: ['Biologi', 'Kimia'] },

  // 5. Ilmu Sosial & Bisnis
  { keys: ['ekonomi', 'manajemen', 'akuntansi', 'ilmu ekonomi', 'bisnis digital', 'keuangan'], mapels: ['Ekonomi', 'Matematika Peminatan'] },
  { keys: ['hukum', 'ilmu hukum'], mapels: ['Sosiologi', 'Sejarah Tingkat Lanjut'] },
  { keys: ['sosiologi'], mapels: ['Sosiologi', 'Sejarah Tingkat Lanjut'] },
  { keys: ['ilmu komunikasi', 'jurnalistik', 'hubungan masyarakat', 'humas', 'broadcasting'], mapels: ['Sosiologi', 'Bahasa Indonesia Tingkat Lanjut'] },
  { keys: ['hubungan internasional'], mapels: ['Sejarah Tingkat Lanjut', 'Sosiologi'] },
  { keys: ['ilmu politik', 'ilmu pemerintahan', 'kebijakan publik'], mapels: ['Sosiologi', 'Sejarah Tingkat Lanjut'] },
  { keys: ['administrasi publik', 'administrasi negara'], mapels: ['Sosiologi', 'Ekonomi'] },
  { keys: ['administrasi bisnis', 'administrasi niaga'], mapels: ['Ekonomi', 'Sosiologi'] },
  { keys: ['geografi', 'sains informasi geografi'], mapels: ['Geografi', 'Sosiologi'] },
  { keys: ['ilmu sejarah', 'arkeologi', 'sejarah'], mapels: ['Sejarah Tingkat Lanjut', 'Sosiologi'] },
  { keys: ['psikologi'], mapels: ['Biologi', 'Sosiologi'] },
  { keys: ['antropologi'], mapels: ['Antropologi', 'Sosiologi'] },

  // 6. Humaniora & Bahasa
  { keys: ['sastra indonesia', 'bahasa indonesia', 'pendidikan bahasa indonesia'], mapels: ['Bahasa Indonesia Tingkat Lanjut', 'Sejarah Tingkat Lanjut'] },
  { keys: ['sastra inggris', 'bahasa inggris', 'pendidikan bahasa inggris'], mapels: ['Bahasa Inggris Tingkat Lanjut', 'Bahasa Indonesia Tingkat Lanjut'] },
  { keys: ['linguistik'], mapels: ['Bahasa Indonesia Tingkat Lanjut', 'Bahasa Inggris Tingkat Lanjut'] },
  { keys: ['sastra jepang', 'sastra arab', 'bahasa jerman', 'bahasa prancis', 'bahasa mandarin', 'bahasa korea'], mapels: ['Bahasa Inggris Tingkat Lanjut', 'Antropologi'] },
  { keys: ['filsafat', 'teologi'], mapels: ['Bahasa Indonesia Tingkat Lanjut', 'Sejarah Tingkat Lanjut'] },
  { keys: ['seni rupa', 'desain komunikasi visual', 'dkv', 'seni musik', 'seni tari', 'kriya', 'teater'], mapels: ['Seni Budaya', 'Bahasa Indonesia Tingkat Lanjut'] },
  { keys: ['ilmu keolahragaan', 'olahraga', 'pjkr', 'pendidikan jasmani'], mapels: ['Biologi', 'Fisika'] },
  { keys: ['pendidikan guru sekolah dasar', 'pgsd', 'pendidikan', 'keguruan'], mapels: ['Bahasa Indonesia Tingkat Lanjut', 'Sosiologi'] },
];

const FALLBACK_KEYWORDS: { keywords: string[]; mapels: [string, string] }[] = [
  { keywords: ['kedokteran', 'dokter', 'medis', 'klinik'], mapels: ['Kimia', 'Biologi'] },
  { keywords: ['farmasi', 'apoteker'], mapels: ['Kimia', 'Biologi'] },
  { keywords: ['keperawatan', 'kesehatan', 'gizi', 'kebidanan', 'fisioterapi'], mapels: ['Biologi', 'Kimia'] },
  { keywords: ['komputer', 'informatika', 'sistem informasi', 'data', 'cyber', 'software'], mapels: ['Matematika Tingkat Lanjut', 'Fisika'] },
  { keywords: ['teknik', 'engineering', 'mesin', 'sipil', 'elektro', 'industri', 'robotika'], mapels: ['Matematika Tingkat Lanjut', 'Fisika'] },
  { keywords: ['pertanian', 'agroteknologi', 'peternakan', 'kehutanan', 'perkebunan', 'perikanan'], mapels: ['Biologi', 'Kimia'] },
  { keywords: ['matematika', 'statistika', 'aktuaria'], mapels: ['Matematika Tingkat Lanjut', 'Fisika'] },
  { keywords: ['fisika', 'astronomi'], mapels: ['Fisika', 'Matematika Tingkat Lanjut'] },
  { keywords: ['kimia'], mapels: ['Kimia', 'Matematika Tingkat Lanjut'] },
  { keywords: ['biologi', 'biokimia', 'bioteknologi'], mapels: ['Biologi', 'Kimia'] },
  { keywords: ['ekonomi', 'akuntansi', 'manajemen', 'bisnis', 'keuangan'], mapels: ['Ekonomi', 'Matematika Peminatan'] },
  { keywords: ['hukum', 'ilmu hukum', 'legal'], mapels: ['Sosiologi', 'Sejarah Tingkat Lanjut'] },
  { keywords: ['sosiologi', 'sosial', 'kesejahteraan'], mapels: ['Sosiologi', 'Sejarah Tingkat Lanjut'] },
  { keywords: ['komunikasi', 'jurnalistik', 'broadcasting', 'penyiaran', 'humas'], mapels: ['Sosiologi', 'Bahasa Indonesia Tingkat Lanjut'] },
  { keywords: ['hubungan internasional', 'diplomasi'], mapels: ['Sejarah Tingkat Lanjut', 'Sosiologi'] },
  { keywords: ['geografi', 'geodesi', 'planologi', 'perencanaan wilayah'], mapels: ['Geografi', 'Matematika Tingkat Lanjut'] },
  { keywords: ['psikologi'], mapels: ['Biologi', 'Sosiologi'] },
  { keywords: ['sastra', 'linguistik', 'bahasa'], mapels: ['Bahasa Indonesia Tingkat Lanjut', 'Bahasa Inggris Tingkat Lanjut'] },
  { keywords: ['antropologi', 'arkeologi', 'sejarah'], mapels: ['Sejarah Tingkat Lanjut', 'Sosiologi'] },
  { keywords: ['filsafat', 'agama', 'teologi'], mapels: ['Bahasa Indonesia Tingkat Lanjut', 'Sejarah Tingkat Lanjut'] },
  { keywords: ['seni', 'desain', 'kriya', 'musik', 'tari', 'teater', 'dkv'], mapels: ['Seni Budaya', 'Bahasa Indonesia Tingkat Lanjut'] },
  { keywords: ['olahraga', 'keolahragaan', 'pjkr', 'penjas'], mapels: ['Biologi', 'Fisika'] },
  { keywords: ['arsitektur'], mapels: ['Fisika', 'Matematika Tingkat Lanjut'] },
];

export function getMapelPendukungProdi(namaProdi: string): [string, string] {
  if (!namaProdi) return ['', ''];
  const lower = namaProdi.toLowerCase();

  for (const item of PRODI_MAPEL_MAP) {
    if (item.keys.some((k) => lower.includes(k))) {
      return item.mapels;
    }
  }

  for (const item of FALLBACK_KEYWORDS) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.mapels;
    }
  }

  return ['', ''];
}

// 5.7 Prestasi Point Lookup Table
export function getPrestasiPoin(
  kategori: string,
  jenis: string,
  statusAkred: string,
  tingkat: string,
  spesifikasi: string
): number {
  if (tingkat === 'Tidak Ada' || !tingkat) return 0;

  // Olimpiade & Penelitian
  if (kategori === 'Olimpiade & Penelitian') {
    if (jenis === 'Perorangan' && statusAkred === 'Terakreditasi') {
      if (tingkat === 'Internasional') {
        if (spesifikasi === 'Juara 1') return 100;
        if (spesifikasi === 'Juara 2') return 99.8;
        if (spesifikasi === 'Juara 3') return 99.55;
        if (spesifikasi === 'Honorable Mention') return 98.55;
      }
      if (tingkat === 'Regional') {
        if (spesifikasi === 'Juara 1') return 89.82;
        if (spesifikasi === 'Juara 2') return 89.62;
        if (spesifikasi === 'Juara 3') return 89.37;
        if (spesifikasi === 'Honorable Mention') return 88.38;
      }
      if (tingkat === 'Nasional') {
        if (spesifikasi === 'Juara 1') return 80.66;
        if (spesifikasi === 'Juara 2') return 80.46;
        if (spesifikasi === 'Juara 3') return 80.21;
        if (spesifikasi === 'Juara Harapan') return 79.22;
      }
      if (tingkat === 'Provinsi') {
        if (spesifikasi === 'Juara 1') return 72.42;
        if (spesifikasi === 'Juara 2') return 72.22;
        if (spesifikasi === 'Juara 3') return 71.97;
        if (spesifikasi === 'Juara Harapan') return 70.97;
      }
      if (tingkat === 'Kabupaten') {
        if (spesifikasi === 'Juara 1') return 65.0;
        if (spesifikasi === 'Juara 2') return 64.8;
        if (spesifikasi === 'Juara 3') return 64.55;
        if (spesifikasi === 'Juara Harapan') return 63.55;
      }
    }
    if (jenis === 'Perorangan' && statusAkred === 'Non Terakreditasi') {
      if (tingkat === 'Internasional') {
        if (spesifikasi === 'Juara 1') return 90.0;
        if (spesifikasi === 'Juara 2') return 89.8;
        if (spesifikasi === 'Juara 3') return 89.55;
        if (spesifikasi === 'Honorable Mention') return 88.55;
      }
      if (tingkat === 'Regional') {
        if (spesifikasi === 'Juara 1') return 80.84;
        if (spesifikasi === 'Juara 2') return 80.64;
        if (spesifikasi === 'Juara 3') return 80.39;
        if (spesifikasi === 'Honorable Mention') return 79.39;
      }
      if (tingkat === 'Nasional') {
        if (spesifikasi === 'Juara 1') return 72.6;
        if (spesifikasi === 'Juara 2') return 72.4;
        if (spesifikasi === 'Juara 3') return 72.14;
        if (spesifikasi === 'Juara Harapan') return 71.15;
      }
      if (tingkat === 'Provinsi') {
        if (spesifikasi === 'Juara 1') return 65.18;
        if (spesifikasi === 'Juara 2') return 64.98;
        if (spesifikasi === 'Juara 3') return 64.72;
        if (spesifikasi === 'Juara Harapan') return 63.73;
      }
      if (tingkat === 'Kabupaten') {
        if (spesifikasi === 'Juara 1') return 58.5;
        if (spesifikasi === 'Juara 2') return 58.3;
        if (spesifikasi === 'Juara 3') return 58.05;
        if (spesifikasi === 'Juara Harapan') return 57.05;
      }
    }
    if (jenis === 'Beregu' && statusAkred === 'Terakreditasi') {
      if (tingkat === 'Internasional') {
        if (spesifikasi === 'Juara 1') return 90.0;
        if (spesifikasi === 'Juara 2') return 89.8;
        if (spesifikasi === 'Juara 3') return 89.55;
        if (spesifikasi === 'Honorable Mention') return 88.55;
      }
      if (tingkat === 'Nasional') {
        if (spesifikasi === 'Juara 1') return 72.6;
        if (spesifikasi === 'Juara 2') return 72.4;
        if (spesifikasi === 'Juara 3') return 72.14;
      }
      if (tingkat === 'Provinsi') {
        if (spesifikasi === 'Juara 1') return 65.18;
        if (spesifikasi === 'Juara 2') return 64.98;
        if (spesifikasi === 'Juara 3') return 64.72;
      }
      if (tingkat === 'Kabupaten') {
        if (spesifikasi === 'Juara 1') return 58.5;
        if (spesifikasi === 'Juara 2') return 58.3;
        if (spesifikasi === 'Juara 3') return 58.05;
      }
    }
  }

  // Olah Raga & Seni
  if (kategori === 'Olah Raga & Seni') {
    if (jenis === 'Perorangan' && statusAkred === 'Terakreditasi') {
      if (tingkat === 'Internasional') {
        if (spesifikasi === 'Juara 1') return 100;
        if (spesifikasi === 'Juara 2') return 99.8;
        if (spesifikasi === 'Juara 3') return 99.55;
      }
      if (tingkat === 'Nasional') {
        if (spesifikasi === 'Juara 1') return 71.94;
        if (spesifikasi === 'Juara 2') return 71.74;
        if (spesifikasi === 'Juara 3') return 71.49;
      }
      if (tingkat === 'Provinsi') {
        if (spesifikasi === 'Juara 1') return 60.98;
        if (spesifikasi === 'Juara 2') return 60.78;
        if (spesifikasi === 'Juara 3') return 60.53;
      }
      if (tingkat === 'Kabupaten') {
        if (spesifikasi === 'Juara 1') return 51.66;
        if (spesifikasi === 'Juara 2') return 51.46;
        if (spesifikasi === 'Juara 3') return 51.21;
      }
    }
    if (jenis === 'Beregu' && statusAkred === 'Non Terakreditasi') {
      if (tingkat === 'Internasional') {
        if (spesifikasi === 'Juara 1') return 85.0;
        if (spesifikasi === 'Juara 2') return 84.8;
        if (spesifikasi === 'Juara 3') return 84.55;
      }
      if (tingkat === 'Nasional') {
        if (spesifikasi === 'Juara 1') return 61.15;
        if (spesifikasi === 'Juara 2') return 60.95;
      }
      if (tingkat === 'Provinsi') {
        if (spesifikasi === 'Juara 1') return 51.83;
        if (spesifikasi === 'Juara 2') return 51.63;
      }
      if (tingkat === 'Kabupaten') {
        if (spesifikasi === 'Juara 1') return 43.91;
        if (spesifikasi === 'Juara 2') return 43.71;
      }
    }
  }

  // Kepengurusan Organisasi
  if (kategori === 'Kepengurusan Organisasi') {
    if (jenis === 'Tunggal' && statusAkred === 'Terakreditasi') {
      if (tingkat === 'Internasional') {
        if (spesifikasi === 'Ketua') return 100;
        if (spesifikasi === 'Wakil Ketua') return 99.8;
        if (spesifikasi === 'Pengurus Primer') return 99.55;
      }
      if (tingkat === 'Nasional') {
        if (spesifikasi === 'Ketua') return 80.66;
        if (spesifikasi === 'Wakil Ketua') return 80.46;
        if (spesifikasi === 'Pengurus Primer') return 80.21;
      }
      if (tingkat === 'Provinsi') {
        if (spesifikasi === 'Ketua') return 72.42;
        if (spesifikasi === 'Wakil Ketua') return 72.22;
      }
      if (tingkat === 'Kabupaten') {
        if (spesifikasi === 'Ketua') return 65.0;
        if (spesifikasi === 'Wakil Ketua') return 64.8;
      }
      if (tingkat === 'Sekolah') {
        if (spesifikasi === 'Ketua') return 58.33;
        if (spesifikasi === 'Wakil Ketua') return 58.13;
        if (spesifikasi === 'Pengurus Primer') return 57.88;
        if (spesifikasi === 'Pengurus Sekunder') return 56.88;
      }
    }
    if (jenis === 'Kolektif' && statusAkred === 'Terakreditasi') {
      if (tingkat === 'Nasional') {
        if (spesifikasi === 'Ketua') return 68.56;
      }
      if (tingkat === 'Provinsi') {
        if (spesifikasi === 'Ketua') return 61.71;
      }
      if (tingkat === 'Kabupaten') {
        if (spesifikasi === 'Ketua') return 55.54;
      }
      if (tingkat === 'Sekolah') {
        if (spesifikasi === 'Ketua') return 49.98;
        if (spesifikasi === 'Wakil Ketua') return 49.78;
        if (spesifikasi === 'Pengurus Primer') return 49.53;
        if (spesifikasi === 'Pengurus Sekunder') return 48.53;
      }
    }
  }

  return 0; // Not matched in table = 0
}

// 5.4 & 5.5 Peluang SNBP
export interface BreakdownKomponenSNBP {
  key: string;
  nama: string;
  bobotMaks: number;
  poin: number;
  persen: number;
  keterangan: string;
  status: 'Baik' | 'Cukup' | 'Tingkatkan';
}

export interface AnalisaSNBPPilihan {
  pilihan_ke: number;
  ptn: string;
  prodi: string;
  provinsi_ptn: string;
  nrm: number;
  mapelPendukung: [string, string];
  statusMapel: { mapel1Ada: boolean; mapel2Ada: boolean };
  skor_keketatan: number;
  peluang_prodi: number;
  label_peluang: string;
  color_peluang: string;
  ptnDetail?: PTNSNBPItem;
  tier?: string;
  isCustom?: boolean;
}

// ==========================================
// TIER SYSTEM & ESTIMATION ENGINE
// ==========================================

export function inferPTNTier(ptnName: string): 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Vokasi' {
  if (!ptnName) return 'Tier 2';
  const s = ptnName.toLowerCase();
  if (
    s.includes('politeknik') ||
    s.includes('polban') ||
    s.includes('pens') ||
    s.includes('pnj') ||
    s.includes('polinema') ||
    s.includes('pnup') ||
    s.includes('polije') ||
    s.includes('vokasi')
  ) {
    return 'Vokasi';
  }
  if (
    s === 'ui' || s.includes('universitas indonesia') ||
    s === 'itb' || s.includes('institut teknologi bandung') ||
    s === 'ugm' || s.includes('gadjah mada') ||
    s === 'its' || s.includes('sepuluh nopember') ||
    s === 'unair' || s.includes('airlangga') ||
    s === 'ipb' || s.includes('institut pertanian bogor') ||
    s === 'undip' || s.includes('diponegoro') ||
    s === 'unpad' || s.includes('padjadjaran') ||
    s === 'ub' || s.includes('brawijaya')
  ) {
    return 'Tier 1';
  }
  if (
    s === 'uns' || s.includes('sebelas maret') ||
    s === 'unhas' || s.includes('hasanuddin') ||
    s === 'unand' || s.includes('andalas') ||
    s === 'upi' || s.includes('pendidikan indonesia') ||
    s === 'uny' || s.includes('negeri yogyakarta') ||
    s === 'usu' || s.includes('sumatera utara') ||
    s === 'unesa' || s.includes('negeri surabaya') ||
    s === 'unnes' || s.includes('negeri semarang') ||
    s === 'unm' || s.includes('negeri makassar') ||
    s.includes('upn') || s.includes('veteran') ||
    s === 'unud' || s.includes('udayana')
  ) {
    return 'Tier 2';
  }
  return 'Tier 3';
}

export function inferProdiTier(prodiName: string): 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' {
  if (!prodiName) return 'Tier 2';
  const s = prodiName.toLowerCase();
  if (
    s.includes('dokter') || s.includes('kedokteran') ||
    s.includes('komputer') || s.includes('informatika') ||
    s.includes('farmasi') || s.includes('aktuaria') ||
    s.includes('hubungan internasional') || s.includes('data science') ||
    s.includes('kecerdasan buatan') || s.includes('sistem informasi')
  ) {
    return 'Tier 1';
  }
  if (
    s.includes('manajemen') || s.includes('psikologi') ||
    s.includes('hukum') || s.includes('komunikasi') ||
    s.includes('akuntansi') || s.includes('industri') ||
    s.includes('sipil') || s.includes('elektro') ||
    s.includes('mesin') || s.includes('arsitektur') ||
    s.includes('bisnis digital') || s.includes('gizi')
  ) {
    return 'Tier 2';
  }
  if (
    (s.includes('pendidikan') && !s.includes('dokter')) ||
    s.includes('sastra') || s.includes('bahasa') ||
    s.includes('biologi') || s.includes('kimia') ||
    s.includes('fisika') || s.includes('matematika') ||
    s.includes('sosiologi') || s.includes('administrasi') ||
    s.includes('agribisnis') || s.includes('geografi')
  ) {
    return 'Tier 3';
  }
  return 'Tier 4';
}

export function calcPredictedNRMSNBP(
  ptnTier: string = 'Tier 2',
  prodiTier: string = 'Tier 2',
  jenjang: string = 'S1'
): { nrm: number; keketatan: string; label: string } {
  let baseNRM = 85.0;
  let keketatan = '3.5%';

  // Matrix PTN Tier & Prodi Tier
  if (ptnTier === 'Tier 1') {
    if (prodiTier === 'Tier 1') {
      baseNRM = 92.5;
      keketatan = '1.2%';
    } else if (prodiTier === 'Tier 2') {
      baseNRM = 89.8;
      keketatan = '2.4%';
    } else if (prodiTier === 'Tier 3') {
      baseNRM = 87.0;
      keketatan = '4.5%';
    } else {
      baseNRM = 84.5;
      keketatan = '7.5%';
    }
  } else if (ptnTier === 'Tier 2') {
    if (prodiTier === 'Tier 1') {
      baseNRM = 89.5;
      keketatan = '2.0%';
    } else if (prodiTier === 'Tier 2') {
      baseNRM = 86.8;
      keketatan = '3.8%';
    } else if (prodiTier === 'Tier 3') {
      baseNRM = 84.0;
      keketatan = '6.5%';
    } else {
      baseNRM = 81.5;
      keketatan = '10.0%';
    }
  } else if (ptnTier === 'Vokasi') {
    if (prodiTier === 'Tier 1') {
      baseNRM = 86.0;
      keketatan = '3.0%';
    } else if (prodiTier === 'Tier 2') {
      baseNRM = 83.5;
      keketatan = '4.8%';
    } else {
      baseNRM = 80.5;
      keketatan = '8.0%';
    }
  } else {
    // Tier 3
    if (prodiTier === 'Tier 1') {
      baseNRM = 86.5;
      keketatan = '3.5%';
    } else if (prodiTier === 'Tier 2') {
      baseNRM = 83.5;
      keketatan = '5.8%';
    } else if (prodiTier === 'Tier 3') {
      baseNRM = 80.5;
      keketatan = '8.5%';
    } else {
      baseNRM = 78.0;
      keketatan = '13.5%';
    }
  }

  // Jenjang offset
  if (jenjang === 'D4') baseNRM -= 1.0;
  if (jenjang === 'D3') baseNRM -= 2.0;

  return {
    nrm: Number(baseNRM.toFixed(1)),
    keketatan,
    label: `${ptnTier} • Prodi ${prodiTier} (${jenjang})`,
  };
}

export function calcPredictedNAMSNBT(
  ptnTier: string = 'Tier 2',
  prodiTier: string = 'Tier 2',
  jenjang: string = 'S1'
): { namTarget: number; skorAman: number; label: string } {
  let nam = 635.0;

  if (ptnTier === 'Tier 1') {
    if (prodiTier === 'Tier 1') nam = 735.0;
    else if (prodiTier === 'Tier 2') nam = 688.0;
    else if (prodiTier === 'Tier 3') nam = 645.0;
    else nam = 610.0;
  } else if (ptnTier === 'Tier 2') {
    if (prodiTier === 'Tier 1') nam = 680.0;
    else if (prodiTier === 'Tier 2') nam = 638.0;
    else if (prodiTier === 'Tier 3') nam = 598.0;
    else nam = 565.0;
  } else if (ptnTier === 'Vokasi') {
    if (prodiTier === 'Tier 1') nam = 640.0;
    else if (prodiTier === 'Tier 2') nam = 605.0;
    else nam = 560.0;
  } else {
    // Tier 3
    if (prodiTier === 'Tier 1') nam = 630.0;
    else if (prodiTier === 'Tier 2') nam = 585.0;
    else if (prodiTier === 'Tier 3') nam = 548.0;
    else nam = 515.0;
  }

  if (jenjang === 'D4') nam -= 15.0;
  if (jenjang === 'D3') nam -= 30.0;

  return {
    namTarget: Number(nam.toFixed(1)),
    skorAman: Number((nam + 22.0).toFixed(1)),
    label: `${ptnTier} • Prodi ${prodiTier} (${jenjang})`,
  };
}

// Tier Defaults Helper
export function getTierDefaultsSNBP(tier?: string): { nrm: number; ketetatan: string; label: string } {
  switch (tier) {
    case 'Tier 1':
      return { nrm: 90.5, ketetatan: '1.8%', label: '🏆 Tier 1 (Favorit Nasional / Top Elite)' };
    case 'Tier 2':
      return { nrm: 86.5, ketetatan: '3.5%', label: '🌟 Tier 2 (Unggulan Regional)' };
    case 'Tier 3':
      return { nrm: 81.5, ketetatan: '6.2%', label: '🎯 Tier 3 (Potensial & Mandiri)' };
    case 'Vokasi':
      return { nrm: 80.0, ketetatan: '4.8%', label: '🛠️ Vokasi / Politeknik Negeri' };
    default:
      return { nrm: 85.0, ketetatan: '4.0%', label: '🎯 Standar PTN' };
  }
}

export function getTierDefaultsSNBT(tier?: string): { namTarget: number; label: string } {
  switch (tier) {
    case 'Tier 1':
      return { namTarget: 715.0, label: '🏆 Tier 1 (Top Cluster 700+)' };
    case 'Tier 2':
      return { namTarget: 665.0, label: '🌟 Tier 2 (Cluster 650–699)' };
    case 'Tier 3':
      return { namTarget: 615.0, label: '🎯 Tier 3 (Cluster 600–649)' };
    case 'Tier 4':
      return { namTarget: 560.0, label: '⚡ Tier 4 (Cluster 520–599)' };
    case 'Vokasi':
      return { namTarget: 590.0, label: '🛠️ Vokasi (D4 / Sarjana Terapan)' };
    default:
      return { namTarget: 640.0, label: '🎯 Standar PTN' };
  }
}

export function calcSkalaPrediksiSNBT(skorTertimbang: number, namTarget: number, tier?: string) {
  const gap = Number((skorTertimbang - namTarget).toFixed(2));
  let chancePct = 50;
  let label = 'Kompetitif ⚡';
  let badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300';
  let gradientColor = 'from-amber-500 to-orange-500';
  let advice = 'Pertahankan latihan berkala untuk memperlebar gap aman.';

  if (gap >= 50) {
    chancePct = Math.min(98, 90 + Math.round((gap - 50) * 0.2));
    label = 'Sangat Aman 🔥';
    badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300';
    gradientColor = 'from-emerald-500 to-green-600';
    advice = 'Skor Anda sudah melampaui rata-rata lolos tahun lalu. Pertahankan!';
  } else if (gap >= 20) {
    chancePct = Math.min(89, 80 + Math.round((gap - 20) * 0.3));
    label = 'Peluang Aman ✅';
    badgeColor = 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300 border-green-300';
    gradientColor = 'from-green-500 to-emerald-600';
    advice = 'Peluang lolos solid. Siapkan strategi pilihan 2 sebagai pengaman cadangan.';
  } else if (gap >= 0) {
    chancePct = Math.min(79, 68 + Math.round(gap * 0.5));
    label = 'Kompetitif ⚡';
    badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300';
    gradientColor = 'from-blue-500 to-indigo-600';
    advice = 'Skor berada di batas kuota aman. Tingkatkan 15–20 poin pada subtes prioritas.';
  } else if (gap >= -30) {
    chancePct = Math.max(45, 65 - Math.round(Math.abs(gap) * 0.6));
    label = 'Peluang Terbuka 📈';
    badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300';
    gradientColor = 'from-amber-500 to-yellow-600';
    advice = 'Hanya berselisih sedikit dari target NAM. Push drill soal TPS & PM setiap hari!';
  } else if (gap >= -60) {
    chancePct = Math.max(30, 44 - Math.round((Math.abs(gap) - 30) * 0.4));
    label = 'Butuh Boost ⚠️';
    badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300';
    gradientColor = 'from-orange-500 to-rose-600';
    advice = 'Tingkat persaingan cukup berat untuk skor saat ini. Pasang pilihan cadangan di tier bawahnya.';
  } else {
    chancePct = Math.max(12, 28 - Math.round((Math.abs(gap) - 60) * 0.2));
    label = 'Resiko Tinggi ❌';
    badgeColor = 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border-red-400';
    gradientColor = 'from-rose-600 to-red-800';
    advice = 'Selisih target cukup jauh (>60 poin). Pertimbangkan pilihan 1 sebagai prodi impian dan pilihan 2-4 prodi aman.';
  }

  return { gap, chancePct, label, badgeColor, gradientColor, advice };
}

export function calcPeluangSNBP(
  siswa: Siswa,
  nilaiRaporList: NilaiRapor[],
  tka: TKAData | null,
  prestasiList: Prestasi[],
  tambahan: Tambahan | null,
  pilihanList: PilihanPTNSNBP[],
  allPTN: PTNSNBPItem[] = []
): {
  peluang_total: number;
  label_total: string;
  color_total: string;
  peluang_tanpa_keketatan: number;
  skor_keketatan_final: number;
  rata_rapor: number;
  hasTKA: boolean;
  total_gap: number;
  breakdown: BreakdownKomponenSNBP[];
  pilihanAnalisa: AnalisaSNBPPilihan[];
  skor_akreditasi: number;
  skor_alumni_jurusan: number;
  skor_alumni_ptn: number;
  skor_ranking_sekolah: number;
  skor_sertifikat: number;
} {
  const { rata_rapor, terbobotPerMapel } = calcRataRapor(nilaiRaporList);
  const tkaValidation = calcValidasiTKA(tka, nilaiRaporList, rata_rapor);
  const hasTKA = tkaValidation.hasTKA;

  // 1. Rata-rata Rapor (25 tanpa TKA / 20 dengan TKA)
  const maxRapor = hasTKA ? 20 : 25;
  let poinRapor = 0;
  if (rata_rapor > 0) {
    if (hasTKA) {
      poinRapor = rata_rapor >= 90 ? 20 : rata_rapor >= 80 ? 15 : 10;
    } else {
      poinRapor = rata_rapor >= 90 ? 25 : rata_rapor >= 80 ? 20 : 15;
    }
  }

  // 2. Mapel Pendukung Prodi (10)
  // Per choice: both mapels present in rapor with terbobot > 0 = 10, one = 5, none = 0.
  // Final score = average across all choices.
  const pilihanAnalisa: AnalisaSNBPPilihan[] = [];
  let sumSkorMapel = 0;
  let sumSkorKeketatan = 0;

  for (const pil of pilihanList) {
    const ptnItem = allPTN.find(
      (p) =>
        p.prodi.toLowerCase() === pil.prodi.toLowerCase() &&
        (p.ptn.toLowerCase().includes(pil.ptn.toLowerCase()) || pil.ptn.toLowerCase().includes(p.ptn.toLowerCase()))
    );

    const effectivePtnTier = pil.ptnTier || (ptnItem && ptnItem.tier ? (ptnItem.tier as any) : inferPTNTier(pil.ptn));
    const effectiveProdiTier = pil.prodiTier || inferProdiTier(pil.prodi);
    const predictedTier = calcPredictedNRMSNBP(effectivePtnTier, effectiveProdiTier, pil.jenjang);

    let nrm = ptnItem ? ptnItem.nrm : 0;
    if (pil.nrmTarget) {
      nrm = pil.nrmTarget;
    } else if (!nrm) {
      nrm = predictedTier.nrm;
    }
    const mapels = getMapelPendukungProdi(pil.prodi);

    const mapel1Ada =
      Boolean(mapels[0]) &&
      terbobotPerMapel.some(
        (m) => m.terbobot > 0 && (m.mapel.toLowerCase().includes(mapels[0].toLowerCase()) || mapels[0].toLowerCase().includes(m.mapel.toLowerCase()))
      );
    const mapel2Ada =
      Boolean(mapels[1]) &&
      terbobotPerMapel.some(
        (m) => m.terbobot > 0 && (m.mapel.toLowerCase().includes(mapels[1].toLowerCase()) || mapels[1].toLowerCase().includes(m.mapel.toLowerCase()))
      );

    let poinMapelProdi = 0;
    if (mapel1Ada && mapel2Ada) poinMapelProdi = 10;
    else if (mapel1Ada || mapel2Ada) poinMapelProdi = 5;
    sumSkorMapel += poinMapelProdi;

    // Keketatan
    const skor_keketatan = nrm > 0 && rata_rapor >= nrm ? 5 : 3;
    sumSkorKeketatan += skor_keketatan;

    pilihanAnalisa.push({
      pilihan_ke: pil.pilihan_ke,
      ptn: pil.ptn,
      prodi: pil.prodi,
      provinsi_ptn: pil.provinsi_ptn,
      nrm,
      mapelPendukung: mapels,
      statusMapel: { mapel1Ada, mapel2Ada },
      skor_keketatan,
      peluang_prodi: 0, // calculated below
      label_peluang: '',
      color_peluang: '',
      ptnDetail: ptnItem,
      tier: pil.tier || (ptnItem ? ptnItem.tier : undefined),
      isCustom: pil.isCustom,
    });
  }

  const poinMapel = pilihanList.length > 0 ? Number((sumSkorMapel / pilihanList.length).toFixed(2)) : 0;

  // 3. Ranking kelas (5)
  // 1-10 -> 5; 11-20 -> 3; >20 -> 1; 0/empty -> 0
  const rk = tambahan?.ranking_kelas || 0;
  const poinRankingKelas = rk > 0 && rk <= 10 ? 5 : rk > 10 && rk <= 20 ? 3 : rk > 20 ? 1 : 0;

  // 4. Sertifikat/Prestasi (20)
  // count with point > 0: >=3 -> 20; 1-2 -> 10; 0 -> 0
  const validPrestasiCount = prestasiList.filter((p) => p.poin > 0).length;
  const poinPrestasi = validPrestasiCount >= 3 ? 20 : validPrestasiCount >= 1 ? 10 : 0;

  // 5. Akreditasi sekolah (5)
  // A -> 5; selain A -> 3
  const poinAkreditasi = siswa.akreditasi === 'A' ? 5 : 3;

  // 6. Ranking sekolah (10)
  // 1-10 -> 10; >10 -> 5; 0 -> 0
  const rs = tambahan?.ranking_sekolah || 0;
  const poinRankingSekolah = rs > 0 && rs <= 10 ? 10 : rs > 10 ? 5 : 0;

  // 7. Alumni jurusan diterima SNBP tahun lalu (10)
  // >3 -> 10; 1-3 -> 5; 0 -> 0
  const aj = tambahan?.alumni_jurusan || 0;
  const poinAlumniJurusan = aj > 3 ? 10 : aj >= 1 ? 5 : 0;

  // 8. Alumni PTN pilihan tahun lalu (10)
  // >=30 -> 10; 1-29 -> 5; 0 -> 0
  const ap = tambahan?.alumni_ptn || 0;
  const poinAlumniPTN = ap >= 30 ? 10 : ap >= 1 ? 5 : 0;

  // 9. GAP TKA vs Rapor (5, hanya jika ada TKA)
  // total_gap < 50 -> 5; 50-100 -> 3; >100 -> 1
  let poinTKA = 0;
  if (hasTKA) {
    poinTKA = tkaValidation.total_gap < 50 ? 5 : tkaValidation.total_gap <= 100 ? 3 : 1;
  }

  const rawSum =
    poinRapor +
    poinMapel +
    poinRankingKelas +
    poinPrestasi +
    poinAkreditasi +
    poinRankingSekolah +
    poinAlumniJurusan +
    poinAlumniPTN +
    (hasTKA ? poinTKA : 0);

  const peluang_tanpa_keketatan = Math.min(Math.max(rawSum, 0), 95);

  const skor_keketatan_final =
    pilihanList.length > 0 ? Number((sumSkorKeketatan / pilihanList.length).toFixed(2)) : 3;

  const peluang_total = Math.min(Number((peluang_tanpa_keketatan + skor_keketatan_final).toFixed(2)), 100);

  // Update per pilihan
  for (const pil of pilihanAnalisa) {
    pil.peluang_prodi = Math.min(Number((peluang_tanpa_keketatan + pil.skor_keketatan).toFixed(2)), 100);
    const { label, color } = getPeluangLabel(pil.peluang_prodi);
    pil.label_peluang = label;
    pil.color_peluang = color;
  }

  const { label: label_total, color: color_total } = getPeluangLabel(peluang_total);

  const createStatus = (val: number, max: number): 'Baik' | 'Cukup' | 'Tingkatkan' => {
    const pct = (val / max) * 100;
    return pct >= 80 ? 'Baik' : pct >= 50 ? 'Cukup' : 'Tingkatkan';
  };

  const breakdown: BreakdownKomponenSNBP[] = [
    {
      key: 'rapor',
      nama: 'Nilai Rata-rata Rapor',
      bobotMaks: maxRapor,
      poin: poinRapor,
      persen: Math.round((poinRapor / maxRapor) * 100),
      keterangan: `Rata-rata ${rata_rapor.toFixed(1)} ${rata_rapor >= 90 ? '(Sangat Baik)' : rata_rapor >= 80 ? '(Baik)' : '(Cukup)'}`,
      status: createStatus(poinRapor, maxRapor),
    },
    {
      key: 'mapel_prodi',
      nama: 'Mapel Pendukung Prodi',
      bobotMaks: 10,
      poin: poinMapel,
      persen: Math.round((poinMapel / 10) * 100),
      keterangan: `${poinMapel === 10 ? 'Kedua mapel pendukung ada' : poinMapel > 0 ? 'Sebagian mapel terpenuhi' : 'Mapel pendukung belum ada'}`,
      status: createStatus(poinMapel, 10),
    },
    {
      key: 'ranking_kelas',
      nama: 'Ranking Kelas Paralel',
      bobotMaks: 5,
      poin: poinRankingKelas,
      persen: Math.round((poinRankingKelas / 5) * 100),
      keterangan: rk > 0 ? `Peringkat ke-${rk}` : 'Belum diisi',
      status: createStatus(poinRankingKelas, 5),
    },
    {
      key: 'prestasi',
      nama: 'Sertifikat & Prestasi',
      bobotMaks: 20,
      poin: poinPrestasi,
      persen: Math.round((poinPrestasi / 20) * 100),
      keterangan: `${validPrestasiCount} sertifikat terverifikasi berpoin`,
      status: createStatus(poinPrestasi, 20),
    },
    {
      key: 'akreditasi',
      nama: 'Akreditasi Sekolah',
      bobotMaks: 5,
      poin: poinAkreditasi,
      persen: Math.round((poinAkreditasi / 5) * 100),
      keterangan: `Akreditasi ${siswa.akreditasi || 'A'}`,
      status: createStatus(poinAkreditasi, 5),
    },
    {
      key: 'ranking_sekolah',
      nama: 'Ranking Sekolah di Kota/Prov',
      bobotMaks: 10,
      poin: poinRankingSekolah,
      persen: Math.round((poinRankingSekolah / 10) * 100),
      keterangan: rs > 0 ? `Top ${rs}` : 'Belum diisi',
      status: createStatus(poinRankingSekolah, 10),
    },
    {
      key: 'alumni_jurusan',
      nama: 'Alumni Diterima di Jurusan',
      bobotMaks: 10,
      poin: poinAlumniJurusan,
      persen: Math.round((poinAlumniJurusan / 10) * 100),
      keterangan: aj > 0 ? `${aj} alumni tahun lalu` : '0 alumni tercatat',
      status: createStatus(poinAlumniJurusan, 10),
    },
    {
      key: 'alumni_ptn',
      nama: 'Alumni Diterima di PTN',
      bobotMaks: 10,
      poin: poinAlumniPTN,
      persen: Math.round((poinAlumniPTN / 10) * 100),
      keterangan: ap > 0 ? `${ap} alumni di PTN pilihan` : '0 alumni tercatat',
      status: createStatus(poinAlumniPTN, 10),
    },
  ];

  if (hasTKA) {
    breakdown.push({
      key: 'tka_gap',
      nama: 'GAP TKA vs Rapor',
      bobotMaks: 5,
      poin: poinTKA,
      persen: Math.round((poinTKA / 5) * 100),
      keterangan: `Total selisih ${tkaValidation.total_gap.toFixed(1)} poin (${poinTKA === 5 ? 'Sangat Selaras' : poinTKA === 3 ? 'Cukup Selaras' : 'Gap Tinggi'})`,
      status: createStatus(poinTKA, 5),
    });
  }

  return {
    peluang_total,
    label_total,
    color_total,
    peluang_tanpa_keketatan,
    skor_keketatan_final,
    rata_rapor,
    hasTKA,
    total_gap: tkaValidation.total_gap,
    breakdown,
    pilihanAnalisa,
    skor_akreditasi: poinAkreditasi,
    skor_alumni_jurusan: poinAlumniJurusan,
    skor_alumni_ptn: poinAlumniPTN,
    skor_ranking_sekolah: poinRankingSekolah,
    skor_sertifikat: poinPrestasi,
  };
}

export function getPeluangLabel(score: number): { label: string; color: string; hex: string } {
  if (score >= 80) return { label: 'Sangat Tinggi', color: 'text-green-600 dark:text-green-400', hex: '#16A34A' };
  if (score >= 65) return { label: 'Tinggi', color: 'text-emerald-600 dark:text-emerald-400', hex: '#059669' };
  if (score >= 50) return { label: 'Sedang', color: 'text-amber-600 dark:text-amber-400', hex: '#D97706' };
  if (score >= 35) return { label: 'Rendah', color: 'text-red-600 dark:text-red-400', hex: '#DC2626' };
  return { label: 'Sangat Rendah', color: 'text-rose-800 dark:text-rose-500', hex: '#7F1D1D' };
}

// 5.9 Validasi Pilihan Provinsi
export function validatePilihanProvinsi(
  pilihanList: { ptn: string; provinsi_ptn: string }[],
  provinsiSekolah: string
): { valid: boolean; pesan?: string } {
  if (pilihanList.length < 2) return { valid: true };
  if (!provinsiSekolah) return { valid: true };

  const match = pilihanList.some((p) => p.provinsi_ptn && p.provinsi_ptn.toLowerCase() === provinsiSekolah.toLowerCase());

  if (!match) {
    return {
      valid: false,
      pesan: `Aturan SNBP: Jika memilih 2 prodi, minimal 1 PTN harus berada di provinsi yang sama dengan sekolah asal Anda (${provinsiSekolah}).`,
    };
  }
  return { valid: true };
}

// 5.10 Nilai Akhir SNBP (0-100)
export function calcNilaiAkhirSNBP(
  rata_rapor: number,
  skor_sertifikat: number,
  skor_akreditasi: number,
  skor_alumni_jurusan: number,
  skor_alumni_ptn: number,
  skor_ranking_sekolah: number,
  hasTKA: boolean,
  rata_tka_100: number
): {
  skorRapor50: number;
  skorPrestasi30: number;
  skorTambahan20: number;
  nilaiAkhir: number;
  label: string;
  color: string;
  hex: string;
} {
  const skorRapor50 = Number(((rata_rapor / 100) * 50).toFixed(2));
  let skorPrestasi30 = Math.min((skor_sertifikat / 20) * 30, 30);
  if (hasTKA && rata_tka_100 > 60) {
    skorPrestasi30 = Math.min(skorPrestasi30 + 2, 30);
  }
  skorPrestasi30 = Number(skorPrestasi30.toFixed(2));

  const totalTambahan = skor_akreditasi + skor_alumni_jurusan + skor_alumni_ptn + skor_ranking_sekolah;
  const skorTambahan20 = Number(Math.min((totalTambahan / 35) * 20, 20).toFixed(2));

  const rawNAS = skorRapor50 + skorPrestasi30 + skorTambahan20;
  const nilaiAkhir = Number(Math.max(0, Math.min(100, rawNAS)).toFixed(2));

  let label = 'Rendah';
  let color = 'text-rose-800 dark:text-rose-500';
  let hex = '#7F1D1D';
  if (nilaiAkhir >= 80) {
    label = 'Sangat Kompetitif';
    color = 'text-green-600 dark:text-green-400';
    hex = '#16A34A';
  } else if (nilaiAkhir >= 65) {
    label = 'Kompetitif';
    color = 'text-emerald-600 dark:text-emerald-400';
    hex = '#059669';
  } else if (nilaiAkhir >= 50) {
    label = 'Cukup Kompetitif';
    color = 'text-amber-600 dark:text-amber-400';
    hex = '#D97706';
  } else if (nilaiAkhir >= 35) {
    label = 'Perlu Peningkatan';
    color = 'text-red-600 dark:text-red-400';
    hex = '#DC2626';
  }

  return { skorRapor50, skorPrestasi30, skorTambahan20, nilaiAkhir, label, color, hex };
}

// 5.11 Rekomendasi Nilai Semester Berikutnya
export interface RekomendasiSemesterResult {
  hasRekomendasi: boolean;
  semTerakhir: number;
  semBerikutnya: number;
  bobotBerikutnya: number;
  target_rata: number;
  pesan?: string;
  top2Mapel: {
    mapel: string;
    rataM: number;
    targetMapel: number;
    isMapelProdi: boolean;
  }[];
  fokusProdiMapel: string[];
  tipsSemester: { sem: string; tip: string }[];
}

export function calcRekomendasiSemester(
  nilaiRaporList: NilaiRapor[],
  pilihanList: PilihanPTNSNBP[]
): RekomendasiSemesterResult {
  let semTerakhir = 0;
  for (const r of nilaiRaporList) {
    if (r.sem5 > 0) semTerakhir = Math.max(semTerakhir, 5);
    else if (r.sem4 > 0) semTerakhir = Math.max(semTerakhir, 4);
    else if (r.sem3 > 0) semTerakhir = Math.max(semTerakhir, 3);
    else if (r.sem2 > 0) semTerakhir = Math.max(semTerakhir, 2);
    else if (r.sem1 > 0) semTerakhir = Math.max(semTerakhir, 1);
  }

  if (semTerakhir === 0 || semTerakhir >= 5) {
    return {
      hasRekomendasi: false,
      semTerakhir,
      semBerikutnya: 0,
      bobotBerikutnya: 0,
      target_rata: 0,
      pesan:
        semTerakhir >= 5
          ? 'Seluruh 5 semester rapor telah terisi lengkap. Fokus pada persiapan berkas portofolio dan pemantapan pilihan prodi!'
          : 'Belum ada nilai semester yang terisi. Silakan isi nilai rapor minimal semester 1 untuk melihat rekomendasi.',
      top2Mapel: [],
      fokusProdiMapel: [],
      tipsSemester: [],
    };
  }

  const semBerikutnya = semTerakhir + 1;
  const bobotBerikutnya = BOBOT_SEMESTER[semBerikutnya - 1] * 100;

  // hitung rata-rata mapel 1..semTerakhir
  const mapelStats: { mapel: string; rataM: number }[] = [];
  let sumAll = 0;
  let countAll = 0;

  for (const r of nilaiRaporList) {
    const sems = [r.sem1, r.sem2, r.sem3, r.sem4, r.sem5].slice(0, semTerakhir);
    const valid = sems.filter((v) => v > 0);
    if (valid.length > 0) {
      const avg = Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2));
      mapelStats.push({ mapel: r.mapel, rataM: avg });
      sumAll += avg;
      countAll++;
    }
  }

  const rata_rapor = countAll > 0 ? sumAll / countAll : 0;
  let target_rata = 80;
  if (rata_rapor >= 90) target_rata = 93;
  else if (rata_rapor >= 85) target_rata = 90;
  else if (rata_rapor >= 80) target_rata = 87;
  else if (rata_rapor >= 75) target_rata = 83;

  // Kumpulkan mapel pendukung dari prodi pilihan
  const prodiMapelsSet = new Set<string>();
  pilihanList.forEach((p) => {
    const [m1, m2] = getMapelPendukungProdi(p.prodi);
    if (m1) prodiMapelsSet.add(m1.toLowerCase());
    if (m2) prodiMapelsSet.add(m2.toLowerCase());
  });

  // Urutkan mapel tertinggi
  mapelStats.sort((a, b) => b.rataM - a.rataM);
  const top2 = mapelStats.slice(0, 2);

  const top2Mapel = top2.map((item) => {
    const isMapelProdi = Array.from(prodiMapelsSet).some((pm) => item.mapel.toLowerCase().includes(pm));
    let target = Math.max(item.rataM, item.rataM >= 90 ? 93 : item.rataM >= 85 ? 90 : item.rataM + 3);
    if (isMapelProdi) target += 2;
    return {
      mapel: item.mapel,
      rataM: item.rataM,
      targetMapel: Math.min(100, target),
      isMapelProdi,
    };
  });

  const tipsSemester = [
    { sem: 'Sem 2', tip: 'Pertahankan tren konsisten; stabilkan mapel dasar dan peminatan.' },
    { sem: 'Sem 3', tip: 'Kenaikan bobot 15%; tingkatkan mapel pendukung prodi impian Anda.' },
    { sem: 'Sem 4', tip: 'Semester kunci pra-penjurusan akhir; targetkan nilai naik minimal +2 poin.' },
    { sem: 'Sem 5', tip: 'BOBOT TERTINGGI 50%! Semester paling krusial menentukan 50% kelulusan SNBP.' },
  ];

  return {
    hasRekomendasi: true,
    semTerakhir,
    semBerikutnya,
    bobotBerikutnya,
    target_rata,
    top2Mapel,
    fokusProdiMapel: Array.from(prodiMapelsSet),
    tipsSemester,
  };
}

// 5.12 Rekomendasi 3 Alternatif PTN SNBP
export interface AlternatifPTNSNBP {
  ptn: string;
  singkatan: string;
  prodi: string;
  nrm: number;
  prov: string;
  gap: number;
  estimasiPeluang: number;
  label: string;
  color: string;
}

export function calcRekomendasiPTNSNBP(
  rata_rapor: number,
  allPTN: PTNSNBPItem[],
  currentPilihan: PilihanPTNSNBP[]
): AlternatifPTNSNBP[] {
  if (rata_rapor <= 0 || allPTN.length === 0) return [];

  const existing = new Set(
    currentPilihan.map((p) => `${p.ptn.toLowerCase()}__${p.prodi.toLowerCase()}`)
  );

  let candidates = allPTN.filter((p) => {
    if (!p.nrm || p.nrm <= 0) return false;
    const key = `${p.ptn.toLowerCase()}__${p.prodi.toLowerCase()}`;
    if (existing.has(key)) return false;
    return p.nrm >= rata_rapor - 15 && p.nrm <= rata_rapor + 2;
  });

  // If no candidates in strict range, relax range to give best recommendations
  if (candidates.length < 3) {
    candidates = allPTN.filter((p) => {
      if (!p.nrm || p.nrm <= 0) return false;
      const key = `${p.ptn.toLowerCase()}__${p.prodi.toLowerCase()}`;
      return !existing.has(key);
    });
  }

  const mapped = candidates.map((item) => {
    const gap = Number((rata_rapor - item.nrm).toFixed(2));
    let estimasiPeluang = 40;
    let label = 'Perlu Peningkatan';
    let color = 'text-rose-600 dark:text-rose-400';

    if (gap >= 5) {
      estimasiPeluang = 90;
      label = 'Sangat Aman 🔥';
      color = 'text-green-600 dark:text-green-400';
    } else if (gap >= 2) {
      estimasiPeluang = 78;
      label = 'Peluang Aman ✅';
      color = 'text-emerald-600 dark:text-emerald-400';
    } else if (gap >= 0) {
      estimasiPeluang = 64;
      label = 'Kompetitif (Di Atas NRM) ⚡';
      color = 'text-amber-600 dark:text-amber-400';
    } else if (gap >= -3) {
      estimasiPeluang = 50;
      label = 'Peluang Terbuka 📈';
      color = 'text-orange-500 dark:text-orange-400';
    } else {
      estimasiPeluang = 35;
      label = 'Butuh Peningkatan ⚠️';
      color = 'text-rose-600 dark:text-rose-400';
    }

    return {
      ptn: item.ptn,
      singkatan: item.singkatan || item.ptn,
      prodi: item.prodi,
      nrm: item.nrm,
      prov: item.prov,
      gap,
      estimasiPeluang,
      label,
      color,
    };
  });

  // Urutkan berdasarkan peluang tertinggi (estimasiPeluang DESC, gap DESC)
  mapped.sort((a, b) => b.estimasiPeluang - a.estimasiPeluang || b.gap - a.gap);
  return mapped.slice(0, 3);
}

// ==========================================
// BAGIAN 6 - RUMUS SNBT (FORMULA 60 : 40)
// ==========================================

export const BOBOT_SNBT = {
  // TPS (60%)
  pu: 0.15,
  pbm: 0.15,
  ppu: 0.15,
  pk: 0.15,
  // Literasi & PM (40%)
  lbi: 0.1333,
  lbe: 0.1333,
  pm: 0.1334,
};

export const SUBTES_NAMES: Record<keyof typeof BOBOT_SNBT, { nama: string; grup: 'TPS' | 'Literasi' }> = {
  pu: { nama: 'Penalaran Umum (PU)', grup: 'TPS' },
  pbm: { nama: 'Pemahaman Bacaan & Menulis (PBM)', grup: 'TPS' },
  ppu: { nama: 'Pengetahuan & Pemahaman Umum (PPU)', grup: 'TPS' },
  pk: { nama: 'Pengetahuan Kuantitatif (PK)', grup: 'TPS' },
  lbi: { nama: 'Literasi Bahasa Indonesia (LBI)', grup: 'Literasi' },
  lbe: { nama: 'Literasi Bahasa Inggris (LBE)', grup: 'Literasi' },
  pm: { nama: 'Penalaran Matematika (PM)', grup: 'Literasi' },
};

export function calcSkorTO(
  pu: number,
  pbm: number,
  ppu: number,
  pk: number,
  lbi: number,
  lbe: number,
  pm: number
): {
  skor_tps: number;
  skor_literasi: number;
  total: number;
  skor_tertimbang: number;
  subtesTerisiCount: number;
} {
  const vals: Record<keyof typeof BOBOT_SNBT, number> = {
    pu: pu || 0,
    pbm: pbm || 0,
    ppu: ppu || 0,
    pk: pk || 0,
    lbi: lbi || 0,
    lbe: lbe || 0,
    pm: pm || 0,
  };

  const tpsKeys: (keyof typeof BOBOT_SNBT)[] = ['pu', 'pbm', 'ppu', 'pk'];
  const litKeys: (keyof typeof BOBOT_SNBT)[] = ['lbi', 'lbe', 'pm'];

  const tpsVals = tpsKeys.map((k) => vals[k]).filter((v) => v > 0);
  const litVals = litKeys.map((k) => vals[k]).filter((v) => v > 0);
  const allVals = Object.values(vals).filter((v) => v > 0);

  const skor_tps = tpsVals.length > 0 ? Number((tpsVals.reduce((a, b) => a + b, 0) / tpsVals.length).toFixed(2)) : 0;
  const skor_literasi = litVals.length > 0 ? Number((litVals.reduce((a, b) => a + b, 0) / litVals.length).toFixed(2)) : 0;
  const total = allVals.length > 0 ? Number((allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(2)) : 0;

  // Skor tertimbang mentah & bobot aktif
  let mentah = 0;
  let bobotAktif = 0;

  (Object.keys(BOBOT_SNBT) as (keyof typeof BOBOT_SNBT)[]).forEach((k) => {
    if (vals[k] > 0) {
      mentah += vals[k] * BOBOT_SNBT[k];
      bobotAktif += BOBOT_SNBT[k];
    }
  });

  let skor_tertimbang = 0;
  if (bobotAktif >= 0.999) {
    skor_tertimbang = Number(mentah.toFixed(2));
  } else if (bobotAktif > 0) {
    skor_tertimbang = Number((mentah / bobotAktif).toFixed(2));
  }

  return {
    skor_tps,
    skor_literasi,
    total,
    skor_tertimbang,
    subtesTerisiCount: allVals.length,
  };
}

// 6.1 Statistik SNBT
export interface StatistikSNBTResult {
  validCount: number;
  avgTert: number;
  best: number;
  latest: number;
  avgTPS: number;
  avgLit: number;
  avgSubtes: Record<keyof typeof BOBOT_SNBT, number>;
  trend: 'NAIK' | 'TURUN' | 'STABIL';
  trendLabel: string;
}

export function calcStatistikSNBT(toList: TOData[]): StatistikSNBTResult {
  const valid = toList.filter((to) => to.skor_tertimbang > 0);
  const n = valid.length;

  const initialSubtes: Record<keyof typeof BOBOT_SNBT, number> = {
    pu: 0,
    pbm: 0,
    ppu: 0,
    pk: 0,
    lbi: 0,
    lbe: 0,
    pm: 0,
  };

  if (n === 0) {
    return {
      validCount: 0,
      avgTert: 0,
      best: 0,
      latest: 0,
      avgTPS: 0,
      avgLit: 0,
      avgSubtes: initialSubtes,
      trend: 'STABIL',
      trendLabel: 'Belum cukup data',
    };
  }

  const avgTert = Number((valid.reduce((a, b) => a + b.skor_tertimbang, 0) / n).toFixed(2));
  const best = Number(Math.max(...valid.map((x) => x.skor_tertimbang)).toFixed(2));
  const latest = Number(valid[valid.length - 1].skor_tertimbang.toFixed(2));

  const validTPS = valid.map((x) => x.skor_tps).filter((v) => v > 0);
  const avgTPS = validTPS.length > 0 ? Number((validTPS.reduce((a, b) => a + b, 0) / validTPS.length).toFixed(2)) : 0;

  const validLit = valid.map((x) => x.skor_literasi).filter((v) => v > 0);
  const avgLit = validLit.length > 0 ? Number((validLit.reduce((a, b) => a + b, 0) / validLit.length).toFixed(2)) : 0;

  const avgSubtes: Record<keyof typeof BOBOT_SNBT, number> = { ...initialSubtes };
  (Object.keys(BOBOT_SNBT) as (keyof typeof BOBOT_SNBT)[]).forEach((k) => {
    const vals = valid.map((x) => x[k]).filter((v) => v > 0);
    avgSubtes[k] = vals.length > 0 ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
  });

  // Trend (butuh >= 4 TO valid)
  let trend: 'NAIK' | 'TURUN' | 'STABIL' = 'STABIL';
  let trendLabel = 'Stabil';
  if (n >= 4) {
    const half = Math.floor(n / 2);
    const avgF = valid.slice(0, half).reduce((a, b) => a + b.skor_tertimbang, 0) / half;
    const avgS = valid.slice(half).reduce((a, b) => a + b.skor_tertimbang, 0) / (n - half);
    if (avgS > avgF + 10) {
      trend = 'NAIK';
      trendLabel = 'NAIK ✅';
    } else if (avgS < avgF - 10) {
      trend = 'TURUN';
      trendLabel = 'TURUN ⚠️';
    } else {
      trend = 'STABIL';
      trendLabel = 'STABIL ➡️';
    }
  }

  return {
    validCount: n,
    avgTert,
    best,
    latest,
    avgTPS,
    avgLit,
    avgSubtes,
    trend,
    trendLabel,
  };
}

// 6.2 Ketercapaian vs Target NAM
export function calcKetercapaianNAM(skorTertimbang: number, namTarget: number): {
  gap: number;
  status: 'Tercapai' | 'Hampir' | 'Perlu Usaha' | 'Jauh';
  statusLabel: string;
  colorClass: string;
  hex: string;
} {
  const gap = Number((skorTertimbang - namTarget).toFixed(2));
  if (gap >= 0) {
    return { gap, status: 'Tercapai', statusLabel: 'Tercapai ✅', colorClass: 'text-green-600 dark:text-green-400', hex: '#16A34A' };
  }
  if (gap >= -50) {
    return { gap, status: 'Hampir', statusLabel: 'Hampir ⚠️', colorClass: 'text-amber-500 dark:text-amber-400', hex: '#F59E0B' };
  }
  if (gap >= -100) {
    return { gap, status: 'Perlu Usaha', statusLabel: 'Perlu Usaha ❌', colorClass: 'text-red-500 dark:text-red-400', hex: '#EF4444' };
  }
  return { gap, status: 'Jauh', statusLabel: 'Jauh ❌', colorClass: 'text-rose-700 dark:text-rose-500', hex: '#BE123C' };
}

// 6.3 Status per Subtes
export function getStatusSubtes(avgScore: number): {
  status: 'Kuat' | 'Cukup' | 'Lemah' | 'N/A';
  keterangan: string;
  colorClass: string;
} {
  if (!avgScore || avgScore <= 0) return { status: 'N/A', keterangan: 'Belum diisi', colorClass: 'text-gray-400' };
  if (avgScore >= 600) {
    return { status: 'Kuat', keterangan: 'Pertahankan & Tingkatkan', colorClass: 'text-green-600 dark:text-green-400' };
  }
  if (avgScore >= 500) {
    return { status: 'Cukup', keterangan: 'Latihan rutin 1–2 jam/hari', colorClass: 'text-amber-500 dark:text-amber-400' };
  }
  return { status: 'Lemah', keterangan: 'FOKUS INTENSIF', colorClass: 'text-rose-600 dark:text-rose-400' };
}

// 6.4 Komponen Prioritas Jurusan
export interface PrioritasJurusan {
  dominan: keyof typeof BOBOT_SNBT;
  pendukung: (keyof typeof BOBOT_SNBT)[];
}

const PRIORITAS_PRODI_TABLE: { keys: string[]; prioritas: PrioritasJurusan }[] = [
  { keys: ['kedokteran gigi', 'kedokteran', 'kesehatan masyarakat', 'gizi', 'fisioterapi'], prioritas: { dominan: 'pu', pendukung: ['ppu', 'lbi'] } },
  { keys: ['keperawatan', 'kebidanan'], prioritas: { dominan: 'pu', pendukung: ['lbi', 'ppu'] } },
  { keys: ['kedokteran hewan', 'farmasi', 'teknologi pangan'], prioritas: { dominan: 'pu', pendukung: ['pm', 'ppu'] } },
  {
    keys: ['teknik informatika', 'teknik elektro', 'teknik kimia', 'teknik mesin', 'ilmu komputer', 'teknik industri'],
    prioritas: { dominan: 'pu', pendukung: ['pm', 'pk'] },
  },
  { keys: ['teknik sipil', 'teknik geologi', 'teknik pertambangan'], prioritas: { dominan: 'pu', pendukung: ['pm'] } },
  {
    keys: [
      'sistem informasi',
      'arsitektur',
      'teknik lingkungan',
      'perencanaan wilayah',
      'pertanian',
      'agroteknologi',
      'kelautan',
      'manajemen',
      'ekonomi pembangunan',
      'ilmu ekonomi',
    ],
    prioritas: { dominan: 'pu', pendukung: ['pm', 'ppu'] },
  },
  { keys: ['matematika', 'statistika', 'aktuaria'], prioritas: { dominan: 'pm', pendukung: ['pk', 'pu'] } },
  { keys: ['fisika'], prioritas: { dominan: 'pu', pendukung: ['pm', 'pk'] } },
  { keys: ['kimia'], prioritas: { dominan: 'pu', pendukung: ['pm', 'ppu'] } },
  { keys: ['biologi', 'peternakan', 'kehutanan', 'perikanan'], prioritas: { dominan: 'pu', pendukung: ['ppu', 'pm'] } },
  { keys: ['akuntansi', 'keuangan'], prioritas: { dominan: 'pu', pendukung: ['pm', 'pk'] } },
  { keys: ['perbankan', 'administrasi fiskal'], prioritas: { dominan: 'pu', pendukung: ['pm'] } },
  { keys: ['administrasi bisnis'], prioritas: { dominan: 'pu', pendukung: ['ppu'] } },
  {
    keys: [
      'administrasi publik',
      'ilmu politik',
      'antropologi',
      'kesejahteraan sosial',
      'kriminologi',
      'sosiologi',
      'ilmu komunikasi',
      'hukum',
      'ilmu sejarah',
      'sastra indonesia',
      'sastra jepang',
      'bahasa korea',
      'pendidikan sejarah',
    ],
    prioritas: { dominan: 'lbi', pendukung: ['ppu'] },
  },
  { keys: ['hubungan internasional', 'linguistik'], prioritas: { dominan: 'lbi', pendukung: ['lbe', 'ppu'] } },
  { keys: ['psikologi', 'geografi', 'pgsd', 'pendidikan guru', 'pendidikan sosial'], prioritas: { dominan: 'pu', pendukung: ['lbi', 'ppu'] } },
  { keys: ['sastra inggris', 'pendidikan bahasa inggris'], prioritas: { dominan: 'lbe', pendukung: ['ppu'] } },
  { keys: ['film dan televisi', 'desain interior', 'dkv', 'seni rupa', 'tata boga', 'tata rias'], prioritas: { dominan: 'ppu', pendukung: ['lbi'] } },
];

export function getKomponenPrioritasJurusan(prodiName: string): PrioritasJurusan {
  if (!prodiName) return { dominan: 'pu', pendukung: ['ppu', 'pm'] };
  const lower = prodiName.toLowerCase();

  for (const item of PRIORITAS_PRODI_TABLE) {
    if (item.keys.some((k) => lower.includes(k))) {
      return item.prioritas;
    }
  }

  // Fallback defaults
  if (lower.includes('komputer') || lower.includes('cyber') || lower.includes('software')) {
    return { dominan: 'pu', pendukung: ['pm', 'pk'] };
  }
  if (lower.includes('hukum') || lower.includes('sosial') || lower.includes('komunikasi')) {
    return { dominan: 'lbi', pendukung: ['ppu'] };
  }
  if (lower.includes('inggris')) {
    return { dominan: 'lbe', pendukung: ['ppu'] };
  }

  return { dominan: 'pu', pendukung: ['ppu', 'pm'] };
}

// 6.5 Rekomendasi 3 Alternatif PTN SNBT
export interface AlternatifPTNSNBT {
  singk: string;
  ptn: string;
  prodi: string;
  skor: number;
  gap: number;
  estimasiPeluang: number;
  label: string;
  color: string;
}

export function calcRekomendasiPTNSNBT(
  avgTert: number,
  allPTN: PTNSNBTItem[],
  currentPilihan: PilihanPTNSNBT[]
): AlternatifPTNSNBT[] {
  if (avgTert <= 0 || allPTN.length === 0) return [];

  const existing = new Set(currentPilihan.map((p) => `${p.singk_ptn.toLowerCase()}__${p.prodi.toLowerCase()}`));

  let candidates = allPTN.filter((p) => {
    if (!p.skor || p.skor <= 0) return false;
    const key = `${p.singk.toLowerCase()}__${p.prodi.toLowerCase()}`;
    if (existing.has(key)) return false;
    return p.skor >= avgTert - 80 && p.skor <= avgTert + 30;
  });

  if (candidates.length < 3) {
    candidates = allPTN.filter((p) => {
      if (!p.skor || p.skor <= 0) return false;
      const key = `${p.singk.toLowerCase()}__${p.prodi.toLowerCase()}`;
      return !existing.has(key);
    });
  }

  const mapped = candidates.map((item) => {
    const gap = Number((avgTert - item.skor).toFixed(2));
    let estimasiPeluang = 40;
    let label = 'Perlu Usaha';
    let color = 'text-rose-600 dark:text-rose-400';

    if (gap >= 50) {
      estimasiPeluang = 95;
      label = 'Sangat Aman 🔥';
      color = 'text-green-600 dark:text-green-400';
    } else if (gap >= 20) {
      estimasiPeluang = 82;
      label = 'Peluang Aman ✅';
      color = 'text-emerald-600 dark:text-emerald-400';
    } else if (gap >= 0) {
      estimasiPeluang = 68;
      label = 'Kompetitif ⚡';
      color = 'text-blue-600 dark:text-blue-400';
    } else if (gap >= -20) {
      estimasiPeluang = 52;
      label = 'Peluang Terbuka 📈';
      color = 'text-amber-600 dark:text-amber-400';
    } else {
      estimasiPeluang = 32;
      label = 'Butuh Boost ⚠️';
      color = 'text-rose-600 dark:text-rose-400';
    }

    return {
      singk: item.singk,
      ptn: item.pt || item.ptn || item.singk,
      prodi: item.prodi,
      skor: item.skor,
      gap,
      estimasiPeluang,
      label,
      color,
    };
  });

  // Urutkan berdasarkan peluang tertinggi (estimasiPeluang DESC, gap DESC)
  mapped.sort((a, b) => b.estimasiPeluang - a.estimasiPeluang || b.gap - a.gap);
  return mapped.slice(0, 3);
}

// 6.7 Strategi Peningkatan Teks Tetap
export const STRATEGI_PENINGKATAN_SNBT = [
  'Prioritaskan TPS 60% — setiap kenaikan +10 poin TPS berkontribusi rata-rata +6 poin pada total skor tertimbang.',
  'Jangan abaikan Penalaran Matematika (PM) — subtes ini memiliki daya pembeda tinggi di kalangan peserta ujian.',
  'Untuk subtes dengan skor < 500, alokasikan sesi drill soal intensif minimal 2 jam/hari dengan review pembahasan mendalam.',
  'Gunakan bank soal resmi SNPMB dan ikuti simulasi UTBK komprehensif minimal 2x setiap bulan.',
  'Jika GAP rata-rata pilihan utama berada di bawah -100 poin, pertimbangkan menyesuaikan pilihan 2, 3, atau 4 ke prodi dengan persaingan lebih realistis.',
  'Tetapkan target skor tertimbang: >= 700 untuk PTN favorit cluster 1, dan >= 650 untuk pilihan cadangan.',
  'Konsultasikan hasil evaluasi mingguan ini dengan instruktur atau konselor cabang secara berkala.',
];

// ==========================================
// BAGIAN 3 & 9 - AKSES, KELAS, & MODUL
// ==========================================

export function checkAkses(siswa: Siswa): { valid: boolean; pesan?: string } {
  if (siswa.status !== 'AKTIF') {
    return { valid: false, pesan: 'Akun Anda sedang dinonaktifkan oleh administrator.' };
  }
  if (siswa.status_daftar === 'PENDING') {
    return { valid: false, pesan: 'Pendaftaran Anda sedang menunggu persetujuan admin.' };
  }
  if (siswa.status_daftar === 'DITOLAK') {
    return { valid: false, pesan: 'Pendaftaran akun Anda ditolak oleh admin.' };
  }
  if (!siswa.akses || siswa.akses === 'UNLIMITED') {
    return { valid: true };
  }
  if (!siswa.akses_akhir) {
    return { valid: true };
  }

  const exp = new Date(siswa.akses_akhir);
  exp.setHours(23, 59, 59, 999);
  const now = new Date();

  const valid = now.getTime() <= exp.getTime();
  return {
    valid,
    pesan: valid ? undefined : 'Masa aktif paket akses Anda telah berakhir.',
  };
}

// 9 Ekstraksi angka kelas
export function extractKelasNumber(kelasText: string): string {
  if (!kelasText) return '';
  const trimmed = kelasText.trim().toUpperCase();

  if (/^(12|XII)\b/.test(trimmed) || trimmed === 'XII' || trimmed === '12') return '12';
  if (/^(11|XI)\b/.test(trimmed) || trimmed === 'XI' || trimmed === '11') return '11';
  if (/^(10|X)\b/.test(trimmed) || trimmed === 'X' || trimmed === '10') return '10';

  if (/\b12\b/.test(trimmed) || trimmed.includes('XII')) return '12';
  if (/\b11\b/.test(trimmed) || trimmed.includes('XI')) return '11';
  if (/\b10\b/.test(trimmed) || trimmed.includes('X')) return '10';

  return '';
}

export function isModulVisibleForSiswa(
  modulTargetKelas: string,
  modulTargetProgram: string,
  siswaKelas: string,
  siswaProgram: string
): boolean {
  // 1. Program check
  const targetProg = (modulTargetProgram || 'SEMUA').toUpperCase();
  const sProg = (siswaProgram || '').toUpperCase();

  if (targetProg !== 'SEMUA') {
    if (sProg !== 'SNBP+SNBT') {
      if (sProg !== targetProg) return false;
    }
  }

  // 2. Kelas check
  const targetKelas = (modulTargetKelas || 'SEMUA').toUpperCase();
  if (targetKelas === 'SEMUA') return true;

  const sKelasNum = extractKelasNumber(siswaKelas);
  if (!sKelasNum) return true; // jika kelas siswa tidak terdeteksi, berikan akses

  const allowedClasses = targetKelas.split(',').map((x) => x.trim());
  return allowedClasses.includes(sKelasNum);
}

// 9 Embed URL Generator
export function generateEmbedUrl(url: string, tipeFile: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Google Drive
  const gdriveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch) {
    return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
  }

  // Google Docs
  const gdocsMatch = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (gdocsMatch) {
    return `https://docs.google.com/document/d/${gdocsMatch[1]}/preview`;
  }

  // Google Sheets
  const gsheetsMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (gsheetsMatch) {
    return `https://docs.google.com/spreadsheets/d/${gsheetsMatch[1]}/preview`;
  }

  // Google Slides
  const gslidesMatch = trimmed.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (gslidesMatch) {
    return `https://docs.google.com/presentation/d/${gslidesMatch[1]}/embed?start=false&loop=false&delayms=3000`;
  }

  // YouTube
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  }

    // PDF or generic doc
  if (tipeFile === 'pdf' || trimmed.endsWith('.pdf')) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(trimmed)}&embedded=true`;
  }

  return trimmed;
}

// ==========================================
// 10. ANALISIS 2 NILAI TERTINGGI PER SEMESTER & AKUMULATIF (SNBP)
// ==========================================
export interface Top2Item {
  mapel: string;
  nilai: number;
}

export interface Top2SemesterInfo {
  semesterKey: 'sem1' | 'sem2' | 'sem3' | 'sem4' | 'sem5' | 'akumulatif';
  label: string;
  bobotLabel: string;
  bobotPersen: number;
  top1: Top2Item | null;
  top2: Top2Item | null;
  avgTop2: number;
  hasScores: boolean;
}

export interface HasilTop2RaporSemuaSemester {
  sem1: Top2SemesterInfo;
  sem2: Top2SemesterInfo;
  sem3: Top2SemesterInfo;
  sem4: Top2SemesterInfo;
  sem5: Top2SemesterInfo;
  akumulatif: Top2SemesterInfo;
  allSemesters: Top2SemesterInfo[];
}

export function calcTop2NilaiPerSemester(
  nilaiMapels: { mapel: string; sem1: number; sem2: number; sem3: number; sem4: number; sem5: number }[]
): HasilTop2RaporSemuaSemester {
  const semesters: ('sem1' | 'sem2' | 'sem3' | 'sem4' | 'sem5')[] = ['sem1', 'sem2', 'sem3', 'sem4', 'sem5'];
  const labels: Record<string, { label: string; bobotLabel: string; bobotPersen: number }> = {
    sem1: { label: 'Semester 1', bobotLabel: '10%', bobotPersen: 10 },
    sem2: { label: 'Semester 2', bobotLabel: '10%', bobotPersen: 10 },
    sem3: { label: 'Semester 3', bobotLabel: '15%', bobotPersen: 15 },
    sem4: { label: 'Semester 4', bobotLabel: '15%', bobotPersen: 15 },
    sem5: { label: 'Semester 5', bobotLabel: '50% (Krusial)', bobotPersen: 50 },
  };

  const resultSemesters: Record<string, Top2SemesterInfo> = {};

  semesters.forEach((sem) => {
    const valid = nilaiMapels
      .map((m) => ({ mapel: m.mapel, nilai: Number(m[sem]) || 0 }))
      .filter((x) => x.nilai > 0)
      .sort((a, b) => b.nilai - a.nilai);

    const top1 = valid[0] || null;
    const top2 = valid[1] || null;
    let avgTop2 = 0;
    if (top1 && top2) avgTop2 = Number(((top1.nilai + top2.nilai) / 2).toFixed(2));
    else if (top1) avgTop2 = top1.nilai;

    resultSemesters[sem] = {
      semesterKey: sem,
      label: labels[sem].label,
      bobotLabel: labels[sem].bobotLabel,
      bobotPersen: labels[sem].bobotPersen,
      top1,
      top2,
      avgTop2,
      hasScores: valid.length > 0,
    };
  });

  // Akumulatif Terbobot (10% Sem1 + 10% Sem2 + 15% Sem3 + 15% Sem4 + 50% Sem5)
  const terbobotList = nilaiMapels
    .map((m) => {
      const tb = calcNilaiMapelTerbobot(m.sem1, m.sem2, m.sem3, m.sem4, m.sem5);
      return { mapel: m.mapel, nilai: tb };
    })
    .filter((x) => x.nilai > 0)
    .sort((a, b) => b.nilai - a.nilai);

  const top1Akum = terbobotList[0] || null;
  const top2Akum = terbobotList[1] || null;
  let avgTop2Akum = 0;
  if (top1Akum && top2Akum) avgTop2Akum = Number(((top1Akum.nilai + top2Akum.nilai) / 2).toFixed(2));
  else if (top1Akum) avgTop2Akum = top1Akum.nilai;

  const akumulatifInfo: Top2SemesterInfo = {
    semesterKey: 'akumulatif',
    label: 'Akumulatif Terbobot',
    bobotLabel: '100% (Resmi SNBP)',
    bobotPersen: 100,
    top1: top1Akum,
    top2: top2Akum,
    avgTop2: avgTop2Akum,
    hasScores: terbobotList.length > 0,
  };

  return {
    sem1: resultSemesters.sem1,
    sem2: resultSemesters.sem2,
    sem3: resultSemesters.sem3,
    sem4: resultSemesters.sem4,
    sem5: resultSemesters.sem5,
    akumulatif: akumulatifInfo,
    allSemesters: [
      resultSemesters.sem1,
      resultSemesters.sem2,
      resultSemesters.sem3,
      resultSemesters.sem4,
      resultSemesters.sem5,
      akumulatifInfo,
    ],
  };
}

// ==========================================
// 11. KESESUAIAN MAPEL RAPOR & TKA DENGAN PILIHAN SISWA (REALTIME)
// ==========================================
export interface KesesuaianMapelDetailItem {
  nama: string;
  adaDiRapor: boolean;
  nilaiRaporTerbobot: number;
  adaDiTKA: boolean;
  skorTKA_IRT: number;
  skorTKA_100: number;
  statusKesesuaian: 'Sangat Sesuai' | 'Sesuai' | 'Perlu Perhatian' | 'Belum Ada';
  gapRaporTKA: number;
}

export interface KesesuaianMapelPilihanItem {
  pilihan_ke: number;
  ptn: string;
  prodi: string;
  mapelPendukung: string[];
  detailMapel: KesesuaianMapelDetailItem[];
  indeksKesesuaian: number;
  statusKesesuaian: 'Sangat Selaras' | 'Selaras' | 'Cukup Selaras' | 'Kurang Selaras';
  catatanKesesuaian: string;
}

export function calcKesesuaianMapelRaporTKA(
  pilihanList: PilihanPTNSNBP[],
  nilaiRaporList: NilaiRapor[],
  tka: TKAData | null
): KesesuaianMapelPilihanItem[] {
  const { terbobotPerMapel } = calcRataRapor(nilaiRaporList);

  const tkaMapels: { mapel: string; irt: number; skala100: number }[] = [];
  if (tka) {
    if (tka.tka_indo) tkaMapels.push({ mapel: 'Bahasa Indonesia', irt: tka.tka_indo, skala100: convertIRTto100(tka.tka_indo) });
    if (tka.tka_ing) tkaMapels.push({ mapel: 'Bahasa Inggris', irt: tka.tka_ing, skala100: convertIRTto100(tka.tka_ing) });
    if (tka.tka_mat) tkaMapels.push({ mapel: 'Matematika', irt: tka.tka_mat, skala100: convertIRTto100(tka.tka_mat) });
    if (tka.mapel_pilihan1 && tka.nilai_tka1) {
      tkaMapels.push({ mapel: tka.mapel_pilihan1, irt: tka.nilai_tka1, skala100: convertIRTto100(tka.nilai_tka1) });
    }
    if (tka.mapel_pilihan2 && tka.nilai_tka2) {
      tkaMapels.push({ mapel: tka.mapel_pilihan2, irt: tka.nilai_tka2, skala100: convertIRTto100(tka.nilai_tka2) });
    }
  }

  return pilihanList.map((pil) => {
    const mapels = getMapelPendukungProdi(pil.prodi);
    const detailMapel: KesesuaianMapelDetailItem[] = mapels.map((mName) => {
      const raporMatch = terbobotPerMapel.find((r) => {
        const a = r.mapel.toLowerCase();
        const b = mName.toLowerCase();
        return a.includes(b) || b.includes(a);
      });
      const nilaiRaporTerbobot = raporMatch ? raporMatch.terbobot : 0;
      const adaDiRapor = nilaiRaporTerbobot > 0;

      const tkaMatch = tkaMapels.find((t) => {
        const a = t.mapel.toLowerCase();
        const b = mName.toLowerCase();
        return a.includes(b) || b.includes(a);
      });
      const skorTKA_IRT = tkaMatch ? tkaMatch.irt : 0;
      const skorTKA_100 = tkaMatch ? tkaMatch.skala100 : 0;
      const adaDiTKA = skorTKA_IRT > 0;

      const gapRaporTKA = adaDiRapor && adaDiTKA ? Number(Math.abs(skorTKA_100 - nilaiRaporTerbobot).toFixed(2)) : 0;

      let statusKesesuaian: 'Sangat Sesuai' | 'Sesuai' | 'Perlu Perhatian' | 'Belum Ada' = 'Belum Ada';
      if (adaDiRapor) {
        if (nilaiRaporTerbobot >= 88 && (!adaDiTKA || skorTKA_100 >= 72)) {
          statusKesesuaian = 'Sangat Sesuai';
        } else if (nilaiRaporTerbobot >= 80 && (!adaDiTKA || gapRaporTKA <= 15)) {
          statusKesesuaian = 'Sesuai';
        } else {
          statusKesesuaian = 'Perlu Perhatian';
        }
      }

      return {
        nama: mName,
        adaDiRapor,
        nilaiRaporTerbobot,
        adaDiTKA,
        skorTKA_IRT,
        skorTKA_100,
        statusKesesuaian,
        gapRaporTKA,
      };
    });

    let skorTotal = 0;
    detailMapel.forEach((dm) => {
      if (dm.adaDiRapor) {
        skorTotal += Math.min(dm.nilaiRaporTerbobot, 100) * 0.35;
      }
      if (dm.adaDiTKA) {
        skorTotal += Math.min(dm.skorTKA_100, 100) * 0.15;
      } else if (!tka || tkaMapels.length === 0) {
        if (dm.adaDiRapor) skorTotal += Math.min(dm.nilaiRaporTerbobot, 100) * 0.15;
      }
    });

    const indeksKesesuaian = Number(Math.min(100, Math.max(0, skorTotal)).toFixed(1));
    let statusKesesuaian: 'Sangat Selaras' | 'Selaras' | 'Cukup Selaras' | 'Kurang Selaras' = 'Kurang Selaras';
    let catatanKesesuaian = '';

    if (indeksKesesuaian >= 82) {
      statusKesesuaian = 'Sangat Selaras';
      catatanKesesuaian = `Mata pelajaran rapor dan kompetensi TKA sangat selaras dengan kebutuhan prodi ${pil.prodi}. Nilai mapel pendukung tinggi dan memperkuat peluang lolos.`;
    } else if (indeksKesesuaian >= 70) {
      statusKesesuaian = 'Selaras';
      catatanKesesuaian = `Mapel pendukung prodi ${pil.prodi} sudah terpenuhi di rapor dengan baik. Jaga kestabilan nilai di semester akhir.`;
    } else if (indeksKesesuaian >= 55) {
      statusKesesuaian = 'Cukup Selaras';
      catatanKesesuaian = `Ada mapel pendukung untuk ${pil.prodi} yang nilainya masih sedang atau terdapat selisih dengan TKA. Perlu penguatan khusus.`;
    } else {
      statusKesesuaian = 'Kurang Selaras';
      catatanKesesuaian = `Mapel pendukung utama prodi ${pil.prodi} belum optimal di rapor atau belum sejalan dengan peminatan TKA.`;
    }

    return {
      pilihan_ke: pil.pilihan_ke,
      ptn: pil.ptn,
      prodi: pil.prodi,
      mapelPendukung: mapels,
      detailMapel,
      indeksKesesuaian,
      statusKesesuaian,
      catatanKesesuaian,
    };
  });
}

// ==========================================
// 12. GENERATOR KESIMPULAN & STRATEGI SNBP
// ==========================================
export interface KesimpulanStrategiSNBPResult {
  kesimpulan: {
    statusKelayakan: string;
    kategoriPeluang: string;
    ringkasanRapor: string;
    kesesuaianMapelProdi: string;
    validasiTKA: string;
    dayaDukungSekolah: string;
    kesimpulanAkhir: string;
  };
  strategi: {
    judul: string;
    kategori: string;
    poinAksi: string[];
    prioritas: 'Tinggi' | 'Sedang' | 'Krusial';
  }[];
}

export function generateKesimpulanStrategiSNBP(
  peluang: ReturnType<typeof calcPeluangSNBP>,
  kesesuaianList: KesesuaianMapelPilihanItem[],
  siswa: Siswa,
  pilihanList: PilihanPTNSNBP[]
): KesimpulanStrategiSNBPResult {
  const isTinggi = peluang.peluang_total >= 70;
  const isSedang = peluang.peluang_total >= 50 && peluang.peluang_total < 70;
  const hasPilihan = pilihanList.length > 0;

  const pil1 = pilihanList.find((p) => p.pilihan_ke === 1);
  const pil2 = pilihanList.find((p) => p.pilihan_ke === 2);
  const pil1Kesesuaian = kesesuaianList.find((k) => k.pilihan_ke === 1);
  const pil2Kesesuaian = kesesuaianList.find((k) => k.pilihan_ke === 2);

  const statusKelayakan = isTinggi
    ? 'Sangat Layak & Kompetitif'
    : isSedang
    ? 'Cukup Kompetitif (Perlu Penyesuaian Strategis)'
    : 'Beresiko Tinggi (Memerlukan Pemilihan Alternatif Realistis)';

  const ringkasanRapor = `Rata-rata rapor terbobot akumulatif Anda berada di angka ${peluang.rata_rapor.toFixed(
    2
  )} (${peluang.rata_rapor >= 88 ? 'Sangat Unggul' : peluang.rata_rapor >= 82 ? 'Baik' : 'Cukup'}). Nilai ini menjadi modal utama seleksi SNBP 2027.`;

  let kesesuaianMapelProdi = 'Pilihan program studi belum ditentukan.';
  if (hasPilihan) {
    const listNames = pilihanList.map((p) => `${p.prodi} (${p.ptn})`).join(' dan ');
    const selarasAll = kesesuaianList.every((k) => k.statusKesesuaian === 'Sangat Selaras' || k.statusKesesuaian === 'Selaras');
    kesesuaianMapelProdi = selarasAll
      ? `Nilai mata pelajaran pendukung di rapor sangat sejalan dengan prodi pilihan (${listNames}). Persyaratan Kepmendikbudristek terpenuhi optimal.`
      : `Kesesuaian mapel pendukung dengan prodi pilihan (${listNames}) perlu diperhatikan pada mapel unggulan yang belum mencapai batas aman.`;
  }

  const validasiTKA = peluang.hasTKA
    ? `Hasil TKA IRT menunjukkan keselarasan dengan rata-rata gap ${peluang.total_gap.toFixed(
        1
      )} poin. Data rapor Anda terverifikasi kredibel oleh standar pengujian eksternal.`
    : 'Belum ada input nilai TKA. Memasukkan nilai TKA skala IRT dapat menambah poin validasi hingga +5 poin dan membuktikan integritas nilai rapor.';

  const dayaDukungSekolah = `Sekolah berakreditasi ${siswa.akreditasi || 'A'} dengan kontribusi prestasi ${
    peluang.skor_sertifikat
  } poin dan rekam jejak alumni (${peluang.skor_alumni_jurusan > 0 ? 'ada alumni di jurusan' : 'belum tercatat alumni'}).`;

  let kesimpulanAkhir = '';
  if (isTinggi) {
    kesimpulanAkhir = `Profil akademik Anda sangat kuat untuk bersaing di jalur SNBP 2027 dengan peluang total ${peluang.peluang_total}%. Peluang terbesar ada pada formasi pilihan yang sejalan dengan mapel unggulan rapor Anda.`;
  } else if (isSedang) {
    kesimpulanAkhir = `Peluang Anda berada di zona kompetitif (${peluang.peluang_total}%). Kelulusan sangat bergantung pada ketepatan memilih jenjang atau PTN pilihan 2 yang memiliki persaingan lebih realistis dan jaring pengaman seprovinsi.`;
  } else {
    kesimpulanAkhir = `Peluang total Anda saat ini ${peluang.peluang_total}%. Sangat disarankan untuk merasionalisasi pilihan prodi ke klaster/tier yang sesuai dengan capaian NRM rapor serta mempersiapkan jalur UTBK-SNBT secara intensif.`;
  }

  // Strategi Aksi
  const strategi = [
    {
      judul: 'Fokus Maksimal pada Semester 5 (Bobot 50%)',
      kategori: 'Akademik Rapor',
      prioritas: 'Krusial' as const,
      poinAksi: [
        'Semester 5 menyumbang 50% dari total formula bobot SNBP resmi.',
        hasPilihan && pil1Kesesuaian
          ? `Tingkatkan nilai mata pelajaran pendukung prodi ${pil1?.prodi} (${pil1Kesesuaian.mapelPendukung.join(', ')}) minimal mencapai 90+.`
          : 'Genjot nilai 2 mata pelajaran tertinggi untuk mempertahankan tren positif grafik rapor.',
        'Hindari penurunan nilai pada mata pelajaran wajib maupun peminatan.',
      ],
    },
    {
      judul: 'Optimasi Portofolio Prestasi & Validasi TKA',
      kategori: 'Penguat Skor',
      prioritas: 'Tinggi' as const,
      poinAksi: [
        peluang.skor_sertifikat < 20
          ? 'Unggah hingga 3 sertifikat kompetisi juara (minimal tingkat Kabupaten/Kota) yang linier dengan jurusan pilihan.'
          : 'Sertifikat prestasi Anda sudah maksimal (20/20 poin). Pastikan sertifikat legalisir siap saat verifikasi.',
        peluang.hasTKA
          ? 'Pertahankan konsistensi nilai TKA agar tidak terjadi diskrepansi (gap) dengan nilai rapor sekolah.'
          : 'Lakukan try out atau tes TKA untuk mengukur skala IRT mandiri agar hasil rasionalisasi semakin akurat.',
      ],
    },
    {
      judul: 'Taktik Formasi Pilihan 1 & Pilihan 2 SNBP',
      kategori: 'Strategi Pemilihan',
      prioritas: 'Tinggi' as const,
      poinAksi: [
        pil1 ? `Pilihan 1 (${pil1.prodi} - ${pil1.ptn}): Jadikan sebagai target impian terukur.` : 'Tentukan Pilihan 1 secara mantap sesuai minat dan bakat.',
        pil2
          ? `Pilihan 2 (${pil2.prodi} - ${pil2.ptn}): Pastikan NRM dan keketatan lebih longgar dibanding Pilihan 1 sebagai jaring pengaman.`
          : 'Gunakan Pilihan 2 untuk memilih prodi di PTN seprovinsi dengan sekolah asal untuk memenuhi aturan sebaran wilayah SNBP.',
        'Jangan memilih program studi yang sama persis di kedua pilihan untuk mendiversifikasi peluang.',
      ],
    },
    {
      judul: 'Rencana Cadangan: Persiapan Paralel UTBK-SNBT',
      kategori: 'Mitigasi Resiko',
      prioritas: 'Sedang' as const,
      poinAksi: [
        'SNBP memiliki kuota terbatas (rata-rata 20-30% per prodi), sehingga persaingan bersifat kuota sekolah.',
        'Mulai cicil latihan soal TPS (Tes Potensi Skolastik) dan Literasi Bahasa Indonesia/Inggris & Penalaran Matematika.',
        'Ikuti agenda Try Out SNBT berkala di bimbel/sekolah untuk memetakan skor UTBK riil.',
      ],
    },
  ];

  return {
    kesimpulan: {
      statusKelayakan,
      kategoriPeluang: peluang.label_total,
      ringkasanRapor,
      kesesuaianMapelProdi,
      validasiTKA,
      dayaDukungSekolah,
      kesimpulanAkhir,
    },
    strategi,
  };
}

// ==========================================
// 13. GENERATOR KESIMPULAN & STRATEGI SNBT
// ==========================================
export interface KesimpulanStrategiSNBTResult {
  kesimpulan: {
    statusCapaian: string;
    rataTertimbang: number;
    posisiTarget: string;
    evaluasiSubtesKunci: string;
    konsistensiTryOut: string;
    kesimpulanAkhir: string;
  };
  strategi: {
    judul: string;
    kategori: string;
    poinAksi: string[];
    prioritas: 'Tinggi' | 'Sedang' | 'Krusial';
  }[];
}

export function generateKesimpulanStrategiSNBT(
  stats: ReturnType<typeof calcStatistikSNBT>,
  pilihanDetail: any[],
  toList: TOData[]
): KesimpulanStrategiSNBTResult {
  const avg = stats.avgTert;
  const isAman = avg >= 680;
  const isKompetitif = avg >= 600 && avg < 680;

  const statusCapaian = isAman
    ? 'Sangat Kompetitif (Masuk Klaster Top PTN)'
    : isKompetitif
    ? 'Kompetitif (Memiliki Peluang Kuat di Kampus Unggulan)'
    : 'Memerlukan Peningkatan Terarah (Perlu Drill Subtes Lemah)';

  // Cari subtes terkuat dan terlemah
  const subtesEntries = Object.entries(stats.avgSubtes) as [keyof typeof SUBTES_NAMES, number][];
  const sortedSubtes = [...subtesEntries].sort((a, b) => b[1] - a[1]);
  const strongest = sortedSubtes[0];
  const weakest = sortedSubtes[sortedSubtes.length - 1];

  const strongestName = strongest ? `${strongest[0].toUpperCase()} (${strongest[1]})` : '-';
  const weakestName = weakest ? `${weakest[0].toUpperCase()} (${weakest[1]})` : '-';

  const evaluasiSubtesKunci = `Subtes terkuat Anda saat ini adalah ${strongestName}, sedangkan subtes yang paling membutuhkan dongkrak nilai adalah ${weakestName}.`;

  const konsistensiTryOut = `Telah mengikuti ${stats.validCount} dari 9 Try Out dengan tren capaian: ${stats.trendLabel}. Skor TPS (60%) rata-rata ${stats.avgTPS} dan Literasi (40%) rata-rata ${stats.avgLit}.`;

  let posisiTarget = 'Target pilihan kampus belum ditentukan.';
  if (pilihanDetail.length > 0) {
    const terpenuhi = pilihanDetail.filter((p) => p.ketercapaian.status === 'Aman' || p.ketercapaian.status === 'Sangat Aman');
    posisiTarget = `${terpenuhi.length} dari ${pilihanDetail.length} pilihan prodi berada di zona capaian aman berdasarkan skor rata-rata tertimbang Anda (${avg}).`;
  }

  let kesimpulanAkhir = '';
  if (isAman) {
    kesimpulanAkhir = `Skor rata-rata tertimbang Anda (${avg}) sudah berada di level elit nasional. Fokus utama adalah mempertahankan konsistensi kecepatan pengerjaan dan akurasi pada subtes penalaran matematis.`;
  } else if (isKompetitif) {
    kesimpulanAkhir = `Skor Anda (${avg}) sudah mencukupi untuk bersaing di mayoritas PTN Tier 2 dan Tier 3. Dengan mendongkrak subtes ${weakest ? weakest[0].toUpperCase() : 'terlemah'} sebesar +40 poin, peluang lolos pilihan 1 akan meningkat drastis.`;
  } else {
    kesimpulanAkhir = `Skor rata-rata tertimbang Anda saat ini (${avg}) memerlukan strategi intensif. Manfaatkan rasio 60:40 dengan mengunci skor tinggi pada subtes TPS dan rasionalisasi susunan 4 pilihan PTN SNBT.`;
  }

  const strategi = [
    {
      judul: `Drill Intensif Subtes ${weakest ? weakest[0].toUpperCase() : 'Terlemah'}`,
      kategori: 'Peningkatan Skor',
      prioritas: 'Krusial' as const,
      poinAksi: [
        `Subtes ${weakest ? weakest[0].toUpperCase() : 'terendah'} saat ini berada di skor ${weakest ? weakest[1] : 0}.`,
        'Luangkan minimal 45 menit setiap hari khusus untuk membedah tipe soal dan pola jebakan subtes ini.',
        'Targetkan peningkatan minimal +50 poin pada Try Out berikutnya.',
      ],
    },
    {
      judul: 'Maksimalkan Komponen TPS (Bobot 60%)',
      kategori: 'Taktik Formula 60:40',
      prioritas: 'Tinggi' as const,
      poinAksi: [
        'TPS (Penalaran Umum, PBM, PPU, dan Pemahaman Kuantitatif) memegang porsi 60% dalam kalkulasi akhir.',
        'Kunci akurasi tinggi pada PBM dan PPU dengan memperbanyak pemahaman kaidah PUEBI dan ejaan resmi.',
        'Pertahankan skor Penalaran Umum di atas 650 untuk mengamankan rata-rata nasional.',
      ],
    },
    {
      judul: 'Taktik Formasi 4 Pilihan UTBK-SNBT 2027',
      kategori: 'Strategi Pemilihan Kampus',
      prioritas: 'Tinggi' as const,
      poinAksi: [
        'Pilihan 1: Program studi impian tertinggi (Target NAM ambisius namun terukur).',
        'Pilihan 2: Program studi target kuat dengan NAM setara atau sedikit di bawah skor rata-rata TO Anda.',
        'Pilihan 3: Program studi alternatif aman (GAP skor positif minimal +20 poin).',
        'Pilihan 4: Program studi penjamin kelulusan (Disarankan Vokasi D4/D3 atau PTN regional terdekat).',
      ],
    },
    {
      judul: 'Simulasi Try Out dengan Batasan Waktu Asli',
      kategori: 'Manajemen Ujian',
      prioritas: 'Sedang' as const,
      poinAksi: [
        'Lakukan Try Out dengan sistem timer ketat per subtes tanpa jeda interupsi.',
        'Terapkan teknik skimming teks panjang pada Literasi Bahasa Indonesia dan Bahasa Inggris.',
        'Evaluasi lembar pembahasan setiap usai Try Out dan buat catatan rumus ringkas.',
      ],
    },
  ];

  return {
    kesimpulan: {
      statusCapaian,
      rataTertimbang: avg,
      posisiTarget,
      evaluasiSubtesKunci,
      konsistensiTryOut,
      kesimpulanAkhir,
    },
    strategi,
  };
}

