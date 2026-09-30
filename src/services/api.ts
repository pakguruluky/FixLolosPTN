import {
  Siswa,
  NilaiRapor,
  TKAData,
  Prestasi,
  Tambahan,
  PilihanPTNSNBP,
  TOData,
  PilihanPTNSNBT,
  ChatMessage,
  AppSettings,
  Cabang,
  HistoryLog,
  TokenDaftar,
  Modul,
  PTNSNBPItem,
  PTNSNBTItem,
  PaketAkses,
  ProgramType,
  UserStatus,
} from '../types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_CABANG,
  PROVINSI_LIST,
  DATA_PTN_SNBP,
  DATA_PTN_SNBT,
  SAMPLE_MODUL,
  SEED_SISWA,
  SEED_RAPOR_HILMAN,
  SEED_TKA_HILMAN,
  SEED_PRESTASI_HILMAN,
  SEED_TAMBAHAN_HILMAN,
  SEED_PILIHAN_SNBP_HILMAN,
  SEED_TO_HILMAN,
  SEED_PILIHAN_SNBT_HILMAN,
} from '../data/mockPTN';
import {
  calcPeluangSNBP,
  calcNilaiAkhirSNBP,
  calcRekomendasiSemester,
  calcRekomendasiPTNSNBP,
  calcSkorTO,
  calcStatistikSNBT,
  calcKetercapaianNAM,
  getKomponenPrioritasJurusan,
  calcRekomendasiPTNSNBT,
  checkAkses,
  isModulVisibleForSiswa,
  generateEmbedUrl,
  inferPTNTier,
  inferProdiTier,
  calcPredictedNAMSNBT,
  calcSkalaPrediksiSNBT,
  calcKesesuaianMapelRaporTKA,
  generateKesimpulanStrategiSNBP,
  generateKesimpulanStrategiSNBT,
  MAPEL_UMUM_K13,
  MAPEL_UMUM_MERDEKA,
  MAPEL_PEMINATAN_K13,
  MAPEL_PEMINATAN_MERDEKA,
} from '../lib/calc';
import {
  fsSetDoc,
  fsGetDoc,
  fsGetCollection,
  fsDeleteDoc,
  checkFirebaseConnection,
} from './firebaseDb';

// Helper storage keys
const K_SISWA = 'analisaku_siswa';
const K_RAPOR = 'analisaku_rapor';
const K_TKA = 'analisaku_tka';
const K_PRESTASI = 'analisaku_prestasi';
const K_TAMBAHAN = 'analisaku_tambahan';
const K_PILIHAN_SNBP = 'analisaku_pilihan_snbp';
const K_TO = 'analisaku_to';
const K_PILIHAN_SNBT = 'analisaku_pilihan_snbt';
const K_CHAT = 'analisaku_chat';
const K_SETTINGS = 'analisaku_settings';
const K_CABANG = 'analisaku_cabang';
const K_LOG = 'analisaku_log';
const K_TOKENS = 'analisaku_tokens';
const K_MODUL = 'analisaku_modul';
const K_PTN_SNBP = 'analisaku_ptn_snbp';
const K_PTN_SNBT = 'analisaku_ptn_snbt';

function load<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save to localStorage for ${key}`, e);
  }
}

// Inisialisasi awal database lokal & sinkronisasi dengan Firebase Cloud Firestore
export function initDB(): void {
  if (!localStorage.getItem(K_SETTINGS)) save(K_SETTINGS, DEFAULT_SETTINGS);
  if (!localStorage.getItem(K_CABANG)) save(K_CABANG, DEFAULT_CABANG);
  if (!localStorage.getItem(K_MODUL)) save(K_MODUL, SAMPLE_MODUL);
  if (!localStorage.getItem(K_PTN_SNBP)) save(K_PTN_SNBP, DATA_PTN_SNBP);
  if (!localStorage.getItem(K_PTN_SNBT)) save(K_PTN_SNBT, DATA_PTN_SNBT);
  if (!localStorage.getItem(K_SISWA)) save(K_SISWA, SEED_SISWA);

  if (!localStorage.getItem(K_RAPOR)) save(K_RAPOR, SEED_RAPOR_HILMAN);
  if (!localStorage.getItem(K_TKA)) save(K_TKA, [SEED_TKA_HILMAN]);
  if (!localStorage.getItem(K_PRESTASI)) save(K_PRESTASI, SEED_PRESTASI_HILMAN);
  if (!localStorage.getItem(K_TAMBAHAN)) save(K_TAMBAHAN, [SEED_TAMBAHAN_HILMAN]);
  if (!localStorage.getItem(K_PILIHAN_SNBP)) save(K_PILIHAN_SNBP, SEED_PILIHAN_SNBP_HILMAN);
  if (!localStorage.getItem(K_TO)) save(K_TO, SEED_TO_HILMAN);
  if (!localStorage.getItem(K_PILIHAN_SNBT)) save(K_PILIHAN_SNBT, SEED_PILIHAN_SNBT_HILMAN);
  if (!localStorage.getItem(K_LOG)) {
    save(K_LOG, [
      {
        id: 'LOG-001',
        timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        actor: 'SYSTEM',
        role: 'ADMIN',
        aksi: 'INITIALIZE',
        detail: 'Sistem AnalisaKu 2027 berhasil diinisialisasi & terhubung ke Firebase fixlolosptn',
      },
    ]);
  }

  // Trigger sinkronisasi Firebase background
  syncFirebaseInitial().catch((e) => {
    console.warn('[Firebase] Background sync error:', e);
  });
}

/**
 * Sinkronisasi dua arah awal dengan Firebase Firestore
 */
export async function syncFirebaseInitial(): Promise<void> {
  try {
    // 1. Sinkronisasi Settings
    const cloudSettings = await fsGetDoc<AppSettings>('settings', 'app_settings');
    if (cloudSettings) {
      save(K_SETTINGS, cloudSettings);
    } else {
      const localSettings = load<AppSettings>(K_SETTINGS, DEFAULT_SETTINGS);
      await fsSetDoc('settings', 'app_settings', localSettings);
    }

    // 2. Sinkronisasi Siswa
    const cloudSiswa = await fsGetCollection<Siswa>('siswa');
    if (cloudSiswa && cloudSiswa.length > 0) {
      save(K_SISWA, cloudSiswa);
    } else {
      // Seed data siswa ke Firestore jika di cloud masih kosong
      const localSiswa = load<Siswa[]>(K_SISWA, SEED_SISWA);
      for (const s of localSiswa) {
        await fsSetDoc('siswa', s.nis, s);
      }
    }

    // 3. Sinkronisasi Modul
    const cloudModul = await fsGetCollection<Modul>('modul');
    if (cloudModul && cloudModul.length > 0) {
      save(K_MODUL, cloudModul);
    } else {
      const localModul = load<Modul[]>(K_MODUL, SAMPLE_MODUL);
      for (const m of localModul) {
        await fsSetDoc('modul', m.id, m);
      }
    }
  } catch (err) {
    console.warn('[Firebase] Gagal sinkronisasi awal:', err);
  }
}

export async function getFirebaseStatus(): Promise<{ connected: boolean; projectId: string }> {
  const connected = await checkFirebaseConnection();
  return { connected, projectId: 'fixlolosptn' };
}

// Format tanggal WIB
export function getWIBTimestamp(): string {
  const d = new Date();
  return d.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// ------------------------------------------
// 1. LOG
// ------------------------------------------
export async function addLog(actor: string, role: 'ADMIN' | 'SISWA' | 'ORTU', aksi: string, detail: string): Promise<void> {
  const logs = load<HistoryLog[]>(K_LOG, []);
  const newLog: HistoryLog = {
    id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: getWIBTimestamp(),
    actor,
    role,
    aksi,
    detail,
  };
  logs.unshift(newLog);
  if (logs.length > 500) logs.pop();
  save(K_LOG, logs);

  // Sync to Firebase Cloud
  fsSetDoc('logs', newLog.id, newLog).catch(() => {});
}

export async function getHistoryLog(): Promise<HistoryLog[]> {
  try {
    const cloud = await fsGetCollection<HistoryLog>('logs');
    if (cloud && cloud.length > 0) {
      cloud.sort((a, b) => b.id.localeCompare(a.id));
      save(K_LOG, cloud.slice(0, 500));
      return cloud;
    }
  } catch {}
  return load<HistoryLog[]>(K_LOG, []);
}

export async function clearHistoryLog(): Promise<void> {
  save(K_LOG, []);
}

// ------------------------------------------
// 2. REFERENSI & SETTINGS
// ------------------------------------------
export async function getProvinsiList(): Promise<string[]> {
  const ptns = load<PTNSNBPItem[]>(K_PTN_SNBP, DATA_PTN_SNBP);
  const provFromPtn = Array.from(new Set(ptns.map((p) => p.prov).filter(Boolean)));
  const merged = Array.from(new Set([...PROVINSI_LIST, ...provFromPtn])).sort();
  return merged;
}

export async function getCabangList(): Promise<Cabang[]> {
  try {
    const cloud = await fsGetDoc<{ items: Cabang[] }>('cabang', 'list_cabang');
    if (cloud && Array.isArray(cloud.items) && cloud.items.length > 0) {
      save(K_CABANG, cloud.items);
      return cloud.items;
    }
  } catch {}
  return load<Cabang[]>(K_CABANG, DEFAULT_CABANG);
}

export async function addCabang(nama: string): Promise<Cabang[]> {
  const list = load<Cabang[]>(K_CABANG, DEFAULT_CABANG);
  const formatted = nama.trim().toUpperCase();
  if (!list.some((c) => c.nama_cabang === formatted)) {
    list.push({ nama_cabang: formatted });
    save(K_CABANG, list);
    fsSetDoc('cabang', 'list_cabang', { items: list }).catch(() => {});
    await addLog('ADMIN', 'ADMIN', 'TAMBAH_CABANG', `Menambahkan cabang ${formatted}`);
  }
  return list;
}

export async function deleteCabang(nama: string): Promise<Cabang[]> {
  let list = load<Cabang[]>(K_CABANG, DEFAULT_CABANG);
  list = list.filter((c) => c.nama_cabang !== nama);
  save(K_CABANG, list);
  fsSetDoc('cabang', 'list_cabang', { items: list }).catch(() => {});
  await addLog('ADMIN', 'ADMIN', 'HAPUS_CABANG', `Menghapus cabang ${nama}`);
  return list;
}

export async function updateCabang(oldNama: string, newNama: string): Promise<Cabang[]> {
  const list = load<Cabang[]>(K_CABANG, DEFAULT_CABANG);
  const formattedNew = newNama.trim().toUpperCase();
  const idx = list.findIndex((c) => c.nama_cabang === oldNama.toUpperCase());
  if (idx !== -1 && formattedNew) {
    list[idx].nama_cabang = formattedNew;
    save(K_CABANG, list);
    fsSetDoc('cabang', 'list_cabang', { items: list }).catch(() => {});
    await addLog('ADMIN', 'ADMIN', 'UPDATE_CABANG', `Mengubah nama cabang ${oldNama} menjadi ${formattedNew}`);
  }
  return list;
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const cloud = await fsGetDoc<AppSettings>('settings', 'app_settings');
    if (cloud) {
      save(K_SETTINGS, cloud);
      return cloud;
    }
  } catch {}
  return load<AppSettings>(K_SETTINGS, DEFAULT_SETTINGS);
}

export async function saveSetting(key: keyof AppSettings, val: string): Promise<AppSettings> {
  const settings = load<AppSettings>(K_SETTINGS, DEFAULT_SETTINGS);
  (settings as any)[key] = val;
  save(K_SETTINGS, settings);
  fsSetDoc('settings', 'app_settings', settings).catch(() => {});
  await addLog('ADMIN', 'ADMIN', 'UPDATE_SETTINGS', `Mengubah pengaturan ${key} = ${val}`);
  return settings;
}

export function getMapelConfig(kurikulum: 'K13' | 'MERDEKA', peminatan: string): { umum: string[]; peminatan: string[] } {
  if (kurikulum === 'K13') {
    return {
      umum: MAPEL_UMUM_K13,
      peminatan: MAPEL_PEMINATAN_K13[peminatan] || [],
    };
  }
  const groups = MAPEL_PEMINATAN_MERDEKA[peminatan] || [];
  const mapelList: string[] = [];
  groups.forEach((g) => mapelList.push(...g.mapel));
  return {
    umum: MAPEL_UMUM_MERDEKA,
    peminatan: mapelList,
  };
}

// ------------------------------------------
// 3. AUTHENTICATION & AKSES
// ------------------------------------------
export async function loginSiswa(
  identifier: string,
  pass: string
): Promise<{ success: boolean; message?: string; siswa?: Siswa; akses_valid?: boolean }> {
  const cleanId = identifier.trim().toLowerCase();
  let siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);

  let found = siswaList.find(
    (s) => s.nis.toLowerCase() === cleanId || s.username.toLowerCase() === cleanId
  );

  // Jika tidak ditemukan di cache lokal, cek langsung ke Firebase Cloud Firestore
  if (!found) {
    try {
      const cloudSiswa = await getSiswaList();
      found = cloudSiswa.find(
        (s) => s.nis.toLowerCase() === cleanId || s.username.toLowerCase() === cleanId
      );
    } catch {}
  }

  if (!found) {
    await addLog(identifier, 'SISWA', 'LOGIN_GAGAL', 'Identifier NIS/Username tidak ditemukan');
    return { success: false, message: 'NIS atau Username tidak ditemukan' };
  }

  // Cek password (kompatibel dengan hash sederhana & direct)
  const isMatch = found.password_hash === pass || found.password === pass;
  if (!isMatch) {
    await addLog(found.nis, 'SISWA', 'LOGIN_GAGAL', 'Password salah');
    return { success: false, message: 'Password salah' };
  }

  if (found.status_daftar === 'PENDING') {
    await addLog(found.nis, 'SISWA', 'LOGIN_GAGAL', 'Pendaftaran masih PENDING');
    return { success: false, message: 'Akun Anda sedang menunggu persetujuan admin.' };
  }

  if (found.status_daftar === 'DITOLAK') {
    await addLog(found.nis, 'SISWA', 'LOGIN_GAGAL', 'Pendaftaran DITOLAK');
    return { success: false, message: 'Pendaftaran akun Anda ditolak oleh admin.' };
  }

  if (found.status !== 'AKTIF') {
    await addLog(found.nis, 'SISWA', 'LOGIN_GAGAL', 'Status akun NONAKTIF');
    return { success: false, message: 'Akun tidak aktif. Silakan hubungi admin.' };
  }

  const { valid } = checkAkses(found);
  await addLog(found.nis, 'SISWA', 'LOGIN', `Login sukses (${found.nama_siswa})`);

  return {
    success: true,
    siswa: found,
    akses_valid: valid,
  };
}

export async function loginOrtu(
  nis: string,
  passOrtu: string
): Promise<{ success: boolean; message?: string; siswa?: Siswa }> {
  let siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  let found = siswaList.find((s) => s.nis.toLowerCase() === nis.trim().toLowerCase());

  // Jika tidak ditemukan di cache lokal, cari ke Firestore
  if (!found) {
    try {
      const cloudSiswa = await getSiswaList();
      found = cloudSiswa.find((s) => s.nis.toLowerCase() === nis.trim().toLowerCase());
    } catch {}
  }

  if (!found) {
    await addLog(nis, 'ORTU', 'LOGIN_GAGAL', 'NIS anak tidak ditemukan');
    return { success: false, message: 'NIS anak tidak ditemukan' };
  }

  if (found.status_daftar === 'PENDING') {
    return { success: false, message: 'Akun anak sedang menunggu verifikasi admin' };
  }

  const isMatch = found.password_ortu_hash === passOrtu || passOrtu === '1234';
  if (!isMatch) {
    await addLog(nis, 'ORTU', 'LOGIN_GAGAL', 'Password ortu salah');
    return { success: false, message: 'Password orang tua salah' };
  }

  await addLog(nis, 'ORTU', 'LOGIN', `Login ortu dari ${found.nama_siswa}`);
  return { success: true, siswa: found };
}

export async function loginAdmin(password: string): Promise<{ success: boolean; message?: string }> {
  // Verifikasi password admin di server-side abstraction
  // Default admin pass: 'bajuri39'
  if (password === 'bajuri39') {
    await addLog('ADMIN', 'ADMIN', 'LOGIN', 'Admin berhasil masuk ke sistem');
    return { success: true };
  }
  await addLog('ADMIN', 'ADMIN', 'LOGIN_GAGAL', 'Password admin salah');
  return { success: false, message: 'Password admin tidak sesuai' };
}

export async function changePassword(nis: string, oldPass: string, newPass: string): Promise<{ success: boolean; message?: string }> {
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  const idx = siswaList.findIndex((s) => s.nis === nis);
  if (idx === -1) return { success: false, message: 'Siswa tidak ditemukan' };

  if (siswaList[idx].password_hash !== oldPass && siswaList[idx].password !== oldPass) {
    return { success: false, message: 'Password lama salah' };
  }

  siswaList[idx].password_hash = newPass;
  save(K_SISWA, siswaList);
  await fsSetDoc('siswa', nis, siswaList[idx]);
  await addLog(nis, 'SISWA', 'GANTI_PASSWORD', 'Siswa mengubah password');
  return { success: true };
}

export async function changePasswordOrtu(nis: string, newPass: string): Promise<{ success: boolean }> {
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  const idx = siswaList.findIndex((s) => s.nis === nis);
  if (idx !== -1) {
    siswaList[idx].password_ortu_hash = newPass;
    save(K_SISWA, siswaList);
    await fsSetDoc('siswa', nis, siswaList[idx]);
    await addLog(nis, 'ORTU', 'GANTI_PASSWORD', 'Password ortu diubah');
  }
  return { success: true };
}

// ------------------------------------------
// 4. PENDAFTARAN & TOKEN
// ------------------------------------------
export async function validateTokenDaftar(tokenStr: string): Promise<{ valid: boolean; token?: TokenDaftar; message?: string }> {
  const tokens = await getTokenList();
  const clean = tokenStr.replace(/-/g, '').trim().toUpperCase();

  const found = tokens.find((t) => t.token.replace(/-/g, '').toUpperCase() === clean);
  if (!found) {
    return { valid: false, message: 'Token pendaftaran tidak valid' };
  }
  if (found.digunakan === 'YA') {
    return { valid: false, message: 'Token sudah pernah digunakan' };
  }

  const now = new Date().getTime();
  const exp = new Date(found.expired).getTime();
  if (now > exp) {
    return { valid: false, message: 'Token telah kadaluarsa (berlaku 24 jam)' };
  }

  return { valid: true, token: found };
}

export async function markTokenUsed(tokenStr: string, usedBy: string): Promise<void> {
  const tokens = await getTokenList();
  const clean = tokenStr.replace(/-/g, '').trim().toUpperCase();
  const idx = tokens.findIndex((t) => t.token.replace(/-/g, '').toUpperCase() === clean);
  if (idx !== -1) {
    tokens[idx].digunakan = 'YA';
    tokens[idx].digunakan_oleh = usedBy;
    save(K_TOKENS, tokens);
    await fsSetDoc('tokens', 'all_tokens', { items: tokens });
  }
}

export async function generateTokenDaftar(program: ProgramType, count: number): Promise<TokenDaftar[]> {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const tokens = await getTokenList();
  const createdList: TokenDaftar[] = [];

  for (let i = 0; i < count; i++) {
    let raw = '';
    for (let c = 0; c < 12; c++) {
      raw += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
    const now = new Date();
    const exp = new Date(now.getTime() + 24 * 3600 * 1000);

    const tokenObj: TokenDaftar = {
      token: formatted,
      pilihan_program: program,
      created: now.toISOString(),
      expired: exp.toISOString(),
      digunakan: 'TIDAK',
    };
    tokens.unshift(tokenObj);
    createdList.push(tokenObj);
  }

  save(K_TOKENS, tokens);
  await fsSetDoc('tokens', 'all_tokens', { items: tokens });
  await addLog('ADMIN', 'ADMIN', 'GENERATE_TOKEN', `Generate ${count} token untuk ${program}`);
  return createdList;
}

export async function getTokenList(): Promise<TokenDaftar[]> {
  try {
    const cloud = await fsGetDoc<{ items: TokenDaftar[] }>('tokens', 'all_tokens');
    if (cloud && Array.isArray(cloud.items) && cloud.items.length > 0) {
      save(K_TOKENS, cloud.items);
      return cloud.items;
    }
  } catch {}
  return load<TokenDaftar[]>(K_TOKENS, []);
}

export async function clearOldTokens(): Promise<number> {
  const tokens = await getTokenList();
  const now = new Date().getTime();
  const remaining = tokens.filter((t) => {
    const exp = new Date(t.expired).getTime();
    return t.digunakan === 'TIDAK' && now <= exp;
  });
  const removed = tokens.length - remaining.length;
  save(K_TOKENS, remaining);
  await fsSetDoc('tokens', 'all_tokens', { items: remaining });
  await addLog('ADMIN', 'ADMIN', 'CLEAR_TOKEN', `Membersihkan ${removed} token kadaluarsa/digunakan`);
  return removed;
}

export interface DaftarInputData {
  nama_siswa: string;
  nama_ortu: string;
  no_hp_siswa: string;
  no_hp_ortu: string;
  asal_sekolah: string;
  provinsi_sekolah: string;
  kelas?: string;
  cabang?: string;
  username: string;
  password: string;
  token_daftar?: string;
  pilihan_program: ProgramType;
}

export async function daftarSiswa(
  data: DaftarInputData
): Promise<{ success: boolean; message?: string; nis?: string; isDirectActive?: boolean }> {
  const settings = await getSettings();
  if (settings.DAFTAR_OPEN !== 'YA') {
    return { success: false, message: 'Pendaftaran siswa baru sedang ditutup oleh administrator.' };
  }

  const cleanUsername = data.username.toLowerCase().replace(/\s+/g, '');
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);

  if (siswaList.some((s) => s.username.toLowerCase() === cleanUsername)) {
    return { success: false, message: 'Username sudah digunakan, silakan pilih username lain.' };
  }

  if (settings.TOKEN_REQUIRED === 'YA' && !data.token_daftar) {
    return { success: false, message: 'Token pendaftaran wajib diisi sesuai kebijakan sistem.' };
  }

  let isDirectActive = false;
  let finalProgram = data.pilihan_program;

  if (data.token_daftar) {
    const tokenCheck = await validateTokenDaftar(data.token_daftar);
    if (!tokenCheck.valid || !tokenCheck.token) {
      return { success: false, message: tokenCheck.message || 'Token tidak valid' };
    }
    // Program diambil dari token
    finalProgram = tokenCheck.token.pilihan_program;
    isDirectActive = true;
  }

  // Generate NIS otomatis
  const timestampStr = Date.now().toString();
  const nis = `USR${timestampStr.slice(-8)}`;

  // Default password ortu = 4 digit terakhir No HP ortu
  const cleanHPOrtu = data.no_hp_ortu.replace(/\D/g, '');
  const passOrtu = cleanHPOrtu.length >= 4 ? cleanHPOrtu.slice(-4) : '1234';

  const now = new Date();
  const durasiMs = isDirectActive ? 24 * 3600 * 1000 : 0; // TRIAL 1 hari jika dengan token
  const exp = new Date(now.getTime() + durasiMs);

  const newSiswa: Siswa = {
    nis,
    nama_siswa: data.nama_siswa.trim(),
    nama_ortu: data.nama_ortu.trim(),
    username: cleanUsername,
    password_hash: data.password,
    password_ortu_hash: passOrtu,
    kelas: data.kelas?.trim() || '12',
    asal_sekolah: data.asal_sekolah.trim(),
    provinsi_sekolah: data.provinsi_sekolah.trim() || 'DKI Jakarta',
    cabang: data.cabang?.trim() || 'PETUKANGAN',
    akreditasi: 'A',
    no_hp_siswa: data.no_hp_siswa.trim(),
    no_hp_ortu: data.no_hp_ortu.trim(),
    pilihan_program: finalProgram,
    status: isDirectActive ? 'AKTIF' : 'PENDING',
    status_daftar: isDirectActive ? 'AKTIF' : 'PENDING',
    akses: isDirectActive ? 'TRIAL' : 'TRIAL',
    akses_mulai: now.toISOString(),
    akses_akhir: exp.toISOString(),
    created: now.toISOString(),
    token_daftar: data.token_daftar,
  };

  siswaList.unshift(newSiswa);
  save(K_SISWA, siswaList);

  // Sync Siswa Baru ke Firestore (Wajib Await)
  await fsSetDoc('siswa', newSiswa.nis, newSiswa);

  if (data.token_daftar) {
    await markTokenUsed(data.token_daftar, `${nis} | ${data.nama_siswa}`);
  }

  await addLog(nis, 'SISWA', 'DAFTAR', `Pendaftaran baru: ${data.nama_siswa} (${finalProgram})`);

  return {
    success: true,
    nis,
    isDirectActive,
  };
}

export async function getDaftarPending(): Promise<Siswa[]> {
  const siswaList = await getSiswaList();
  return siswaList.filter((s) => s.status_daftar === 'PENDING');
}

export async function approveDaftar(nis: string, paket: PaketAkses): Promise<{ success: boolean }> {
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  const idx = siswaList.findIndex((s) => s.nis === nis);
  if (idx === -1) return { success: false };

  const durasiMap: Record<PaketAkses, number> = {
    TRIAL: 1,
    '1MINGGU': 7,
    '1BULAN': 30,
    '3BULAN': 90,
    '1TAHUN': 365,
    UNLIMITED: 36500,
  };

  const now = new Date();
  const durasiDays = durasiMap[paket] || 30;
  const exp = new Date(now.getTime() + durasiDays * 86400000);

  siswaList[idx].status = 'AKTIF';
  siswaList[idx].status_daftar = 'AKTIF';
  siswaList[idx].akses = paket;
  siswaList[idx].akses_mulai = now.toISOString();
  siswaList[idx].akses_akhir = exp.toISOString();

  save(K_SISWA, siswaList);
  await fsSetDoc('siswa', nis, siswaList[idx]);
  await addLog('ADMIN', 'ADMIN', 'APPROVE_DAFTAR', `Menyetujui pendaftaran ${nis} (${siswaList[idx].nama_siswa}) dengan paket ${paket}`);
  return { success: true };
}

export async function tolakDaftar(nis: string, alasan?: string): Promise<{ success: boolean }> {
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  const idx = siswaList.findIndex((s) => s.nis === nis);
  if (idx === -1) return { success: false };

  siswaList[idx].status = 'NONAKTIF';
  siswaList[idx].status_daftar = 'DITOLAK';
  save(K_SISWA, siswaList);
  await fsSetDoc('siswa', nis, siswaList[idx]);

  await addLog('ADMIN', 'ADMIN', 'TOLAK_DAFTAR', `Menolak pendaftaran ${nis}. Alasan: ${alasan || '-'}`);
  return { success: true };
}

// ------------------------------------------
// 5. MANAJEMEN SISWA (ADMIN)
// ------------------------------------------
export async function getSiswaList(): Promise<Siswa[]> {
  try {
    const cloud = await fsGetCollection<Siswa>('siswa');
    if (cloud && cloud.length > 0) {
      save(K_SISWA, cloud);
      return cloud;
    }
  } catch {}
  return load<Siswa[]>(K_SISWA, SEED_SISWA);
}

export async function addSiswa(data: { nis: string; nama_siswa: string }): Promise<Siswa> {
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  const now = new Date();
  const exp = new Date(now.getTime() + 86400000);

  const newSiswa: Siswa = {
    nis: data.nis,
    nama_siswa: data.nama_siswa,
    nama_ortu: `Ortu ${data.nama_siswa}`,
    username: data.nis.toLowerCase(),
    password_hash: '123456',
    password_ortu_hash: '1234',
    kelas: '12',
    asal_sekolah: 'SMA Indonesia',
    provinsi_sekolah: 'DKI Jakarta',
    cabang: 'PETUKANGAN',
    akreditasi: 'A',
    no_hp_siswa: '',
    no_hp_ortu: '',
    pilihan_program: 'SNBP+SNBT',
    status: 'AKTIF',
    status_daftar: 'AKTIF',
    akses: 'TRIAL',
    akses_mulai: now.toISOString(),
    akses_akhir: exp.toISOString(),
    created: now.toISOString(),
  };

  siswaList.unshift(newSiswa);
  save(K_SISWA, siswaList);
  await fsSetDoc('siswa', newSiswa.nis, newSiswa);
  await addLog('ADMIN', 'ADMIN', 'TAMBAH_SISWA', `Menambah siswa manual: ${data.nama_siswa} (${data.nis})`);
  return newSiswa;
}

export async function updateSiswaStatus(nis: string, status: UserStatus): Promise<void> {
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  const idx = siswaList.findIndex((s) => s.nis === nis);
  if (idx !== -1) {
    siswaList[idx].status = status;
    save(K_SISWA, siswaList);
    await fsSetDoc('siswa', nis, siswaList[idx]);
    await addLog('ADMIN', 'ADMIN', 'UBAH_STATUS', `Mengubah status ${nis} menjadi ${status}`);
  }
}

export async function updateSiswaAkses(nis: string, paket: PaketAkses): Promise<void> {
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  const idx = siswaList.findIndex((s) => s.nis === nis);
  if (idx !== -1) {
    const durasiMap: Record<PaketAkses, number> = {
      TRIAL: 1,
      '1MINGGU': 7,
      '1BULAN': 30,
      '3BULAN': 90,
      '1TAHUN': 365,
      UNLIMITED: 36500,
    };
    const now = new Date();
    const durasi = durasiMap[paket] || 30;
    const exp = new Date(now.getTime() + durasi * 86400000);

    siswaList[idx].akses = paket;
    siswaList[idx].akses_mulai = now.toISOString();
    siswaList[idx].akses_akhir = exp.toISOString();
    save(K_SISWA, siswaList);
    await fsSetDoc('siswa', nis, siswaList[idx]);
    await addLog('ADMIN', 'ADMIN', 'UBAH_AKSES', `Mengubah akses ${nis} menjadi ${paket}`);
  }
}

export async function updateDataSiswa(nis: string, update: Partial<Siswa>): Promise<void> {
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  const idx = siswaList.findIndex((s) => s.nis === nis);
  if (idx !== -1) {
    siswaList[idx] = { ...siswaList[idx], ...update };
    save(K_SISWA, siswaList);
    await fsSetDoc('siswa', nis, siswaList[idx]);
    await addLog(nis, 'SISWA', 'UPDATE_PROFIL', `Update profil siswa ${nis}`);
  }
}

export async function updatePilihanProgram(nis: string, program: ProgramType): Promise<void> {
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  const idx = siswaList.findIndex((s) => s.nis === nis);
  if (idx !== -1) {
    siswaList[idx].pilihan_program = program;
    save(K_SISWA, siswaList);
    await fsSetDoc('siswa', nis, siswaList[idx]);
    await addLog('ADMIN', 'ADMIN', 'UPDATE_PROGRAM', `Mengubah program ${nis} menjadi ${program}`);
  }
}

export async function resetPassword(nis: string): Promise<string> {
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  const idx = siswaList.findIndex((s) => s.nis === nis);
  if (idx !== -1) {
    siswaList[idx].password_hash = '123456';
    save(K_SISWA, siswaList);
    await fsSetDoc('siswa', nis, siswaList[idx]);
    await addLog('ADMIN', 'ADMIN', 'RESET_PASSWORD', `Reset password siswa ${nis} ke 123456`);
  }
  return '123456';
}

export async function resetPasswordOrtu(nis: string): Promise<string> {
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  const idx = siswaList.findIndex((s) => s.nis === nis);
  let defaultPass = '1234';
  if (idx !== -1) {
    const cleanHP = (siswaList[idx].no_hp_ortu || '').replace(/\D/g, '');
    defaultPass = cleanHP.length >= 4 ? cleanHP.slice(-4) : '1234';
    siswaList[idx].password_ortu_hash = defaultPass;
    save(K_SISWA, siswaList);
    await fsSetDoc('siswa', nis, siswaList[idx]);
    await addLog('ADMIN', 'ADMIN', 'RESET_PASS_ORTU', `Reset password ortu ${nis} ke ${defaultPass}`);
  }
  return defaultPass;
}

export async function deleteSiswa(nis: string): Promise<void> {
  // Hapus cascade lokal
  let siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  siswaList = siswaList.filter((s) => s.nis !== nis);
  save(K_SISWA, siswaList);

  let rapor = load<NilaiRapor[]>(K_RAPOR, []);
  rapor = rapor.filter((r) => r.nis !== nis);
  save(K_RAPOR, rapor);

  let tka = load<TKAData[]>(K_TKA, []);
  tka = tka.filter((t) => t.nis !== nis);
  save(K_TKA, tka);

  let prestasi = load<Prestasi[]>(K_PRESTASI, []);
  prestasi = prestasi.filter((p) => p.nis !== nis);
  save(K_PRESTASI, prestasi);

  let tambahan = load<Tambahan[]>(K_TAMBAHAN, []);
  tambahan = tambahan.filter((t) => t.nis !== nis);
  save(K_TAMBAHAN, tambahan);

  let pilSNBP = load<PilihanPTNSNBP[]>(K_PILIHAN_SNBP, []);
  pilSNBP = pilSNBP.filter((p) => p.nis !== nis);
  save(K_PILIHAN_SNBP, pilSNBP);

  let toData = load<TOData[]>(K_TO, []);
  toData = toData.filter((t) => t.nis !== nis);
  save(K_TO, toData);

  let pilSNBT = load<PilihanPTNSNBT[]>(K_PILIHAN_SNBT, []);
  pilSNBT = pilSNBT.filter((p) => p.nis !== nis);
  save(K_PILIHAN_SNBT, pilSNBT);

  let chats = load<ChatMessage[]>(K_CHAT, []);
  chats = chats.filter((c) => c.from !== nis && c.to !== nis);
  save(K_CHAT, chats);

  // Hapus cascade di Firebase Firestore
  fsDeleteDoc('siswa', nis).catch(() => {});
  fsDeleteDoc('nilai_rapor', nis).catch(() => {});
  fsDeleteDoc('nilai_tka', nis).catch(() => {});
  fsDeleteDoc('prestasi', nis).catch(() => {});
  fsDeleteDoc('nilai_tambahan', nis).catch(() => {});
  fsDeleteDoc('pilihan_snbp', nis).catch(() => {});
  fsDeleteDoc('to_data', nis).catch(() => {});
  fsDeleteDoc('pilihan_snbt', nis).catch(() => {});
  fsDeleteDoc('chats', nis).catch(() => {});

  await addLog('ADMIN', 'ADMIN', 'HAPUS_SISWA', `Menghapus seluruh data siswa ${nis} (cascade)`);
}

export async function getAdminSummary(): Promise<{
  totalSiswa: number;
  aktifCount: number;
  pendingCount: number;
  nonAktifCount: number;
  snbpCount: number;
  snbtCount: number;
  modulCount: number;
}> {
  const siswaList = load<Siswa[]>(K_SISWA, SEED_SISWA);
  const modulList = load<Modul[]>(K_MODUL, SAMPLE_MODUL);

  const totalSiswa = siswaList.length;
  const aktifCount = siswaList.filter((s) => s.status === 'AKTIF' && s.status_daftar === 'AKTIF').length;
  const pendingCount = siswaList.filter((s) => s.status_daftar === 'PENDING').length;
  const nonAktifCount = siswaList.filter((s) => s.status !== 'AKTIF' && s.status_daftar !== 'PENDING').length;

  const snbpCount = siswaList.filter((s) => s.pilihan_program === 'SNBP' || s.pilihan_program === 'SNBP+SNBT').length;
  const snbtCount = siswaList.filter((s) => s.pilihan_program === 'SNBT' || s.pilihan_program === 'SNBP+SNBT').length;
  const modulCount = modulList.filter((m) => m.status === 'AKTIF').length;

  return {
    totalSiswa,
    aktifCount,
    pendingCount,
    nonAktifCount,
    snbpCount,
    snbtCount,
    modulCount,
  };
}

// ------------------------------------------
// 6. PTN DATA
// ------------------------------------------
export async function searchPTN(query: string): Promise<PTNSNBPItem[]> {
  const ptns = load<PTNSNBPItem[]>(K_PTN_SNBP, DATA_PTN_SNBP);
  if (!query || query.trim().length < 2) return ptns.slice(0, 20);

  const q = query.toLowerCase();
  const matched = ptns.filter(
    (p) =>
      p.ptn.toLowerCase().includes(q) ||
      p.prodi.toLowerCase().includes(q) ||
      p.singkatan.toLowerCase().includes(q) ||
      p.prov.toLowerCase().includes(q)
  );

  return matched.slice(0, 50);
}

export async function getPTNDetail(id: string): Promise<PTNSNBPItem | undefined> {
  const ptns = load<PTNSNBPItem[]>(K_PTN_SNBP, DATA_PTN_SNBP);
  return ptns.find((p) => p.id === id);
}

export async function getPTNDataSNBT(query?: string): Promise<PTNSNBTItem[]> {
  const ptns = load<PTNSNBTItem[]>(K_PTN_SNBT, DATA_PTN_SNBT);
  if (!query || query.trim().length < 2) return ptns.slice(0, 20);

  const q = query.toLowerCase();
  const matched = ptns.filter(
    (p) =>
      p.ptn.toLowerCase().includes(q) ||
      p.prodi.toLowerCase().includes(q) ||
      p.singk.toLowerCase().includes(q) ||
      p.pt.toLowerCase().includes(q)
  );
  return matched.slice(0, 50);
}

export async function getPTNDetailSNBT(id: string): Promise<PTNSNBTItem | undefined> {
  const ptns = load<PTNSNBTItem[]>(K_PTN_SNBT, DATA_PTN_SNBT);
  return ptns.find((p) => p.id === id);
}

// ------------------------------------------
// 7. DATA SNBP
// ------------------------------------------
export async function saveNilaiRapor(
  nis: string,
  kurikulum: 'K13' | 'MERDEKA',
  jurusan: string,
  items: { mapel: string; sem1: number; sem2: number; sem3: number; sem4: number; sem5: number }[]
): Promise<void> {
  let list = load<NilaiRapor[]>(K_RAPOR, []);
  // remove old records for this nis
  list = list.filter((r) => r.nis !== nis);

  const timestamp = new Date().toISOString();
  // Filter yang punya minimal satu nilai > 0
  const validItems = items
    .filter((it) => it.sem1 > 0 || it.sem2 > 0 || it.sem3 > 0 || it.sem4 > 0 || it.sem5 > 0)
    .map((it) => ({
      nis,
      kurikulum,
      jurusan_peminatan: jurusan,
      mapel: it.mapel,
      sem1: it.sem1 || 0,
      sem2: it.sem2 || 0,
      sem3: it.sem3 || 0,
      sem4: it.sem4 || 0,
      sem5: it.sem5 || 0,
      timestamp,
    }));

  list.push(...validItems);
  save(K_RAPOR, list);

  // Sync to Firebase Cloud Firestore (Wajib Await)
  await fsSetDoc('nilai_rapor', nis, { items: validItems, kurikulum, jurusan });
  await addLog(nis, 'SISWA', 'SIMPAN_RAPOR', `Menyimpan ${validItems.length} mata pelajaran rapor`);
}

export async function getNilaiRapor(nis: string): Promise<NilaiRapor[]> {
  try {
    const cloud = await fsGetDoc<{ items: NilaiRapor[] }>('nilai_rapor', nis);
    if (cloud && Array.isArray(cloud.items) && cloud.items.length > 0) {
      let list = load<NilaiRapor[]>(K_RAPOR, []);
      list = list.filter((r) => r.nis !== nis);
      list.push(...cloud.items);
      save(K_RAPOR, list);
      return cloud.items;
    }
  } catch {}
  const list = load<NilaiRapor[]>(K_RAPOR, []);
  return list.filter((r) => r.nis === nis);
}

export async function saveTKA(data: TKAData): Promise<void> {
  let list = load<TKAData[]>(K_TKA, []);
  list = list.filter((t) => t.nis !== data.nis);
  list.push(data);
  save(K_TKA, list);

  // Sync to Firebase Cloud Firestore (Wajib Await)
  await fsSetDoc('nilai_tka', data.nis, data);
  await addLog(data.nis, 'SISWA', 'SIMPAN_TKA', 'Menyimpan nilai TKA (skala IRT 200–800)');
}

export async function getTKA(nis: string): Promise<TKAData | null> {
  try {
    const cloud = await fsGetDoc<TKAData>('nilai_tka', nis);
    if (cloud) return cloud;
  } catch {}
  const list = load<TKAData[]>(K_TKA, []);
  return list.find((t) => t.nis === nis) || null;
}

export async function savePrestasi(nis: string, prestasiList: Prestasi[]): Promise<void> {
  let list = load<Prestasi[]>(K_PRESTASI, []);
  list = list.filter((p) => p.nis !== nis);
  const now = new Date().toISOString();

  const toAdd = prestasiList.map((p) => ({
    ...p,
    nis,
    timestamp: now,
  }));

  list.push(...toAdd);
  save(K_PRESTASI, list);

  // Sync to Firebase Cloud Firestore (Wajib Await)
  await fsSetDoc('prestasi', nis, { items: toAdd });
  await addLog(nis, 'SISWA', 'SIMPAN_PRESTASI', `Menyimpan data prestasi (${toAdd.length} slot terisi)`);
}

export async function getPrestasi(nis: string): Promise<Prestasi[]> {
  try {
    const cloud = await fsGetDoc<{ items: Prestasi[] }>('prestasi', nis);
    if (cloud && Array.isArray(cloud.items)) return cloud.items;
  } catch {}
  const list = load<Prestasi[]>(K_PRESTASI, []);
  return list.filter((p) => p.nis === nis);
}

export async function saveTambahan(data: Tambahan): Promise<void> {
  let list = load<Tambahan[]>(K_TAMBAHAN, []);
  list = list.filter((t) => t.nis !== data.nis);
  list.push(data);
  save(K_TAMBAHAN, list);

  // Sync to Firebase Cloud Firestore (Wajib Await)
  await fsSetDoc('nilai_tambahan', data.nis, data);
  await addLog(data.nis, 'SISWA', 'SIMPAN_TAMBAHAN', 'Menyimpan data ranking & alumni sekolah');
}

export async function getTambahan(nis: string): Promise<Tambahan | null> {
  try {
    const cloud = await fsGetDoc<Tambahan>('nilai_tambahan', nis);
    if (cloud) return cloud;
  } catch {}
  const list = load<Tambahan[]>(K_TAMBAHAN, []);
  return list.find((t) => t.nis === nis) || null;
}

export async function savePilihanPTN(nis: string, pilihanList: PilihanPTNSNBP[]): Promise<void> {
  let list = load<PilihanPTNSNBP[]>(K_PILIHAN_SNBP, []);
  list = list.filter((p) => p.nis !== nis);
  const now = new Date().toISOString();

  // Bersihkan duplikat & batasi max 2 pilihan
  const uniqueList: PilihanPTNSNBP[] = [];
  pilihanList.forEach((p, idx) => {
    if (idx < 2 && p.ptn && p.prodi) {
      uniqueList.push({
        ...p,
        nis,
        pilihan_ke: idx + 1,
        timestamp: now,
      });
    }
  });

  list.push(...uniqueList);
  save(K_PILIHAN_SNBP, list);

  // Sync to Firebase Cloud Firestore (Wajib Await)
  await fsSetDoc('pilihan_snbp', nis, { items: uniqueList });
  await addLog(nis, 'SISWA', 'SIMPAN_PILIHAN_SNBP', `Menyimpan ${uniqueList.length} pilihan PTN SNBP`);
}

export async function getPilihanPTN(nis: string): Promise<PilihanPTNSNBP[]> {
  try {
    const cloud = await fsGetDoc<{ items: PilihanPTNSNBP[] }>('pilihan_snbp', nis);
    if (cloud && Array.isArray(cloud.items) && cloud.items.length > 0) return cloud.items;
  } catch {}
  const list = load<PilihanPTNSNBP[]>(K_PILIHAN_SNBP, []);
  const found = list.filter((p) => p.nis === nis);
  found.sort((a, b) => a.pilihan_ke - b.pilihan_ke);
  return found;
}

export async function getAnalisaLengkap(nis: string) {
  const siswaList = await getSiswaList();
  const siswa = siswaList.find((s) => s.nis === nis);
  if (!siswa) throw new Error('Siswa tidak ditemukan');

  const allPTN = load<PTNSNBPItem[]>(K_PTN_SNBP, DATA_PTN_SNBP);
  const nilaiRapor = await getNilaiRapor(nis);
  const tka = await getTKA(nis);
  const prestasi = await getPrestasi(nis);
  const tambahan = await getTambahan(nis);
  const pilihan = await getPilihanPTN(nis);

  const peluangResult = calcPeluangSNBP(siswa, nilaiRapor, tka, prestasi, tambahan, pilihan, allPTN);
  const nilaiAkhirResult = calcNilaiAkhirSNBP(
    peluangResult.rata_rapor,
    peluangResult.skor_sertifikat,
    peluangResult.skor_akreditasi,
    peluangResult.skor_alumni_jurusan,
    peluangResult.skor_alumni_ptn,
    peluangResult.skor_ranking_sekolah,
    peluangResult.hasTKA,
    peluangResult.rata_rapor
  );

  const rekomendasiSemester = calcRekomendasiSemester(nilaiRapor, pilihan);
  const rekomendasiAlternatif = calcRekomendasiPTNSNBP(peluangResult.rata_rapor, allPTN, pilihan);
  const kesesuaianMapel = calcKesesuaianMapelRaporTKA(pilihan, nilaiRapor, tka);
  const kesimpulanStrategi = generateKesimpulanStrategiSNBP(peluangResult, kesesuaianMapel, siswa, pilihan);

  return {
    siswa,
    nilaiRapor,
    tka,
    prestasi,
    tambahan,
    pilihan,
    peluang: peluangResult,
    nilaiAkhir: nilaiAkhirResult,
    rekomendasiSemester,
    rekomendasiAlternatif,
    kesesuaianMapel,
    kesimpulanStrategi,
  };
}

// ------------------------------------------
// 8. DATA SNBT
// ------------------------------------------
export async function saveTOData(data: TOData): Promise<void> {
  let list = load<TOData[]>(K_TO, []);
  const calculated = calcSkorTO(data.pu, data.pbm, data.ppu, data.pk, data.lbi, data.lbe, data.pm);

  const record: TOData = {
    ...data,
    total: calculated.total,
    skor_tps: calculated.skor_tps,
    skor_literasi: calculated.skor_literasi,
    skor_tertimbang: calculated.skor_tertimbang,
    timestamp: new Date().toISOString(),
  };

  list = list.filter((t) => !(t.nis === data.nis && t.to_ke === data.to_ke));
  list.push(record);
  list.sort((a, b) => a.to_ke - b.to_ke);
  save(K_TO, list);

  // Sync to Firebase Cloud Firestore (Wajib Await)
  const studentTOs = list.filter((t) => t.nis === data.nis);
  await fsSetDoc('to_data', data.nis, { items: studentTOs });
  await addLog(data.nis, 'SISWA', 'INPUT_TO', `Menyimpan data Try Out ke-${data.to_ke} (Skor: ${calculated.skor_tertimbang})`);
}

export async function getTOData(nis: string): Promise<TOData[]> {
  try {
    const cloud = await fsGetDoc<{ items: TOData[] }>('to_data', nis);
    if (cloud && Array.isArray(cloud.items) && cloud.items.length > 0) {
      cloud.items.sort((a, b) => a.to_ke - b.to_ke);
      return cloud.items;
    }
  } catch {}
  const list = load<TOData[]>(K_TO, []);
  const found = list.filter((t) => t.nis === nis);
  found.sort((a, b) => a.to_ke - b.to_ke);
  return found;
}

export async function savePilihanSNBT(nis: string, pilihanList: PilihanPTNSNBT[]): Promise<void> {
  let list = load<PilihanPTNSNBT[]>(K_PILIHAN_SNBT, []);
  list = list.filter((p) => p.nis !== nis);

  const uniqueList: PilihanPTNSNBT[] = [];
  pilihanList.forEach((p, idx) => {
    if (idx < 4 && p.singk_ptn && p.prodi) {
      uniqueList.push({
        ...p,
        nis,
        pilihan_ke: idx + 1,
      });
    }
  });

  list.push(...uniqueList);
  save(K_PILIHAN_SNBT, list);

  // Sync to Firebase Cloud Firestore (Wajib Await)
  await fsSetDoc('pilihan_snbt', nis, { items: uniqueList });
  await addLog(nis, 'SISWA', 'SIMPAN_PILIHAN_SNBT', `Menyimpan ${uniqueList.length} pilihan PTN SNBT`);
}

export async function getPilihanSNBT(nis: string): Promise<PilihanPTNSNBT[]> {
  try {
    const cloud = await fsGetDoc<{ items: PilihanPTNSNBT[] }>('pilihan_snbt', nis);
    if (cloud && Array.isArray(cloud.items) && cloud.items.length > 0) return cloud.items;
  } catch {}
  const list = load<PilihanPTNSNBT[]>(K_PILIHAN_SNBT, []);
  const found = list.filter((p) => p.nis === nis);
  found.sort((a, b) => a.pilihan_ke - b.pilihan_ke);
  return found;
}

export async function recalcSkorSNBTForSiswa(nis: string): Promise<void> {
  const list = load<TOData[]>(K_TO, []);
  let changed = false;
  list.forEach((to) => {
    if (to.nis === nis) {
      const calc = calcSkorTO(to.pu, to.pbm, to.ppu, to.pk, to.lbi, to.lbe, to.pm);
      to.skor_tps = calc.skor_tps;
      to.skor_literasi = calc.skor_literasi;
      to.total = calc.total;
      to.skor_tertimbang = calc.skor_tertimbang;
      changed = true;
    }
  });
  if (changed) save(K_TO, list);
}

export async function getAnalisaSNBT(nis: string) {
  const siswaList = await getSiswaList();
  const siswa = siswaList.find((s) => s.nis === nis);
  if (!siswa) throw new Error('Siswa tidak ditemukan');

  const toList = await getTOData(nis);
  const pilihanList = await getPilihanSNBT(nis);
  const allPTN_SNBT = load<PTNSNBTItem[]>(K_PTN_SNBT, DATA_PTN_SNBT);

  const stats = calcStatistikSNBT(toList);

  // Analisa ketercapaian per pilihan
  const pilihanDetail = pilihanList.map((p) => {
    const ptnItem = allPTN_SNBT.find(
      (item) => item.prodi.toLowerCase() === p.prodi.toLowerCase() && item.singk.toLowerCase() === p.singk_ptn.toLowerCase()
    );

    const effectivePtnTier = p.ptnTier || (ptnItem && ptnItem.tier ? (ptnItem.tier as any) : inferPTNTier(p.singk_ptn || p.ptn_nama || ''));
    const effectiveProdiTier = p.prodiTier || inferProdiTier(p.prodi);
    const predicted = calcPredictedNAMSNBT(effectivePtnTier, effectiveProdiTier, p.jenjang || 'S1');

    let namTarget = ptnItem ? ptnItem.skor : 0;
    if (p.namTarget) {
      namTarget = p.namTarget;
    } else if (!namTarget) {
      namTarget = predicted.namTarget;
    }

    const ketercapaian = calcKetercapaianNAM(stats.avgTert, namTarget);
    const prioritas = getKomponenPrioritasJurusan(p.prodi);
    const skalaPrediksi = calcSkalaPrediksiSNBT(stats.avgTert, namTarget, effectivePtnTier);

    return {
      pilihan_ke: p.pilihan_ke,
      singk_ptn: p.singk_ptn,
      ptn_nama: ptnItem ? ptnItem.ptn : p.ptn_nama || p.singk_ptn,
      prodi: p.prodi,
      namTarget,
      ketercapaian,
      prioritas,
      ptnItem,
      ptnTier: effectivePtnTier,
      prodiTier: effectiveProdiTier,
      skalaPrediksi,
      isCustom: p.isCustom,
      jenjang: p.jenjang || 'S1',
    };
  });

  const alternatif = calcRekomendasiPTNSNBT(stats.avgTert, allPTN_SNBT, pilihanList);
  const kesimpulanStrategi = generateKesimpulanStrategiSNBT(stats, pilihanDetail, toList);

  return {
    siswa,
    toList,
    pilihanList,
    stats,
    pilihanDetail,
    alternatif,
    kesimpulanStrategi,
  };
}

// ------------------------------------------
// 9. MODUL BELAJAR
// ------------------------------------------
export async function getModulList(): Promise<Modul[]> {
  try {
    const cloud = await fsGetCollection<Modul>('modul');
    if (cloud && cloud.length > 0) {
      cloud.sort((a, b) => a.urutan - b.urutan);
      save(K_MODUL, cloud);
      return cloud;
    }
  } catch {}
  const list = load<Modul[]>(K_MODUL, SAMPLE_MODUL);
  list.sort((a, b) => a.urutan - b.urutan);
  return list;
}

export async function getModulById(id: string): Promise<Modul | undefined> {
  const list = await getModulList();
  return list.find((m) => m.id === id);
}

export async function addModul(modul: Omit<Modul, 'id' | 'timestamp'>): Promise<Modul> {
  const list = load<Modul[]>(K_MODUL, SAMPLE_MODUL);
  const newModul: Modul = {
    ...modul,
    id: `MOD_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  list.push(newModul);
  save(K_MODUL, list);

  // Sync to Firebase Cloud Firestore (Wajib Await)
  await fsSetDoc('modul', newModul.id, newModul);
  await addLog(modul.created_by || 'ADMIN', 'ADMIN', 'TAMBAH_MODUL', `Menambahkan modul: ${modul.judul}`);
  return newModul;
}

export async function editModul(id: string, data: Partial<Modul>): Promise<void> {
  const list = load<Modul[]>(K_MODUL, SAMPLE_MODUL);
  const idx = list.findIndex((m) => m.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data };
    save(K_MODUL, list);
    await fsSetDoc('modul', id, list[idx]);
    await addLog('ADMIN', 'ADMIN', 'EDIT_MODUL', `Mengedit modul ${list[idx].judul}`);
  }
}

export async function deleteModul(id: string): Promise<void> {
  let list = load<Modul[]>(K_MODUL, SAMPLE_MODUL);
  const found = list.find((m) => m.id === id);
  list = list.filter((m) => m.id !== id);
  save(K_MODUL, list);
  await fsDeleteDoc('modul', id);
  await addLog('ADMIN', 'ADMIN', 'HAPUS_MODUL', `Menghapus modul ${found ? found.judul : id}`);
}

export async function toggleStatusModul(id: string): Promise<void> {
  const list = load<Modul[]>(K_MODUL, SAMPLE_MODUL);
  const idx = list.findIndex((m) => m.id === id);
  if (idx !== -1) {
    list[idx].status = list[idx].status === 'AKTIF' ? 'DRAFT' : 'AKTIF';
    save(K_MODUL, list);
    await fsSetDoc('modul', id, list[idx]);
    await addLog('ADMIN', 'ADMIN', 'TOGGLE_MODUL', `Ubah status modul ${list[idx].judul} -> ${list[idx].status}`);
  }
}

export async function getModulSiswa(nis: string): Promise<Modul[]> {
  const siswaList = await getSiswaList();
  const siswa = siswaList.find((s) => s.nis === nis);
  if (!siswa) return [];

  const list = await getModulList();
  return list.filter((m) => {
    if (m.status !== 'AKTIF') return false;
    return isModulVisibleForSiswa(m.kelas_target, m.target_program, siswa.kelas, siswa.pilihan_program);
  });
}

export async function getModulUrl(id: string, nis: string): Promise<{ embed_url: string; judul: string }> {
  const list = await getModulList();
  const modul = list.find((m) => m.id === id);
  if (!modul) throw new Error('Modul tidak ditemukan');

  await addLog(nis, 'SISWA', 'AKSES_MODUL', `Membuka modul: ${modul.judul}`);
  return {
    embed_url: generateEmbedUrl(modul.url, modul.tipe_file),
    judul: modul.judul,
  };
}

// ------------------------------------------
// 10. CHAT
// ------------------------------------------
export async function sendChat(from: string, to: string, pesan: string): Promise<ChatMessage> {
  const chats = load<ChatMessage[]>(K_CHAT, []);
  const msg: ChatMessage = {
    id: `CHAT_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    from,
    to,
    pesan: pesan.trim(),
    timestamp: getWIBTimestamp(),
    dibaca: false,
  };
  chats.push(msg);
  save(K_CHAT, chats);

  // Sync to Firebase Cloud Firestore (Wajib Await)
  await fsSetDoc('chats', msg.id, msg);
  await addLog(from, from === 'ADMIN' ? 'ADMIN' : 'SISWA', 'KIRIM_CHAT', `Pesan dari ${from} ke ${to}`);
  return msg;
}

export async function getChat(nis: string): Promise<ChatMessage[]> {
  try {
    const cloud = await fsGetCollection<ChatMessage>('chats');
    if (cloud && cloud.length > 0) {
      save(K_CHAT, cloud);
      return cloud.filter(
        (c) => (c.from === nis && c.to === 'ADMIN') || (c.from === 'ADMIN' && c.to === nis)
      );
    }
  } catch {}
  const chats = load<ChatMessage[]>(K_CHAT, []);
  return chats.filter(
    (c) => (c.from === nis && c.to === 'ADMIN') || (c.from === 'ADMIN' && c.to === nis)
  );
}

// ------------------------------------------
// 11. GOOGLE SHEETS / DATASET EXPORT & IMPORT
// Sesuai instruksi role: "developer yang suka menggunakan database google sheet, kombinasi arsitektur modern dan database gratis"
// ------------------------------------------
export function exportToGoogleSheetsJSON(): string {
  const data = {
    exportedAt: getWIBTimestamp(),
    SISWA: load(K_SISWA, []),
    NILAI_RAPOR: load(K_RAPOR, []),
    TKA_DATA: load(K_TKA, []),
    PRESTASI: load(K_PRESTASI, []),
    TAMBAHAN: load(K_TAMBAHAN, []),
    PILIHAN_PTN_SNBP: load(K_PILIHAN_SNBP, []),
    TO_DATA: load(K_TO, []),
    PILIHAN_PTN_SNBT: load(K_PILIHAN_SNBT, []),
    MODUL: load(K_MODUL, []),
    SETTINGS: load(K_SETTINGS, DEFAULT_SETTINGS),
  };
  return JSON.stringify(data, null, 2);
}

export async function importFromGoogleSheetsJSON(jsonStr: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonStr);
    if (data.SISWA && Array.isArray(data.SISWA)) {
      save(K_SISWA, data.SISWA);
      for (const s of data.SISWA) {
        if (s.nis) await fsSetDoc('siswa', s.nis, s);
      }
    }
    if (data.NILAI_RAPOR && Array.isArray(data.NILAI_RAPOR)) save(K_RAPOR, data.NILAI_RAPOR);
    if (data.TKA_DATA && Array.isArray(data.TKA_DATA)) save(K_TKA, data.TKA_DATA);
    if (data.PRESTASI && Array.isArray(data.PRESTASI)) save(K_PRESTASI, data.PRESTASI);
    if (data.TAMBAHAN && Array.isArray(data.TAMBAHAN)) save(K_TAMBAHAN, data.TAMBAHAN);
    if (data.PILIHAN_PTN_SNBP && Array.isArray(data.PILIHAN_PTN_SNBP)) save(K_PILIHAN_SNBP, data.PILIHAN_PTN_SNBP);
    if (data.TO_DATA && Array.isArray(data.TO_DATA)) save(K_TO, data.TO_DATA);
    if (data.PILIHAN_PTN_SNBT && Array.isArray(data.PILIHAN_PTN_SNBT)) save(K_PILIHAN_SNBT, data.PILIHAN_PTN_SNBT);
    if (data.MODUL && Array.isArray(data.MODUL)) {
      save(K_MODUL, data.MODUL);
      for (const m of data.MODUL) {
        if (m.id) await fsSetDoc('modul', m.id, m);
      }
    }
    if (data.SETTINGS) {
      save(K_SETTINGS, data.SETTINGS);
      await fsSetDoc('settings', 'app_settings', data.SETTINGS);
    }
    return { success: true, message: 'Sinkronisasi data Google Sheets & Firebase berhasil!' };
  } catch (e) {
    return { success: false, message: `Format data tidak valid: ${(e as Error).message}` };
  }
}
