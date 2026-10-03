import React, { useState } from 'react';
import {
  LogOut,
  Compass,
  TrendingUp,
  RefreshCw,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Building,
  School,
  IdCard,
  Flame,
  Award,
} from 'lucide-react';
import { Siswa, AppSettings } from '../types';
import { checkAkses } from '../lib/calc';
import { AccessExpiredOverlay } from './student/AccessExpiredOverlay';
import { SNBPAnalisa } from './student/SNBPAnalisa';
import { SNBTAnalisa } from './student/SNBTAnalisa';

interface PortalOrtuProps {
  siswa: Siswa;
  settings: AppSettings;
  onLogout: () => void;
}

export const PortalOrtu: React.FC<PortalOrtuProps> = ({
  siswa,
  settings,
  onLogout,
}) => {
  const showSNBP = siswa.pilihan_program === 'SNBP' || siswa.pilihan_program === 'SNBP+SNBT';
  const showSNBT = siswa.pilihan_program === 'SNBT' || siswa.pilihan_program === 'SNBP+SNBT';

  const [activeTab, setActiveTab] = useState<'snbp' | 'snbt'>(
    siswa.pilihan_program === 'SNBT' ? 'snbt' : 'snbp'
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const aksesCheck = checkAkses(siswa);

  return (
    <div className="min-h-screen bg-[#f3e8ff] dark:bg-[#0f0a1f] text-[#0f172a] dark:text-[#f8fafc] py-6 px-3 sm:px-6 lg:px-8 selection:bg-amber-300 selection:text-[#0f172a]">
      {/* Expired Access Blocking Overlay */}
      {!aksesCheck.valid && (
        <AccessExpiredOverlay siswa={siswa} settings={settings} onLogout={onLogout} />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Card Portal Orang Tua Neo-Brutalism */}
        <div className="neo-card p-6 sm:p-7 bg-emerald-300 dark:bg-[#181133] text-[#0f172a] dark:text-white flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white border-3 border-[#0f172a] shadow-[3px_3px_0px_#0f172a] flex items-center justify-center text-3xl shrink-0">
              👨‍👩‍👧
            </div>
            <div>
              <div className="inline-flex items-center gap-2 neo-badge px-3 py-1 bg-white text-[#0f172a] text-xs font-black mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>PORTAL ORANG TUA</span>
                <span>•</span>
                <span>PEMANTAUAN AKADEMIK</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Selamat Datang, {siswa.nama_ortu || 'Bapak/Ibu Orang Tua'} 👋
              </h1>
              <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-purple-200 mt-0.5">
                Memantau hasil evaluasi dan analisa persiapan seleksi masuk perguruan tinggi ananda{' '}
                <strong className="underline decoration-purple-600 underline-offset-4 font-black">
                  {siswa.nama_siswa}
                </strong>
                .
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative z-10 self-end md:self-center">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="neo-btn-sm px-3.5 py-2.5 bg-white hover:bg-purple-100 text-[#0f172a] font-black text-xs shadow-[2.5px_2.5px_0px_#0f172a] flex items-center gap-1.5"
              title="Perbarui analisa dari database cloud"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
              <span>{isRefreshing ? 'Memuat...' : 'Sinkronkan'}</span>
            </button>

            <button
              onClick={onLogout}
              className="neo-btn-sm px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-[2.5px_2.5px_0px_#0f172a] flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Profil Singkat Siswa Card */}
        <div className="neo-card p-5 bg-white dark:bg-[#181133]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-700 dark:text-purple-300 block text-[10px] font-black uppercase tracking-wider">Nama Ananda</span>
                <strong className="text-[#0f172a] dark:text-white font-black text-sm truncate block">{siswa.nama_siswa}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <IdCard className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-700 dark:text-purple-300 block text-[10px] font-black uppercase tracking-wider">NIS Siswa</span>
                <strong className="font-mono text-purple-700 dark:text-purple-300 font-black block">{siswa.nis}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <School className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-700 dark:text-purple-300 block text-[10px] font-black uppercase tracking-wider">Kelas &amp; Jurusan</span>
                <strong className="text-[#0f172a] dark:text-white font-bold block">{siswa.kelas}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-700 dark:text-purple-300 block text-[10px] font-black uppercase tracking-wider">Asal Sekolah</span>
                <strong className="text-[#0f172a] dark:text-white font-bold truncate block">{siswa.asal_sekolah}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <GraduationCap className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-700 dark:text-purple-300 block text-[10px] font-black uppercase tracking-wider">Program</span>
                <span className="neo-badge px-2 py-0.5 bg-purple-200 text-[#0f172a] text-[9px] font-black mt-0.5 inline-block">
                  {siswa.pilihan_program}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-700 dark:text-purple-300 block text-[10px] font-black uppercase tracking-wider">Masa Akses</span>
                <span className={`neo-badge px-2 py-0.5 text-[9px] font-black mt-0.5 inline-block ${
                  aksesCheck.valid ? 'bg-emerald-300 text-[#0f172a]' : 'bg-rose-400 text-white'
                }`}>
                  {siswa.akses || '1 BULAN'} {aksesCheck.valid ? '(AKTIF)' : '(EXPIRED)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigasi Khusus Hasil Analisa untuk Orang Tua */}
        {showSNBP && showSNBT && (
          <div className="flex items-center gap-3 p-2 neo-card bg-purple-100 dark:bg-[#181133]">
            <button
              onClick={() => setActiveTab('snbp')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-[#0f172a] transition-all ${
                activeTab === 'snbp'
                  ? 'bg-purple-600 text-white shadow-[3px_3px_0px_#0f172a] -translate-y-0.5'
                  : 'bg-white dark:bg-[#1E1540] text-[#0f172a] dark:text-purple-200 hover:bg-purple-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Hasil Analisa SNBP (Jalur Prestasi Rapor)</span>
            </button>

            <button
              onClick={() => setActiveTab('snbt')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-[#0f172a] transition-all ${
                activeTab === 'snbt'
                  ? 'bg-rose-500 text-white shadow-[3px_3px_0px_#0f172a] -translate-y-0.5'
                  : 'bg-white dark:bg-[#1E1540] text-[#0f172a] dark:text-purple-200 hover:bg-rose-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Hasil Analisa SNBT (Jalur Tes UTBK)</span>
            </button>
          </div>
        )}

        {/* Info Banner Mode Read-Only Orang Tua */}
        <div className="neo-card-sm p-3.5 bg-cyan-100 dark:bg-cyan-950/40 text-[#0f172a] dark:text-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0f172a] shrink-0" />
            <span>
              Menampilkan laporan lengkap hasil kalkulasi peluang kelulusan ananda{' '}
              <strong>{siswa.nama_siswa}</strong> berdasarkan data nilai akademik terbaru di cloud.
            </span>
          </div>
          <span className="neo-badge px-2.5 py-0.5 bg-white text-[#0f172a] text-[10px] font-black shrink-0 self-start sm:self-auto">
            Mode Orang Tua: Laporan Penuh
          </span>
        </div>

        {/* KONTEN ANALISA LENGKAP / FULL */}
        <div key={refreshKey} className="space-y-6">
          {/* Tampilkan SNBP Analisa Full jika aktif */}
          {showSNBP && (!showSNBT || activeTab === 'snbp') && (
            <div className="space-y-4">
              <SNBPAnalisa siswa={siswa} />
            </div>
          )}

          {/* Tampilkan SNBT Analisa Full jika aktif */}
          {showSNBT && (!showSNBP || activeTab === 'snbt') && (
            <div className="space-y-4">
              <SNBTAnalisa siswa={siswa} />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-xs font-bold text-[#0f172a] dark:text-purple-200 py-6 border-t-2 border-[#0f172a]/20 bg-purple-100/60 dark:bg-[#160E2E] rounded-2xl">
          <div className="font-black text-sm text-[#0f172a] dark:text-amber-300">© 2027 AnalisaKu by. Pak GuruAI</div>
          <div className="mt-1 text-xs text-slate-700 dark:text-purple-300">Dikelola oleh {settings.NAMA_LEMBAGA} • Portal Pendampingan Orang Tua Real-Time</div>
        </footer>
      </div>
    </div>
  );
};
