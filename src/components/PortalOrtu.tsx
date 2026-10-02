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

  // Default active tab sesuai pilihan program siswa
  const [activeTab, setActiveTab] = useState<'snbp' | 'snbt'>(
    siswa.pilihan_program === 'SNBT' ? 'snbt' : 'snbp'
  );

  // Key untuk force remount komponen analisa saat tombol refresh ditekan
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
    <div className="min-h-screen bg-[#F7F4FF] dark:bg-[#0D0920] text-[#1A0835] dark:text-[#EDE8FF] py-6 px-3 sm:px-6 lg:px-8">
      {/* Expired Access Blocking Overlay */}
      {!aksesCheck.valid && (
        <AccessExpiredOverlay siswa={siswa} settings={settings} onLogout={onLogout} />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Card Portal Orang Tua */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/20">
              👨‍👩‍👧
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-purple-100 text-xs font-bold mb-1 border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Portal Orang Tua Siswa</span>
                <span>•</span>
                <span>Hasil Analisa Lengkap</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Selamat Datang, {siswa.nama_ortu || 'Bapak/Ibu Orang Tua'}
              </h1>
              <p className="text-xs sm:text-sm text-purple-100/90 mt-0.5">
                Memantau hasil evaluasi dan analisa persiapan seleksi masuk perguruan tinggi ananda{' '}
                <strong className="text-white underline decoration-purple-300 underline-offset-2">
                  {siswa.nama_siswa}
                </strong>
                .
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 self-end md:self-center">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-white/20 shadow-sm"
              title="Perbarui analisa dari database cloud"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-200' : ''}`} />
              <span>{isRefreshing ? 'Memuat...' : 'Sinkronkan'}</span>
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Profil Singkat Siswa Card */}
        <div className="bg-white dark:bg-[#160E2E] rounded-2xl border border-purple-100 dark:border-purple-950/40 p-5 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Nama Ananda</span>
                <strong className="text-gray-900 dark:text-white font-bold text-sm truncate block">{siswa.nama_siswa}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <IdCard className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">NIS Siswa</span>
                <strong className="font-mono text-purple-700 dark:text-purple-300 font-bold block">{siswa.nis}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <School className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Kelas & Jurusan</span>
                <strong className="text-gray-900 dark:text-white font-bold block">{siswa.kelas}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Asal Sekolah</span>
                <strong className="text-gray-900 dark:text-white font-bold truncate block">{siswa.asal_sekolah}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <GraduationCap className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Program Bimbingan</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200">
                  {siswa.pilihan_program}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Paket Akses</span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold block">{siswa.akses || 'AKTIF'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigasi Khusus Hasil Analisa untuk Orang Tua */}
        {showSNBP && showSNBT && (
          <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#160E2E] rounded-2xl border border-purple-100 dark:border-purple-950/40 shadow-sm">
            <button
              onClick={() => setActiveTab('snbp')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'snbp'
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/25'
                  : 'text-gray-600 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Hasil Analisa SNBP (Jalur Prestasi Rapor)</span>
            </button>

            <button
              onClick={() => setActiveTab('snbt')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'snbt'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'text-gray-600 dark:text-purple-200 hover:bg-red-50 dark:hover:bg-red-950/40'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Hasil Analisa SNBT (Jalur Tes UTBK)</span>
            </button>
          </div>
        )}

        {/* Info Banner Mode Read-Only Orang Tua */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              Menampilkan laporan lengkap hasil kalkulasi peluang kelulusan ananda{' '}
              <strong>{siswa.nama_siswa}</strong> berdasarkan data nilai akademik terbaru yang terhubung ke cloud.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-bold text-[11px]">
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
        <footer className="text-center text-xs text-gray-400 py-6 border-t border-purple-100 dark:border-purple-950/40">
          <div>AnalisaKu 2027 by {settings.NAMA_LEMBAGA} © 2027</div>
          <div className="mt-0.5">Portal Pendampingan Orang Tua • Terhubung ke Database Cloud</div>
        </footer>
      </div>
    </div>
  );
};
