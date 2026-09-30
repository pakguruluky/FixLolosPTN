import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Compass,
  TrendingUp,
  FileText,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  RefreshCw,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { Siswa, AppSettings } from '../../types';
import { checkAkses } from '../../lib/calc';
import { AccessExpiredOverlay } from './AccessExpiredOverlay';
import { StudentDashboard } from './StudentDashboard';
import { SNBPRapor } from './SNBPRapor';
import { SNBPTKA } from './SNBPTKA';
import { SNBPPrestasi } from './SNBPPrestasi';
import { SNBPPilihan } from './SNBPPilihan';
import { SNBPAnalisa } from './SNBPAnalisa';
import { SNBTTryOut } from './SNBTTryOut';
import { SNBTPilihan } from './SNBTPilihan';
import { SNBTAnalisa } from './SNBTAnalisa';
import { ModulViewer } from './ModulViewer';
import { StudentProfile } from './StudentProfile';

interface StudentLayoutProps {
  siswa: Siswa;
  settings: AppSettings;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({
  siswa: initialSiswa,
  settings,
  darkMode,
  onToggleDarkMode,
  onLogout,
}) => {
  const [siswa, setSiswa] = useState<Siswa>(initialSiswa);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Live WIB clock
  const [wibTime, setWibTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setWibTime(
        now.toLocaleTimeString('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const aksesCheck = checkAkses(siswa);

  const showSNBP = siswa.pilihan_program === 'SNBP' || siswa.pilihan_program === 'SNBP+SNBT';
  const showSNBT = siswa.pilihan_program === 'SNBT' || siswa.pilihan_program === 'SNBP+SNBT';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },

    // SNBP Section
    ...(showSNBP
      ? [
          { id: 'snbp_rapor', label: 'Nilai Rapor', icon: BookOpen, section: 'snbp' },
          { id: 'snbp_tka', label: 'Nilai TKA', icon: Award, section: 'snbp' },
          { id: 'snbp_prestasi', label: 'Prestasi', icon: Award, section: 'snbp' },
          { id: 'snbp_pilihan', label: 'Pilihan PTN SNBP', icon: Compass, section: 'snbp' },
          { id: 'snbp_analisa', label: 'Analisa SNBP', icon: TrendingUp, section: 'snbp' },
        ]
      : []),

    // SNBT Section
    ...(showSNBT
      ? [
          { id: 'snbt_to', label: 'Nilai Try Out', icon: FileText, section: 'snbt' },
          { id: 'snbt_pilihan', label: 'Pilihan PTN SNBT', icon: Compass, section: 'snbt' },
          { id: 'snbt_analisa', label: 'Analisa SNBT', icon: TrendingUp, section: 'snbt' },
        ]
      : []),

    // Umum
    { id: 'modul', label: 'Modul Belajar', icon: BookOpen, section: 'umum' },
    { id: 'profile', label: 'Profil Siswa', icon: User, section: 'umum' },
  ];

  const getPageTitle = () => {
    const item = menuItems.find((m) => m.id === activeTab);
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F7F4FF] dark:bg-[#0D0920] text-[#1A0835] dark:text-[#EDE8FF] flex">
      {/* Expired Access Blocking Overlay */}
      {!aksesCheck.valid && (
        <AccessExpiredOverlay siswa={siswa} settings={settings} onLogout={onLogout} />
      )}

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar (252px desktop, 220px tablet, off-canvas on mobile) */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 w-[252px] md:w-[220px] lg:w-[252px] bg-white dark:bg-[#160E2E] border-r border-purple-100 dark:border-purple-950/40 flex flex-col justify-between transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo / Brand Header */}
          <div className="p-5 border-b border-purple-100 dark:border-purple-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C3AED] via-purple-600 to-[#F59E0B] flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/20">
                🎓
              </div>
              <div>
                <div className="font-extrabold text-sm text-purple-900 dark:text-purple-100">
                  AnalisaKu 2027
                </div>
                <div className="text-[10px] text-gray-500 dark:text-purple-300 truncate max-w-[130px]">
                  {settings.NAMA_LEMBAGA}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Brief Card in Sidebar */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40">
            <div className="font-bold text-xs text-gray-900 dark:text-white truncate">
              {siswa.nama_siswa}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-purple-300 truncate mt-0.5">
              {siswa.kelas || 'Kelas 12'} • {siswa.cabang}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-100">
                {siswa.pilihan_program}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  aksesCheck.valid
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                }`}
              >
                {siswa.akses} {aksesCheck.valid ? '' : '(EXPIRED)'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="px-3 overflow-y-auto max-h-[calc(100vh-270px)] space-y-1 text-xs font-semibold">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const prevItem = menuItems[idx - 1];
              const isNewSection = !prevItem || prevItem.section !== item.section;

              return (
                <React.Fragment key={item.id}>
                  {isNewSection && (
                    <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-purple-400/60">
                      {item.section === 'snbp'
                        ? 'Jalur SNBP (Rapor)'
                        : item.section === 'snbt'
                        ? 'Jalur SNBT (Tes)'
                        : item.section === 'umum'
                        ? 'Fasilitas'
                        : 'Menu Utama'}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                      isActive
                        ? item.section === 'snbt'
                          ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                          : 'bg-purple-700 text-white shadow-md shadow-purple-600/20'
                        : 'text-gray-600 dark:text-purple-200/80 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-purple-100 dark:border-purple-950/40 space-y-2">
          <button
            onClick={onToggleDarkMode}
            className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-950/40 text-gray-600 dark:text-purple-200"
          >
            <span className="flex items-center gap-2">
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
              <span>{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
            </span>
          </button>

          <button
            onClick={onLogout}
            className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-[#160E2E]/80 border-b border-purple-100 dark:border-purple-950/40 h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl text-gray-600 dark:text-purple-200 md:hidden hover:bg-purple-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-none">
                {getPageTitle()}
              </h1>
              <span className="text-[10px] text-purple-600 dark:text-purple-300 font-bold hidden sm:inline-block mt-0.5">
                {settings.NAMA_LEMBAGA} • Cabang {siswa.cabang}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Teenage Active Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950/60 border border-purple-200 dark:border-purple-800 text-[11px] font-black text-purple-900 dark:text-purple-200">
              <span className="text-amber-500 animate-pulse">🔥</span>
              <span>Road to PTN 2027: Tetap Konsisten &amp; Juara! 🚀</span>
            </div>

            {/* Live WIB Clock */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40 text-xs font-bold font-mono text-purple-800 dark:text-purple-300">
              <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{wibTime}</span>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-xl text-gray-500 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
              title="Refresh Halaman"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <StudentDashboard
              siswa={siswa}
              settings={settings}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'snbp_rapor' && <SNBPRapor siswa={siswa} />}
          {activeTab === 'snbp_tka' && <SNBPTKA siswa={siswa} />}
          {activeTab === 'snbp_prestasi' && <SNBPPrestasi siswa={siswa} />}
          {activeTab === 'snbp_pilihan' && <SNBPPilihan siswa={siswa} />}
          {activeTab === 'snbp_analisa' && <SNBPAnalisa siswa={siswa} />}

          {activeTab === 'snbt_to' && <SNBTTryOut siswa={siswa} />}
          {activeTab === 'snbt_pilihan' && <SNBTPilihan siswa={siswa} />}
          {activeTab === 'snbt_analisa' && <SNBTAnalisa siswa={siswa} />}

          {activeTab === 'modul' && <ModulViewer siswa={siswa} />}
          {activeTab === 'profile' && (
            <StudentProfile siswa={siswa} onProfileUpdated={(up) => setSiswa(up)} />
          )}
        </main>

        {/* Page Footer */}
        <footer className="py-6 px-6 text-center text-xs text-gray-400 dark:text-purple-400/60 border-t border-purple-100 dark:border-purple-950/40">
          <div>AnalisaKu 2027 by {settings.NAMA_LEMBAGA} © 2027</div>
          <div className="mt-0.5">@Copyright Pak Guru AI 2026</div>
        </footer>
      </div>
    </div>
  );
};
