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
    <div className="min-h-screen bg-[#f3e8ff] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f8fafc] flex">
      {/* Expired Access Blocking Overlay */}
      {!aksesCheck.valid && (
        <AccessExpiredOverlay siswa={siswa} settings={settings} onLogout={onLogout} />
      )}

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      {/* Sidebar (260px desktop, off-canvas on mobile) */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 w-[260px] bg-white dark:bg-[#160E2E] border-r-3 border-[#0f172a] shadow-[4px_0px_0px_#0f172a] flex flex-col justify-between transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo / Brand Header */}
          <div className="p-4 border-b-3 border-[#0f172a] bg-purple-100 dark:bg-purple-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] flex items-center justify-center font-black text-xl">
                🎓
              </div>
              <div>
                <div className="font-black text-sm text-[#0f172a] dark:text-white tracking-tight">
                  AnalisaKu 2027
                </div>
                <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300 truncate max-w-[140px]">
                  Fix Lolos PTN • Cabang {siswa.cabang || 'ONLINE'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-lg border-2 border-[#0f172a] bg-rose-100 text-[#0f172a] md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Card (Gamified Neo-Brutalism) */}
          <div className="p-3.5 mx-3 my-3 rounded-2xl bg-purple-100 dark:bg-purple-950/40 border-2.5 border-[#0f172a] shadow-[3px_3px_0px_#0f172a]">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-xl bg-amber-200 border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-2xl shrink-0">
                👧🏻
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black text-xs text-[#0f172a] dark:text-white truncate">
                  {siswa.nama_siswa || 'Gita'}
                </div>
                <div className="text-[10px] font-bold text-gray-600 dark:text-purple-300 truncate">
                  {siswa.kelas || 'Kelas 12'} • {siswa.asal_sekolah || 'SMA Negeri'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t-2 border-[#0f172a]/20">
              <span className="neo-badge px-2 py-0.5 bg-cyan-200 text-[#0f172a] text-[9px] font-black">
                {siswa.pilihan_program || 'SNBP + SNBT'} ({siswa.akses || '1 BULAN'})
              </span>
              <span
                className={`neo-badge px-2 py-0.5 text-[9px] font-black ${
                  aksesCheck.valid
                    ? 'bg-emerald-300 text-[#0f172a]'
                    : 'bg-rose-400 text-white'
                }`}
              >
                {aksesCheck.valid ? '● AKTIF' : 'EXPIRED'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="px-3 overflow-y-auto max-h-[calc(100vh-295px)] space-y-1.5 text-xs font-bold">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const prevItem = menuItems[idx - 1];
              const isNewSection = !prevItem || prevItem.section !== item.section;

              return (
                <React.Fragment key={item.id}>
                  {isNewSection && (
                    <div className="pt-2 pb-0.5 px-2 text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-purple-300">
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
                    className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 transition-all font-black text-xs ${
                      isActive
                        ? item.section === 'snbt'
                          ? 'bg-rose-500 text-white border-2 border-[#0f172a] shadow-[3px_3px_0px_#0f172a] -translate-y-0.5'
                          : 'bg-purple-600 text-white border-2 border-[#0f172a] shadow-[3px_3px_0px_#0f172a] -translate-y-0.5'
                        : 'text-gray-700 dark:text-purple-200 border-2 border-transparent hover:border-[#0f172a] hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:shadow-[2px_2px_0px_#0f172a]'
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
        <div className="p-3 border-t-3 border-[#0f172a] bg-purple-50 dark:bg-purple-950/60 space-y-2">
          <button
            onClick={onToggleDarkMode}
            className="w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border-2 border-[#0f172a] bg-white dark:bg-[#1E1540] shadow-[2px_2px_0px_#0f172a] hover:translate-x-0.5"
          >
            <span className="flex items-center gap-2 font-black text-[#0f172a] dark:text-white">
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-purple-600" />}
              <span>{darkMode ? 'Mode Terang' : 'Mode Gelap Cyberpunk'}</span>
            </span>
          </button>

          <button
            onClick={onLogout}
            className="w-full px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 border-2 border-[#0f172a] bg-rose-200 dark:bg-rose-950 text-rose-900 dark:text-rose-200 shadow-[2px_2px_0px_#0f172a] hover:bg-rose-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header / Navbar Utama Neo-Brutalism */}
        <header className="sticky top-0 z-30 bg-white dark:bg-[#160E2E] border-b-3 border-[#0f172a] shadow-[0_4px_0_#0f172a] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-xl border-2 border-[#0f172a] bg-purple-100 text-[#0f172a] md:hidden shadow-[2px_2px_0px_#0f172a]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo in Header */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] flex items-center justify-center font-black text-lg">
                🎓
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-[#0f172a] dark:text-white leading-tight">
                  AnalisaKu 2027
                </h1>
                <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  Fix Lolos PTN • Cabang {siswa.cabang || 'ONLINE'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Top Status Badge Neo-Brutalism */}
            <div className="hidden md:inline-flex neo-badge px-3 py-1 bg-amber-200 text-[#0f172a] text-xs font-black">
              🚀 Road to PTN 2027: Konsisten &amp; Juara!
            </div>

            {/* Live WIB Clock */}
            <div className="hidden sm:inline-flex neo-badge px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-[#0f172a] dark:text-purple-200 text-xs font-mono font-black">
              <Clock className="w-3 h-3 text-purple-700 mr-1 inline" />
              <span>{wibTime}</span>
            </div>

            {/* Action Button: Portal Ortu */}
            <button
              onClick={() => {
                alert(`Info Portal Orang Tua:\nNIS: ${siswa.nis}\nNama Siswa: ${siswa.nama_siswa}\nNama Orang Tua: ${siswa.nama_ortu}\nPassword Ortu: 4 digit terakhir no HP orang tua.\n\nAnda dapat membuka portal ortu melalui menu Login Orang Tua.`);
              }}
              className="neo-btn bg-cyan-200 hover:bg-cyan-300 text-[#0f172a] text-xs font-black px-3.5 py-1.5 shadow-[2px_2px_0px_#0f172a]"
              title="Akses Portal Orang Tua"
            >
              👨‍👩‍👧 Portal Ortu
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
