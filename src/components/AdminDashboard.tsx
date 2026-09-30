import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  KeyRound,
  BookOpen,
  History,
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Sun,
  UserCheck,
  UserX,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Clock,
  ShieldCheck,
  Database,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  Siswa,
  AppSettings,
  TokenDaftar,
  Modul,
  HistoryLog,
  Cabang,
  PaketAkses,
  ProgramType,
  UserStatus,
} from '../types';
import {
  getSiswaList,
  getDaftarPending,
  approveDaftar,
  tolakDaftar,
  addSiswa,
  updateSiswaStatus,
  updateSiswaAkses,
  updatePilihanProgram,
  resetPassword,
  resetPasswordOrtu,
  deleteSiswa,
  getAdminSummary,
  getTokenList,
  generateTokenDaftar,
  clearOldTokens,
  getModulList,
  addModul,
  editModul,
  deleteModul,
  toggleStatusModul,
  getHistoryLog,
  clearHistoryLog,
  getSettings,
  saveSetting,
  getCabangList,
  addCabang,
  updateCabang,
  deleteCabang,
  exportToGoogleSheetsJSON,
  importFromGoogleSheetsJSON,
  getAnalisaLengkap,
  getAnalisaSNBT,
} from '../services/api';
import { subscribeToCollection } from '../services/firebaseDb';
import { SNBPAnalisa } from './student/SNBPAnalisa';
import { SNBTAnalisa } from './student/SNBTAnalisa';

interface AdminDashboardProps {
  settings: AppSettings;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onSettingsUpdated?: (settings: AppSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings: initialSettings,
  darkMode,
  onToggleDarkMode,
  onLogout,
  onSettingsUpdated,
}) => {
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'pending' | 'siswa' | 'token' | 'modul' | 'log' | 'settings' | 'sheets'
  >('dashboard');

  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [summary, setSummary] = useState<any>(null);
  const [pendingList, setPendingList] = useState<Siswa[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [tokenList, setTokenList] = useState<TokenDaftar[]>([]);
  const [modulList, setModulList] = useState<Modul[]>([]);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [cabangList, setCabangList] = useState<Cabang[]>([]);

  // Search & Filter States
  const [searchSiswa, setSearchSiswa] = useState('');
  const [filterProgram, setFilterProgram] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');

  // Modals & Sub-states
  const [showAddSiswaModal, setShowAddSiswaModal] = useState(false);
  const [newSiswaNis, setNewSiswaNis] = useState('');
  const [newSiswaNama, setNewSiswaNama] = useState('');

  // Token generator
  const [genTokenProgram, setGenTokenProgram] = useState<ProgramType>('SNBP+SNBT');
  const [genTokenCount, setGenTokenCount] = useState<number>(3);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Modul Editor modal
  const [showModulModal, setShowModulModal] = useState(false);
  const [editModulId, setEditModulId] = useState<string | null>(null);
  const [modulJudul, setModulJudul] = useState('');
  const [modulDeskripsi, setModulDeskripsi] = useState('');
  const [modulKategori, setModulKategori] = useState('SNBT TPS');
  const [modulTipe, setModulTipe] = useState<Modul['tipe_file']>('pdf');
  const [modulUrl, setModulUrl] = useState('');
  const [modulKelas, setModulKelas] = useState('SEMUA');
  const [modulProgram, setModulProgram] = useState<Modul['target_program']>('SEMUA');

  // Student Preview (SNBP / SNBT) modal
  const [previewStudent, setPreviewStudent] = useState<{ type: 'snbp' | 'snbt'; data: any; siswa: Siswa } | null>(null);

  // Google Sheets import/export
  const [sheetsJSON, setSheetsJSON] = useState('');
  const [sheetsMsg, setSheetsMsg] = useState<string | null>(null);

  // Cabang and Settings state
  const [editingCabang, setEditingCabang] = useState<{ oldName: string; newName: string } | null>(null);
  const [deleteConfirmCabang, setDeleteConfirmCabang] = useState<string | null>(null);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadAll();

    // Listener realtime Firestore agar pendaftar baru dari device lain langsung muncul di laptop admin
    const unsub = subscribeToCollection<Siswa>('siswa', (cloudSiswa) => {
      if (cloudSiswa && cloudSiswa.length > 0) {
        setSiswaList(cloudSiswa);
        const pend = cloudSiswa.filter((s) => s.status_daftar === 'PENDING');
        setPendingList(pend);
      }
    });

    return () => {
      unsub();
    };
  }, []);

  const loadAll = async () => {
    const sum = await getAdminSummary();
    setSummary(sum);
    const pend = await getDaftarPending();
    setPendingList(pend);
    const sis = await getSiswaList();
    setSiswaList(sis);
    const tok = await getTokenList();
    setTokenList(tok);
    const mod = await getModulList();
    setModulList(mod);
    const logs = await getHistoryLog();
    setHistoryLogs(logs);
    const cab = await getCabangList();
    setCabangList(cab);
    const sett = await getSettings();
    setSettings(sett);
  };

  // Actions
  const handleApprove = async (nis: string, paket: PaketAkses) => {
    await approveDaftar(nis, paket);
    await loadAll();
  };

  const handleReject = async (nis: string) => {
    const reason = prompt('Masukkan alasan penolakan (opsional):') || undefined;
    await tolakDaftar(nis, reason);
    await loadAll();
  };

  const handleAddSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiswaNis.trim() || !newSiswaNama.trim()) return;
    await addSiswa({ nis: newSiswaNis.trim(), nama_siswa: newSiswaNama.trim() });
    setNewSiswaNis('');
    setNewSiswaNama('');
    setShowAddSiswaModal(false);
    await loadAll();
  };

  const handleResetPass = async (nis: string) => {
    if (confirm(`Reset kata sandi siswa ${nis} ke '123456'?`)) {
      await resetPassword(nis);
      alert('Password berhasil direset ke: 123456');
    }
  };

  const handleResetPassOrtu = async (nis: string) => {
    const def = await resetPasswordOrtu(nis);
    alert(`Password orang tua berhasil direset ke: ${def}`);
  };

  const handleDeleteSiswaCascade = async (nis: string) => {
    if (confirm(`YAKIN menghapus permanen seluruh data siswa ${nis}? Tindakan ini tidak dapat dibatalkan.`)) {
      await deleteSiswa(nis);
      await loadAll();
    }
  };

  const handleGenerateTokens = async () => {
    await generateTokenDaftar(genTokenProgram, genTokenCount);
    await loadAll();
  };

  const handleClearTokens = async () => {
    const count = await clearOldTokens();
    alert(`Berhasil menghapus ${count} token kadaluarsa & terpakai.`);
    await loadAll();
  };

  const handleSaveModul = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editModulId) {
      await editModul(editModulId, {
        judul: modulJudul,
        deskripsi: modulDeskripsi,
        kategori: modulKategori,
        tipe_file: modulTipe,
        url: modulUrl,
        kelas_target: modulKelas,
        target_program: modulProgram,
      });
    } else {
      await addModul({
        judul: modulJudul,
        deskripsi: modulDeskripsi,
        kategori: modulKategori,
        tipe_file: modulTipe,
        url: modulUrl,
        urutan: modulList.length + 1,
        status: 'AKTIF',
        kelas_target: modulKelas,
        target_program: modulProgram,
        created_by: 'ADMIN',
      });
    }
    setShowModulModal(false);
    setEditModulId(null);
    setModulJudul('');
    setModulDeskripsi('');
    setModulUrl('');
    await loadAll();
  };

  const handlePreviewStudent = (s: Siswa, type: 'snbp' | 'snbt') => {
    setPreviewStudent({ type, data: null, siswa: s });
  };

  const filteredSiswa = siswaList.filter((s) => {
    if (filterProgram !== 'SEMUA' && s.pilihan_program !== filterProgram) return false;
    if (filterStatus !== 'SEMUA' && s.status !== filterStatus) return false;
    if (searchSiswa.trim()) {
      const q = searchSiswa.toLowerCase();
      return (
        s.nama_siswa.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.cabang.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F7F4FF] dark:bg-[#0D0920] text-[#1A0835] dark:text-[#EDE8FF] flex">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-white dark:bg-[#160E2E] border-r border-purple-100 dark:border-purple-950/40 p-4 flex flex-col justify-between h-screen sticky top-0">
        <div>
          <div className="p-2 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-800 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-md">
              🔐
            </div>
            <div>
              <div className="font-extrabold text-sm text-gray-900 dark:text-white">
                Admin Panel 2027
              </div>
              <div className="text-[10px] text-gray-400">AnalisaKu Super Administrator</div>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-bold">
            {[
              { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
              { id: 'pending', label: `Pendaftaran Pending (${pendingList.length})`, icon: UserCheck, alert: pendingList.length > 0 },
              { id: 'siswa', label: 'Manajemen Siswa', icon: Users },
              { id: 'token', label: 'Token Pendaftaran', icon: KeyRound },
              { id: 'modul', label: 'Modul Belajar', icon: BookOpen },
              { id: 'log', label: 'History Aktivitas', icon: History },
              { id: 'sheets', label: 'Google Sheets & Data', icon: Database },
              { id: 'settings', label: 'Pengaturan Sistem', icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-purple-700 text-white shadow-md shadow-purple-600/20'
                      : 'text-gray-600 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.alert && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t border-purple-100 dark:border-purple-950/40">
          <button
            onClick={onToggleDarkMode}
            className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between text-gray-600 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40"
          >
            <span className="flex items-center gap-2">
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
              <span>{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
            </span>
          </button>
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl overflow-y-auto">
        {/* TAB 1: DASHBOARD UTAMA */}
        {activeMenu === 'dashboard' && summary && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    Ringkasan Eksekutif Bimbingan Belajar
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Firebase Cloud: fixlolosptn
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-purple-300">
                  Data statistik real-time persiapan seleksi PTN 2027 tersinkronisasi otomatis dengan Cloud Firestore.
                </p>
              </div>

              <button
                onClick={loadAll}
                className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan Data</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-100 dark:border-purple-950/40 shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Total Siswa</span>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {summary.totalSiswa}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">
                  {summary.aktifCount} Aktif ({summary.pendingCount} Pending)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-100 dark:border-purple-950/40 shadow-sm">
                <span className="text-[10px] font-bold text-purple-600 uppercase">Peserta SNBP</span>
                <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
                  {summary.snbpCount}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Jalur Rapor Terbobot</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#160E2E] border border-red-100 dark:border-red-950/40 shadow-sm">
                <span className="text-[10px] font-bold text-red-600 uppercase">Peserta SNBT</span>
                <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                  {summary.snbtCount}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Jalur Tes UTBK 60:40</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-100 dark:border-purple-950/40 shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Modul Belajar</span>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {summary.modulCount}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Materi Terproteksi</div>
              </div>
            </div>

            {/* 3 Pendaftaran Pending Terbaru */}
            {pendingList.length > 0 && (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span>Ada {pendingList.length} Pendaftaran Menunggu Persetujuan Admin</span>
                  </h3>
                  <button
                    onClick={() => setActiveMenu('pending')}
                    className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline"
                  >
                    Buka Semua Pending &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {pendingList.slice(0, 3).map((p) => (
                    <div key={p.nis} className="p-3 bg-white dark:bg-[#160E2E] rounded-xl border border-amber-200 text-xs space-y-1">
                      <div className="font-bold text-gray-900 dark:text-white">{p.nama_siswa}</div>
                      <div className="text-[11px] text-gray-500">{p.asal_sekolah} ({p.provinsi_sekolah})</div>
                      <div className="text-[10px] font-mono text-purple-700">NIS: {p.nis} • {p.pilihan_program}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PENDAFTARAN PENDING */}
        {activeMenu === 'pending' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Daftar Pendaftaran Siswa Menunggu Verifikasi ({pendingList.length})
            </h2>

            {pendingList.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#160E2E] rounded-2xl border text-xs text-gray-400">
                Tidak ada pendaftaran pending saat ini. Semua akun siswa telah diproses.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingList.map((p) => (
                  <div
                    key={p.nis}
                    className="bg-white dark:bg-[#160E2E] rounded-2xl border border-purple-100 dark:border-purple-950/40 p-5 space-y-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-sm text-gray-900 dark:text-white">
                          {p.nama_siswa}
                        </h4>
                        <div className="text-xs text-purple-700 dark:text-purple-300 font-mono">
                          NIS: {p.nis} • Username: @{p.username}
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {p.pilihan_program}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-purple-200/80 space-y-1 pt-1 border-t border-purple-50 dark:border-purple-950/30">
                      <div><strong>Sekolah:</strong> {p.asal_sekolah} ({p.provinsi_sekolah})</div>
                      <div><strong>Orang Tua:</strong> {p.nama_ortu} (HP: {p.no_hp_ortu || '-'})</div>
                      <div><strong>HP Siswa:</strong> {p.no_hp_siswa || '-'}</div>
                      <div><strong>Cabang:</strong> {p.cabang}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-purple-50 dark:border-purple-950/30">
                      <select
                        id={`paket_${p.nis}`}
                        defaultValue="1BULAN"
                        className="px-2 py-1.5 text-xs rounded-lg border bg-gray-50 dark:bg-[#1E1540] font-semibold"
                      >
                        <option value="TRIAL">Trial 1 Hari</option>
                        <option value="1MINGGU">1 Minggu</option>
                        <option value="1BULAN">1 Bulan</option>
                        <option value="3BULAN">3 Bulan</option>
                        <option value="1TAHUN">1 Tahun</option>
                        <option value="UNLIMITED">Unlimited</option>
                      </select>

                      <button
                        onClick={() => {
                          const el = document.getElementById(`paket_${p.nis}`) as HTMLSelectElement;
                          handleApprove(p.nis, (el?.value || '1BULAN') as PaketAkses);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        ✓ Setujui
                      </button>

                      <button
                        onClick={() => handleReject(p.nis)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                      >
                        ✕ Tolak
                      </button>

                      {p.no_hp_ortu && (
                        <a
                          href={`https://wa.me/${p.no_hp_ortu.replace(/\D/g, '')}?text=Halo%20Bpk/Ibu%20${encodeURIComponent(p.nama_ortu)},%20pendaftaran%20ananda%20${encodeURIComponent(p.nama_siswa)}%20di%20AnalisaKu%202027%20telah%20kami%20terima.`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold inline-flex items-center gap-1"
                        >
                          <span>WA Ortu</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MANAJEMEN SISWA */}
        {activeMenu === 'siswa' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  Data Seluruh Siswa ({siswaList.length})
                </h2>
                <p className="text-xs text-gray-500 dark:text-purple-300">
                  Kelola akun siswa, paket akses, preview evaluasi, dan reset kata sandi.
                </p>
              </div>

              <button
                onClick={() => setShowAddSiswaModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siswa Manual</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={searchSiswa}
                onChange={(e) => setSearchSiswa(e.target.value)}
                placeholder="Cari nama, NIS, username, cabang..."
                className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540]"
              />

              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540]"
              >
                <option value="SEMUA">Semua Program</option>
                <option value="SNBP">SNBP Saja</option>
                <option value="SNBT">SNBT Saja</option>
                <option value="SNBP+SNBT">SNBP + SNBT</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540]"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="AKTIF">AKTIF</option>
                <option value="NONAKTIF">NONAKTIF</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>

            {/* Table Siswa */}
            <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-700 text-white font-bold">
                    <tr>
                      <th className="py-3 px-3">NIS</th>
                      <th className="py-3 px-3">Nama &amp; Ortu</th>
                      <th className="py-3 px-2">Program</th>
                      <th className="py-3 px-2">Kelas / Cabang</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2">Paket Akses</th>
                      <th className="py-3 px-3 text-center">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50 dark:divide-purple-950/30">
                    {filteredSiswa.map((s) => (
                      <tr key={s.nis} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20">
                        <td className="py-2.5 px-3 font-mono font-bold text-purple-700 dark:text-purple-300">
                          {s.nis}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-gray-900 dark:text-white">{s.nama_siswa}</div>
                          <div className="text-[10px] text-gray-400">Ortu: {s.nama_ortu}</div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200">
                            {s.pilihan_program}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-gray-600 dark:text-purple-200">
                          {s.kelas} • {s.cabang}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              s.status === 'AKTIF'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[11px]">
                          <strong>{s.akses}</strong>
                          <div className="text-[9px] text-gray-400">
                            s.d. {s.akses_akhir ? new Date(s.akses_akhir).toLocaleDateString('id-ID') : '-'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-1 text-[10px]">
                            {/* Preview SNBP */}
                            <button
                              onClick={() => handlePreviewStudent(s, 'snbp')}
                              className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 font-bold"
                              title="Preview Analisis SNBP"
                            >
                              SNBP
                            </button>
                            {/* Preview SNBT */}
                            <button
                              onClick={() => handlePreviewStudent(s, 'snbt')}
                              className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 font-bold"
                              title="Preview Analisis SNBT"
                            >
                              SNBT
                            </button>
                            {/* Reset Pass */}
                            <button
                              onClick={() => handleResetPass(s.nis)}
                              className="px-2 py-1 rounded bg-gray-100 dark:bg-purple-950 hover:bg-gray-200 text-gray-700 dark:text-purple-300 font-semibold"
                              title="Reset Password ke 123456"
                            >
                              Reset
                            </button>
                            {/* Reset Pass Ortu */}
                            <button
                              onClick={() => handleResetPassOrtu(s.nis)}
                              className="px-2 py-1 rounded bg-gray-100 dark:bg-purple-950 hover:bg-gray-200 text-gray-700 dark:text-purple-300 font-semibold"
                              title="Reset Password Ortu ke 4 digit HP"
                            >
                              Ortu
                            </button>
                            {/* Delete Cascade */}
                            <button
                              onClick={() => handleDeleteSiswaCascade(s.nis)}
                              className="px-1.5 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100"
                              title="Hapus permanen cascade"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TOKEN PENDAFTARAN */}
        {activeMenu === 'token' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  Token Pendaftaran Mandiri
                </h2>
                <p className="text-xs text-gray-500 dark:text-purple-300">
                  Format XXXX-XXXX-XXXX, berlaku 24 jam, langsung aktif otomatis saat siswa mendaftar.
                </p>
              </div>

              <button
                onClick={handleClearTokens}
                className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-purple-800 text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Bersihkan Kadaluarsa &amp; Terpakai
              </button>
            </div>

            {/* Generator Form */}
            <div className="bg-white dark:bg-[#160E2E] rounded-2xl border border-purple-100 dark:border-purple-950/40 p-5 space-y-4">
              <h3 className="font-bold text-xs text-gray-800 dark:text-purple-200 uppercase">
                Generate Token Baru
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Target Program</label>
                  <select
                    value={genTokenProgram}
                    onChange={(e) => setGenTokenProgram(e.target.value as ProgramType)}
                    className="px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540] font-semibold"
                  >
                    <option value="SNBP">SNBP Saja</option>
                    <option value="SNBT">SNBT Saja</option>
                    <option value="SNBP+SNBT">SNBP + SNBT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Jumlah Token</label>
                  <select
                    value={genTokenCount}
                    onChange={(e) => setGenTokenCount(parseInt(e.target.value))}
                    className="px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540] font-semibold"
                  >
                    <option value={1}>1 Token</option>
                    <option value={3}>3 Token</option>
                    <option value={5}>5 Token</option>
                    <option value={10}>10 Token</option>
                  </select>
                </div>

                <div className="self-end">
                  <button
                    onClick={handleGenerateTokens}
                    className="px-5 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 shadow-md"
                  >
                    + Buat Token Sekarang
                  </button>
                </div>
              </div>
            </div>

            {/* Token Table */}
            <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 dark:bg-[#1E1540] text-gray-700 dark:text-purple-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">Token Pendaftaran</th>
                    <th className="py-3 px-3">Program</th>
                    <th className="py-3 px-3">Dibuat</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Digunakan Oleh</th>
                    <th className="py-3 px-3 text-center">Salin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 dark:divide-purple-950/30 font-mono">
                  {tokenList.map((t) => {
                    const isExp = new Date().getTime() > new Date(t.expired).getTime();
                    return (
                      <tr key={t.token} className="hover:bg-purple-50/30">
                        <td className="py-2.5 px-4 font-bold text-purple-700 dark:text-purple-300">
                          {t.token}
                        </td>
                        <td className="py-2.5 px-3 font-sans font-semibold">{t.pilihan_program}</td>
                        <td className="py-2.5 px-3 text-[11px] text-gray-500 font-sans">
                          {new Date(t.created).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          {t.digunakan === 'YA' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-600">
                              DIGUNAKAN
                            </span>
                          ) : isExp ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              KADALUARSA
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              AKTIF
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-gray-600 text-[11px]">
                          {t.digunakan_oleh || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-sans">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(t.token);
                              setCopiedToken(t.token);
                              setTimeout(() => setCopiedToken(null), 2000);
                            }}
                            className="p-1 rounded hover:bg-gray-100 text-purple-700"
                            title="Salin token"
                          >
                            {copiedToken === t.token ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: MODUL BELAJAR ADMIN */}
        {activeMenu === 'modul' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  Manajemen Modul &amp; Bank Materi Belajar ({modulList.length})
                </h2>
                <p className="text-xs text-gray-500 dark:text-purple-300">
                  Kelola link materi, sandbox viewer, serta target kelas dan program siswa.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditModulId(null);
                  setModulJudul('');
                  setModulDeskripsi('');
                  setModulUrl('');
                  setShowModulModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Modul Baru</span>
              </button>
            </div>

            <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-purple-700 text-white font-bold">
                  <tr>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-4">Judul &amp; Kategori</th>
                    <th className="py-3 px-2">Tipe</th>
                    <th className="py-3 px-2">Target Kelas</th>
                    <th className="py-3 px-2">Program</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 dark:divide-purple-950/30">
                  {modulList.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-purple-50/30">
                      <td className="py-2.5 px-3 font-mono text-gray-400">{idx + 1}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-gray-900 dark:text-white">{m.judul}</div>
                        <div className="text-[10px] text-gray-400">{m.kategori}</div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          {m.tipe_file}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-mono font-semibold">{m.kelas_target}</td>
                      <td className="py-2.5 px-2">{m.target_program}</td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={async () => {
                            await toggleStatusModul(m.id);
                            await loadAll();
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.status === 'AKTIF'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {m.status}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditModulId(m.id);
                              setModulJudul(m.judul);
                              setModulDeskripsi(m.deskripsi);
                              setModulKategori(m.kategori);
                              setModulTipe(m.tipe_file);
                              setModulUrl(m.url);
                              setModulKelas(m.kelas_target);
                              setModulProgram(m.target_program);
                              setShowModulModal(true);
                            }}
                            className="p-1 rounded text-purple-700 hover:bg-purple-50"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Hapus modul "${m.judul}"?`)) {
                                await deleteModul(m.id);
                                await loadAll();
                              }
                            }}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: HISTORY LOG */}
        {activeMenu === 'log' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  Audit History Log ({historyLogs.length} Aktivitas)
                </h2>
                <p className="text-xs text-gray-500">Mencatat aktivitas login, simpan rapor, pendaftaran, dan mutasi data.</p>
              </div>

              <button
                onClick={async () => {
                  if (confirm('Bersihkan seluruh history log?')) {
                    await clearHistoryLog();
                    await loadAll();
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                Bersihkan Log
              </button>
            </div>

            <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 dark:bg-[#1E1540] font-bold text-gray-700 dark:text-purple-200">
                  <tr>
                    <th className="py-2.5 px-3">Waktu (WIB)</th>
                    <th className="py-2.5 px-3">Aktor</th>
                    <th className="py-2.5 px-2">Role</th>
                    <th className="py-2.5 px-3">Aksi</th>
                    <th className="py-2.5 px-4">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-purple-950/30 font-mono text-[11px]">
                  {historyLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-purple-50/20">
                      <td className="py-2 px-3 text-gray-500">{l.timestamp}</td>
                      <td className="py-2 px-3 font-bold font-sans">{l.actor}</td>
                      <td className="py-2 px-2 font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800">
                          {l.role}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-purple-700">{l.aksi}</td>
                      <td className="py-2 px-4 font-sans text-gray-600 dark:text-purple-200">{l.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: GOOGLE SHEETS & DATA DATABASE GRATIS */}
        {activeMenu === 'sheets' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Sinkronisasi Google Sheets &amp; Ekspor Database</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-purple-300 mt-1">
                Kombinasi arsitektur modern web dan fleksibilitas Google Sheets gratis. Anda dapat mengekspor seluruh sheet (SISWA, NILAI_RAPOR, TKA_DATA, PRESTASI, TO_DATA, SETTINGS) atau mengimpor data spreadsheet.
              </p>
            </div>

            {sheetsMsg && (
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 text-purple-800 dark:text-purple-200 text-xs font-bold">
                {sheetsMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-100 dark:border-purple-950/40 space-y-3">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-600" />
                  <span>Ekspor Seluruh Database ke JSON / Sheets</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Salin payload JSON ini untuk disimpan ke Google Sheets (via Apps Script doPost) atau dicadangkan ke Google Drive secara berkala.
                </p>
                <button
                  onClick={() => {
                    const json = exportToGoogleSheetsJSON();
                    setSheetsJSON(json);
                    navigator.clipboard.writeText(json);
                    setSheetsMsg('Database berhasil diekspor dan disalin ke clipboard!');
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs shadow-md hover:bg-purple-800 transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Generate &amp; Salin JSON Database</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-100 dark:border-purple-950/40 space-y-3">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Impor / Sinkronisasi dari Google Sheets</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Tempel data JSON dari Google Sheets untuk menimpa atau memperbarui tabel aplikasi ini secara instan.
                </p>
                <button
                  onClick={async () => {
                    if (!sheetsJSON.trim()) {
                      alert('Tempel teks JSON pada kotak di bawah terlebih dahulu.');
                      return;
                    }
                    const res = await importFromGoogleSheetsJSON(sheetsJSON);
                    setSheetsMsg(res.message);
                    if (res.success) loadAll();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Jalankan Impor Data</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-100 dark:border-purple-950/40 space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-purple-200">
                Payload JSON Database Google Sheets:
              </label>
              <textarea
                rows={10}
                value={sheetsJSON}
                onChange={(e) => setSheetsJSON(e.target.value)}
                placeholder="Hasil generate ekspor atau tempel data impor di sini..."
                className="w-full p-3 font-mono text-[11px] rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* TAB 9: PENGATURAN */}
        {activeMenu === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Pengaturan Lembaga &amp; Tanggal Ujian
              </h2>
              <p className="text-xs text-gray-500 dark:text-purple-300">
                Perubahan pengaturan ini langsung diterapkan ke seluruh judul, footer, dan countdown hitung mundur.
              </p>
            </div>

            <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                    Nama Lembaga / Bimbingan Belajar
                  </label>
                  <input
                    type="text"
                    value={settings.NAMA_LEMBAGA}
                    onChange={(e) => setSettings({ ...settings, NAMA_LEMBAGA: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                    Nomor WhatsApp Admin (Format 628...)
                  </label>
                  <input
                    type="text"
                    value={settings.WA_ADMIN}
                    onChange={(e) => setSettings({ ...settings, WA_ADMIN: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                    Target Tanggal SNBP 2027 (Countdown)
                  </label>
                  <input
                    type="text"
                    value={settings.SNBP_DATE}
                    onChange={(e) => setSettings({ ...settings, SNBP_DATE: e.target.value })}
                    placeholder="2027-02-14T08:00:00+07:00"
                    className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                    Target Tanggal SNBT 2027 (Countdown)
                  </label>
                  <input
                    type="text"
                    value={settings.SNBT_DATE}
                    onChange={(e) => setSettings({ ...settings, SNBT_DATE: e.target.value })}
                    placeholder="2027-04-26T07:30:00+07:00"
                    className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                    Status Pendaftaran Siswa Baru
                  </label>
                  <select
                    value={settings.DAFTAR_OPEN}
                    onChange={(e) => setSettings({ ...settings, DAFTAR_OPEN: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540] font-bold"
                  >
                    <option value="YA">Buka Pendaftaran (YA)</option>
                    <option value="TIDAK">Tutup Pendaftaran (TIDAK)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                    Token Pendaftaran Wajib?
                  </label>
                  <select
                    value={settings.TOKEN_REQUIRED}
                    onChange={(e) => setSettings({ ...settings, TOKEN_REQUIRED: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540] font-bold"
                  >
                    <option value="TIDAK">Tidak Wajib (Bebas Daftar)</option>
                    <option value="YA">Wajib (Harus Punya Token)</option>
                  </select>
                </div>
              </div>

              {settingsFeedback && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{settingsFeedback}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={async () => {
                    await saveSetting('NAMA_LEMBAGA', settings.NAMA_LEMBAGA);
                    await saveSetting('WA_ADMIN', settings.WA_ADMIN);
                    await saveSetting('SNBP_DATE', settings.SNBP_DATE);
                    await saveSetting('SNBT_DATE', settings.SNBT_DATE);
                    await saveSetting('DAFTAR_OPEN', settings.DAFTAR_OPEN);
                    await saveSetting('TOKEN_REQUIRED', settings.TOKEN_REQUIRED);
                    if (onSettingsUpdated) onSettingsUpdated(settings);
                    setSettingsFeedback('Pengaturan identitas bimbel & sistem berhasil disimpan!');
                    setTimeout(() => setSettingsFeedback(null), 4000);
                    await loadAll();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-all"
                >
                  Simpan Identitas &amp; Pengaturan
                </button>
              </div>
            </div>

            {/* Manajemen Cabang */}
            <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                    Manajemen Cabang Bimbingan Belajar
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-purple-300">
                    Admin dapat menambah, mengganti nama (edit), atau menghapus cabang bimbel.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                  {cabangList.length} Cabang Terdaftar
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {cabangList.map((c) => {
                  const isEditingThis = editingCabang?.oldName === c.nama_cabang;
                  const isConfirmingDelete = deleteConfirmCabang === c.nama_cabang;

                  if (isEditingThis) {
                    return (
                      <div
                        key={c.nama_cabang}
                        className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border-2 border-purple-400 flex items-center gap-1.5"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={editingCabang.newName}
                          onChange={(e) =>
                            setEditingCabang({ ...editingCabang, newName: e.target.value })
                          }
                          className="px-2 py-1 text-xs rounded-lg border bg-white dark:bg-[#1E1540] font-bold uppercase w-36"
                        />
                        <button
                          onClick={async () => {
                            if (editingCabang.newName.trim()) {
                              await updateCabang(editingCabang.oldName, editingCabang.newName.trim());
                              setEditingCabang(null);
                              await loadAll();
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingCabang(null)}
                          className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-purple-900 text-gray-700 dark:text-purple-200 text-[11px] font-bold"
                        >
                          Batal
                        </button>
                      </div>
                    );
                  }

                  if (isConfirmingDelete) {
                    return (
                      <div
                        key={c.nama_cabang}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2"
                      >
                        <span>Hapus cabang {c.nama_cabang}?</span>
                        <button
                          onClick={async () => {
                            await deleteCabang(c.nama_cabang);
                            setDeleteConfirmCabang(null);
                            await loadAll();
                          }}
                          className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
                        >
                          Ya, Hapus
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCabang(null)}
                          className="px-2 py-0.5 rounded-lg bg-gray-200 dark:bg-purple-900 text-gray-700 dark:text-purple-200 text-[10px]"
                        >
                          Batal
                        </button>
                      </div>
                    );
                  }

                  return (
                    <span
                      key={c.nama_cabang}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100 font-extrabold text-xs flex items-center gap-2.5 shadow-sm"
                    >
                      <span>🏢 {c.nama_cabang}</span>
                      <button
                        onClick={() =>
                          setEditingCabang({ oldName: c.nama_cabang, newName: c.nama_cabang })
                        }
                        className="text-purple-600 dark:text-purple-300 hover:text-purple-900 text-[11px] px-1 py-0.5 rounded hover:bg-purple-200 dark:hover:bg-purple-800"
                        title="Ganti nama cabang"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmCabang(c.nama_cabang)}
                        className="text-rose-400 hover:text-rose-600 font-bold px-1"
                        title="Hapus cabang"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>

              <div className="flex gap-2 max-w-sm pt-2">
                <input
                  type="text"
                  id="new_cabang_input"
                  placeholder="Ketik nama cabang baru..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border bg-gray-50 dark:bg-[#1E1540] font-bold uppercase"
                />
                <button
                  onClick={async () => {
                    const input = document.getElementById('new_cabang_input') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      await addCabang(input.value.trim());
                      input.value = '';
                      await loadAll();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm transition-all"
                >
                  + Tambah Cabang
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL TAMBAH SISWA MANUAL */}
      {showAddSiswaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 max-w-md w-full border shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
              Tambah Siswa Manual
            </h3>
            <form onSubmit={handleAddSiswa} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                  Nomor Induk Siswa (NIS)
                </label>
                <input
                  type="text"
                  required
                  value={newSiswaNis}
                  onChange={(e) => setNewSiswaNis(e.target.value)}
                  placeholder="Contoh: USR2027005"
                  className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  required
                  value={newSiswaNama}
                  onChange={(e) => setNewSiswaNama(e.target.value)}
                  placeholder="Nama siswa"
                  className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540]"
                />
              </div>

              <p className="text-[11px] text-gray-400">
                Default password: 123456, program: SNBP+SNBT, status: AKTIF, paket akses: TRIAL (1 Hari).
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSiswaModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODUL EDITOR */}
      {showModulModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 max-w-lg w-full border shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
              {editModulId ? 'Edit Modul Belajar' : 'Tambah Modul Belajar'}
            </h3>
            <form onSubmit={handleSaveModul} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Judul Modul *</label>
                <input
                  type="text"
                  required
                  value={modulJudul}
                  onChange={(e) => setModulJudul(e.target.value)}
                  placeholder="Judul materi..."
                  className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={modulDeskripsi}
                  onChange={(e) => setModulDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Kategori</label>
                  <input
                    type="text"
                    value={modulKategori}
                    onChange={(e) => setModulKategori(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Tipe File</label>
                  <select
                    value={modulTipe}
                    onChange={(e) => setModulTipe(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540] font-bold"
                  >
                    <option value="pdf">PDF Dokumen</option>
                    <option value="youtube">YouTube Video</option>
                    <option value="gdrive">Google Drive</option>
                    <option value="doc">Google Docs</option>
                    <option value="spreadsheet">Google Sheets</option>
                    <option value="ppt">Slides PPT</option>
                    <option value="link">Tautan Luar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">URL Sumber *</label>
                <input
                  type="url"
                  required
                  value={modulUrl}
                  onChange={(e) => setModulUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Target Kelas</label>
                  <select
                    value={modulKelas}
                    onChange={(e) => setModulKelas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540]"
                  >
                    <option value="SEMUA">Semua Kelas</option>
                    <option value="10">Kelas 10</option>
                    <option value="11">Kelas 11</option>
                    <option value="12">Kelas 12</option>
                    <option value="11,12">Kelas 11 &amp; 12</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Target Program</label>
                  <select
                    value={modulProgram}
                    onChange={(e) => setModulProgram(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border bg-gray-50 dark:bg-[#1E1540]"
                  >
                    <option value="SEMUA">Semua Program</option>
                    <option value="SNBP">SNBP Saja</option>
                    <option value="SNBT">SNBT Saja</option>
                    <option value="SNBP+SNBT">SNBP + SNBT</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModulModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold"
                >
                  Simpan Modul
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HASIL ANALISA LENGKAP SISWA (SNBP & SNBT) */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#160E2E] rounded-3xl max-w-6xl w-full h-[94vh] border border-purple-100 dark:border-purple-900 shadow-2xl flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-purple-100 dark:border-purple-900/60 bg-gradient-to-r from-purple-50 via-white to-indigo-50 dark:from-[#1E1540] dark:to-[#160E2E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-md shadow-purple-600/20">
                  👨‍🎓
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                      Hasil Analisis Lengkap: {previewStudent.siswa.nama_siswa}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {previewStudent.siswa.pilihan_program}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-purple-300 font-mono">
                    NIS: {previewStudent.siswa.nis} • {previewStudent.siswa.asal_sekolah} ({previewStudent.siswa.provinsi_sekolah || 'Provinsi Sekolah'})
                  </p>
                </div>
              </div>

              {/* Navigation Switcher between SNBP & SNBT and Close */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="bg-gray-100 dark:bg-[#1E1540] p-1 rounded-2xl flex items-center gap-1 text-xs font-bold border border-gray-200 dark:border-purple-900/50">
                  <button
                    onClick={() => setPreviewStudent({ ...previewStudent, type: 'snbp' })}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      previewStudent.type === 'snbp'
                        ? 'bg-purple-700 text-white shadow-sm shadow-purple-700/30'
                        : 'text-gray-600 dark:text-purple-300 hover:text-purple-700'
                    }`}
                  >
                    <span>📊 Hasil SNBP</span>
                  </button>
                  <button
                    onClick={() => setPreviewStudent({ ...previewStudent, type: 'snbt' })}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      previewStudent.type === 'snbt'
                        ? 'bg-red-700 text-white shadow-sm shadow-red-700/30'
                        : 'text-gray-600 dark:text-purple-300 hover:text-red-700'
                    }`}
                  >
                    <span>🎯 Hasil SNBT</span>
                  </button>
                </div>

                <button
                  onClick={() => setPreviewStudent(null)}
                  className="w-9 h-9 rounded-2xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center font-bold text-sm shadow-sm"
                  title="Tutup Modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body - Exact Same Student Analysis Component */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/40 dark:bg-[#120B27]/40">
              {previewStudent.type === 'snbp' ? (
                <SNBPAnalisa siswa={previewStudent.siswa} />
              ) : (
                <SNBTAnalisa siswa={previewStudent.siswa} />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 px-6 border-t border-purple-100 dark:border-purple-900/60 bg-white dark:bg-[#160E2E] flex justify-between items-center flex-shrink-0 text-xs">
              <span className="text-gray-500 dark:text-purple-300">
                Mode Tinjauan Instruktur &amp; Konselor Admin • Sinkronisasi Data Real-Time
              </span>
              <button
                onClick={() => setPreviewStudent(null)}
                className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition-all shadow-md shadow-purple-700/20"
              >
                Tutup Analisis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
