import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
  TrendingUp,
  FileCheck,
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  MessageCircle,
  Users,
  CheckCircle2,
  Calendar,
  Flame,
  Zap,
  Target,
  Layers,
  Sun,
  Moon,
  ArrowUp,
} from 'lucide-react';
import { AppSettings } from '../types';

interface LandingPageProps {
  settings: AppSettings;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenLogin: (defaultTab?: 'siswa' | 'ortu' | 'daftar' | 'admin') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  settings,
  darkMode = false,
  onToggleDarkMode,
  onOpenLogin,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeNav, setActiveNav] = useState('hero');

  // Monitor scroll for back-to-top and active section
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      const sections = ['hero', 'jalur', 'fitur', 'portal', 'faq'];
      const scrollPosition = window.scrollY + 160;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveNav(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveNav(id);
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqs = [
    {
      q: 'Bagaimana cara kerja formula rasionalisasi SNBT 60 : 40?',
      a: 'Formula AnalisaKu 2027 membagi skor UTBK secara presisi: 60% Tes Potensi Skolastik (PU, PBM, PPU, PK masing-masing berbobot 15%) dan 40% Literasi & Penalaran Matematika (LBI 13.33%, LBE 13.33%, PM 13.34%). Skor tertimbang ini dikomparasikan langsung dengan target Nilai Akhir Masuk (NAM) prodi tujuan.',
    },
    {
      q: 'Apakah saya bisa mengikuti simulasi SNBP dan SNBT sekaligus?',
      a: 'Tentu saja! Siswa dapat memilih program ganda (SNBP+SNBT). Anda dapat memasukkan nilai rapor semester 1–5 serta nilai TKA, sekaligus memantau progres 9 Try Out berkala untuk jalur tes.',
    },
    {
      q: 'Berapa lama masa akses akun yang tersedia?',
      a: 'Saat pendaftaran, siswa dapat memilih paket masa akses 1 Hari (Trial kilat), 1 Bulan (Intensif bulanan), 6 Bulan (Semesteran), atau 1 Tahun (Full Season SNBP+SNBT sampai pengumuman kelulusan).',
    },
    {
      q: 'Bagaimana jika saya lupa password akun?',
      a: 'Anda dapat menghubungi Admin cabang atau bimbingan belajar melalui kontak admin/bantuan, atau meminta admin mereset password akun Anda ke kata sandi standar.',
    },
    {
      q: 'Apakah orang tua memiliki akses portal terpisah?',
      a: 'Ya, orang tua dapat login melalui tab khusus menggunakan NIS siswa dan 4 digit terakhir nomor HP orang tua. Portal orang tua menyajikan ringkasan analisis peluang, grafik capaian, dan unduhan laporan A4 resmi secara praktis dan transparan.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3e8ff] dark:bg-[#0f0a1f] text-[#0f172a] dark:text-[#f8fafc] transition-colors duration-300 relative selection:bg-amber-300 selection:text-[#0f172a]">
      {/* Decorative Neo-Brutalism Dot Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20 neo-dot-grid z-0" />

      {/* Floating Retro Shapes */}
      <div className="fixed -top-12 -right-12 w-64 h-64 rounded-full bg-purple-300/30 blur-2xl pointer-events-none z-0" />
      <div className="fixed -bottom-16 -left-16 w-80 h-80 rounded-full bg-amber-300/25 blur-2xl pointer-events-none z-0" />

      {/* 1. HEADER / NAVBAR UTAMA */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#181133] border-b-3 border-[#0f172a] shadow-[0px_4px_0px_#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          {/* Brand Logo & Sub-tagline */}
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, 'hero')}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-300 border-3 border-[#0f172a] shadow-[3px_3px_0px_#0f172a] flex items-center justify-center font-black text-2xl shrink-0 group-hover:rotate-6 transition-transform">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a] dark:text-white">
                  AnalisaKu 2027
                </span>
                <span className="hidden sm:inline-flex neo-badge px-2 py-0.5 bg-purple-200 text-[#0f172a] text-[10px] font-black">
                  EDISI SMA
                </span>
              </div>
              <p className="text-[11px] font-black text-purple-700 dark:text-purple-300 tracking-wide">
                Fix Lolos PTN • Cabang ONLINE
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links (Smooth Scroll) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#f3e8ff] dark:bg-[#201548] p-1.5 rounded-2xl border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a]">
            {[
              { id: 'hero', label: 'Beranda' },
              { id: 'jalur', label: 'Jalur SNBP & SNBT' },
              { id: 'fitur', label: 'Fitur' },
              { id: 'portal', label: '3 Portal' },
              { id: 'faq', label: 'FAQ' },
            ].map((item) => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-300 text-[#0f172a] shadow-[2px_2px_0px_#0f172a] -translate-y-0.5'
                      : 'text-slate-800 dark:text-purple-200 hover:text-purple-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-purple-900/50'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Action Buttons & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Theme Toggle Button */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                aria-label="Toggle Light/Dark Theme"
                className="neo-btn p-2 sm:p-2.5 bg-amber-300 dark:bg-purple-700 text-[#0f172a] dark:text-amber-300 text-xs font-black shadow-[2px_2px_0px_#0f172a]"
                title={darkMode ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#0f172a]" />}
              </button>
            )}

            <button
              onClick={() => onOpenLogin('ortu')}
              className="neo-btn px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-300 hover:bg-emerald-400 text-[#0f172a] text-xs sm:text-sm font-black shadow-[3px_3px_0px_#0f172a]"
            >
              👨‍👩‍👧 <span className="hidden sm:inline">Portal </span>Ortu
            </button>
            <button
              onClick={() => onOpenLogin('siswa')}
              className="neo-btn px-3.5 sm:px-5 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-black shadow-[3px_3px_0px_#0f172a] flex items-center gap-1.5"
            >
              <span>Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar (Horizontal Smooth Scroll) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 bg-[#f3e8ff] dark:bg-[#140e2b] border-t-2 border-[#0f172a]/20 scrollbar-none">
          {[
            { id: 'hero', label: '🏠 Beranda' },
            { id: 'jalur', label: '🎯 SNBP & SNBT' },
            { id: 'fitur', label: '⚡ Fitur' },
            { id: 'portal', label: '👥 3 Portal' },
            { id: 'faq', label: '❓ FAQ' },
          ].map((item) => {
            const isActive = activeNav === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`whitespace-nowrap px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  isActive
                    ? 'bg-amber-300 text-[#0f172a] border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a]'
                    : 'text-slate-800 dark:text-purple-200 bg-white/70 dark:bg-purple-950/60'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </header>

      {/* 2. HERO SECTION (NEO-BRUTALISM RPG STYLE) */}
      <section id="hero" className="scroll-mt-28 relative z-10 pt-10 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Playful Stickers Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="neo-badge px-3 py-1 bg-amber-300 text-[#0f172a] text-xs font-black rotate-[-2deg]">
            🔥 100% Standar SNPMB
          </span>
          <span className="neo-badge px-3 py-1 bg-cyan-200 text-[#0f172a] text-xs font-black rotate-[2deg]">
            ⚡ Algoritma IRT &amp; Rapor Terbobot
          </span>
          <span className="neo-badge px-3 py-1 bg-pink-200 text-[#0f172a] text-xs font-black rotate-[-1deg]">
            🛡️ Akses Fleksibel 1 Hari - 1 Tahun
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0f172a] dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Analisis Peluang Lolos{' '}
          <span className="inline-block px-3 py-1 bg-purple-600 text-white rounded-2xl border-3 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] rotate-[-1deg]">
            PTN Impianmu
          </span>{' '}
          Lebih Terarah &amp; Akurat!
        </h1>

        <p className="mt-6 text-sm sm:text-base lg:text-lg font-bold text-slate-800 dark:text-purple-100 max-w-2xl mx-auto leading-relaxed">
          Kombinasi analisis komprehensif nilai rapor semester 1–5 terbobot, skor Uji TKA IRT, dan formula UTBK 60:40 dengan database ribuan prodi PTN se-Indonesia.
        </p>

        {/* Main CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => onOpenLogin('siswa')}
            className="w-full sm:w-auto neo-btn px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-base sm:text-lg font-black shadow-[4px_4px_0px_#0f172a] flex items-center justify-center gap-2"
          >
            <span>🚀 Masuk ke Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => onOpenLogin('daftar')}
            className="w-full sm:w-auto neo-btn px-8 py-4 bg-amber-300 hover:bg-amber-400 text-[#0f172a] text-base sm:text-lg font-black shadow-[4px_4px_0px_#0f172a]"
          >
            ✨ Daftar Akun Baru
          </button>
        </div>

        {/* 3. TARGET PTN TRADING CARDS PREVIEW */}
        <div id="jalur" className="scroll-mt-28 mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {/* Card 1: SNBP */}
          <div className="neo-card p-5 bg-purple-100 dark:bg-[#201548] hover:rotate-[-1deg] transition-transform">
            <div className="flex items-center justify-between mb-3">
              <span className="neo-badge px-2.5 py-0.5 bg-purple-600 text-white text-[10px] font-black">
                JALUR RAPOR
              </span>
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-black text-base text-[#0f172a] dark:text-white mb-1">SNBP Akademik</h3>
            <p className="text-xs font-bold text-slate-800 dark:text-purple-200 leading-relaxed">
              Formulasi 3 pilar: 50% Rapor (Sem 1-5), 30% Prestasi &amp; TKA, 20% Rekam Jejak Sekolah, plus poin keketatan prodi favorit.
            </p>
            <div className="mt-4 pt-3 border-t-2 border-[#0f172a]/20 dark:border-purple-700/50 flex justify-between items-center text-[11px] font-black text-purple-900 dark:text-purple-300">
              <span>Maksimal 100 Poin</span>
              <span className="neo-badge px-2 py-0.5 bg-white dark:bg-[#140c2e] text-[#0f172a] dark:text-purple-200">10 Pilar</span>
            </div>
          </div>

          {/* Card 2: SNBT */}
          <div className="neo-card p-5 bg-rose-100 dark:bg-[#34162e] hover:rotate-[1deg] transition-transform">
            <div className="flex items-center justify-between mb-3">
              <span className="neo-badge px-2.5 py-0.5 bg-rose-500 text-white text-[10px] font-black">
                JALUR UTBK TES
              </span>
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-black text-base text-[#0f172a] dark:text-white mb-1">SNBT Formula 60:40</h3>
            <p className="text-xs font-bold text-slate-800 dark:text-rose-200 leading-relaxed">
              Perhitungan 60% Tes Potensi Skolastik (PU, PBM, PPU, PK) + 40% Literasi &amp; Penalaran Mat dari 9 seri Try Out berkala.
            </p>
            <div className="mt-4 pt-3 border-t-2 border-[#0f172a]/20 dark:border-rose-800/50 flex justify-between items-center text-[11px] font-black text-rose-900 dark:text-rose-300">
              <span>9 Seri Try Out</span>
              <span className="neo-badge px-2 py-0.5 bg-white dark:bg-[#140c2e] text-[#0f172a] dark:text-rose-200">Skor IRT</span>
            </div>
          </div>

          {/* Card 3: Real-Time What-If */}
          <div className="neo-card p-5 bg-amber-100 dark:bg-[#332213] hover:rotate-[-1deg] transition-transform">
            <div className="flex items-center justify-between mb-3">
              <span className="neo-badge px-2.5 py-0.5 bg-amber-400 text-[#0f172a] text-[10px] font-black">
                SIMULATOR
              </span>
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-black text-base text-[#0f172a] dark:text-white mb-1">Analisa Real-Time</h3>
            <p className="text-xs font-bold text-slate-800 dark:text-amber-200 leading-relaxed">
              Simulasikan skenario nilai rapor dan target try out secara langsung dengan indikator persentase kelulusan dinamis.
            </p>
            <div className="mt-4 pt-3 border-t-2 border-[#0f172a]/20 dark:border-amber-800/50 flex justify-between items-center text-[11px] font-black text-amber-900 dark:text-amber-300">
              <span>What-If Engine</span>
              <span className="neo-badge px-2 py-0.5 bg-white dark:bg-[#140c2e] text-[#0f172a] dark:text-amber-200">Interaktif</span>
            </div>
          </div>

          {/* Card 4: 3 Rekomendasi Cadangan */}
          <div className="neo-card p-5 bg-emerald-100 dark:bg-[#122c26] hover:rotate-[1deg] transition-transform">
            <div className="flex items-center justify-between mb-3">
              <span className="neo-badge px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-black">
                CADANGAN AMAN
              </span>
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="font-black text-base text-[#0f172a] dark:text-white mb-1">3 Alternatif Prodi</h3>
            <p className="text-xs font-bold text-slate-800 dark:text-emerald-200 leading-relaxed">
              Rekomendasi prodi alternatif paling rasional dan berpeluang tinggi jika pilihan utama sangat ketat.
            </p>
            <div className="mt-4 pt-3 border-t-2 border-[#0f172a]/20 dark:border-emerald-800/50 flex justify-between items-center text-[11px] font-black text-emerald-900 dark:text-emerald-300">
              <span>Database Nasional</span>
              <span className="neo-badge px-2 py-0.5 bg-white dark:bg-[#140c2e] text-[#0f172a] dark:text-emerald-200">Smart Match</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FITUR LENGKAP NEO-BRUTALISM GRID */}
      <section id="fitur" className="scroll-mt-28 py-16 bg-white dark:bg-[#181133] border-y-3 border-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 neo-badge px-3 py-1 bg-cyan-200 text-[#0f172a] text-xs font-black mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ARSITEKTUR FITUR MODERN</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0f172a] dark:text-white">
              Fitur Lengkap untuk Pejuang PTN 2027
            </h2>
            <p className="mt-2 text-sm font-bold text-slate-700 dark:text-purple-200">
              Dirancang dengan standar baku seleksi nasional SNPMB Kemendikbudristek untuk siswa SMA seluruh Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: FileCheck,
                color: 'bg-purple-200',
                badge: 'K13 & MERDEKA',
                title: 'Input Rapor & TKA IRT',
                desc: 'Mendukung peminatan Saintek, Soshum, Bahasa, Campuran, serta konversi IRT 200–800 dengan GAP analysis.',
              },
              {
                icon: TrendingUp,
                color: 'bg-rose-200',
                badge: 'FORMULA 60:40',
                title: '9 Seri Try Out UTBK',
                desc: 'Pratinjau otomatis skor tertimbang 60:40 saat mengetik skor, grafik tren TO 1 s.d. 9, dan evaluasi subtes.',
              },
              {
                icon: Compass,
                color: 'bg-cyan-200',
                badge: '4 TIER KEKETATAN',
                title: 'Pilihan PTN & Prodi',
                desc: 'Maksimal 2 pilihan SNBP dengan validasi provinsi sekolah dan 4 pilihan prodi SNBT ber-NAM target.',
              },
              {
                icon: Award,
                color: 'bg-amber-200',
                badge: 'POIN MAKS. 20',
                title: 'Sertifikat & Prestasi',
                desc: 'Penilaian bobot sertifikat terakreditasi tingkat Kota, Provinsi, Nasional hingga Internasional.',
              },
              {
                icon: BookOpen,
                color: 'bg-emerald-200',
                badge: 'ANTI-INSPEKSI',
                title: 'Modul Belajar Terproteksi',
                desc: 'Viewer materi belajar dan ringkasan rumus dengan watermark nama siswa dan keamanan anti-unduh liar.',
              },
              {
                icon: Users,
                color: 'bg-indigo-200',
                badge: 'AKSES KHUSUS',
                title: 'Portal Orang Tua',
                desc: 'Pantau kemajuan akademik anak dan unduh lembar laporan resmi evaluasi peluang kelulusan.',
              },
              {
                icon: ShieldCheck,
                color: 'bg-teal-200',
                badge: 'REALTIME CLOUD',
                title: 'Database Terkoneksi',
                desc: 'Semua hasil tersimpan dan tersinkronisasi otomatis ke cloud backend aman tanpa hilang saat ganti perangkat.',
              },
              {
                icon: Zap,
                color: 'bg-pink-200',
                badge: '4 PAKET MASA AKTIF',
                title: 'Pilihan Masa Akses',
                desc: 'Mendukung paket 1 Hari, 1 Bulan, 6 Bulan, dan 1 Tahun dengan sistem kedaluwarsa otomatis.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="neo-card p-5 bg-white dark:bg-[#1e1540] hover:-translate-y-1 transition-transform flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${f.color} border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-[#0f172a]`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="neo-badge px-2 py-0.5 bg-slate-100 dark:bg-[#140c2e] text-[#0f172a] dark:text-purple-200 text-[9px] font-black">
                        {f.badge}
                      </span>
                    </div>
                    <h3 className="font-black text-sm text-[#0f172a] dark:text-white mb-1.5">{f.title}</h3>
                    <p className="text-xs font-bold text-slate-700 dark:text-purple-200 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. TIGA PERAN PENGGUNA TERINTEGRASI */}
      <section id="portal" className="scroll-mt-28 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 neo-badge px-3 py-1 bg-amber-300 text-[#0f172a] text-xs font-black mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>SINERGI 3 AKTOR</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0f172a] dark:text-white">
            Tiga Portal Pengguna Terintegrasi
          </h2>
          <p className="mt-2 text-sm font-bold text-slate-800 dark:text-purple-200">
            Kolaborasi aktif antara siswa pejuang PTN, orang tua pendamping, dan pengelola bimbel/sekolah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role Siswa */}
          <div className="neo-card p-6 bg-purple-100 dark:bg-[#201548] flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white border-3 border-[#0f172a] shadow-[3px_3px_0px_#0f172a] flex items-center justify-center text-3xl mb-4">
                👧🏻
              </div>
              <span className="neo-badge px-2.5 py-0.5 bg-purple-600 text-white text-[10px] font-black mb-2">
                PORTAL SISWA
              </span>
              <h3 className="font-black text-xl text-[#0f172a] dark:text-white mt-1">Siswa Pejuang PTN</h3>
              <p className="text-xs font-bold text-slate-800 dark:text-purple-200 mt-2 leading-relaxed">
                Mengisi nilai rapor, skor TKA, latihan try out berkala, eksplorasi prodi, membaca modul belajar, dan cek kelayakan secara instan.
              </p>
            </div>
            <button
              onClick={() => onOpenLogin('siswa')}
              className="mt-6 neo-btn w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-[3px_3px_0px_#0f172a]"
            >
              Masuk Portal Siswa &rarr;
            </button>
          </div>

          {/* Role Orang Tua */}
          <div className="neo-card p-6 bg-emerald-100 dark:bg-[#122e25] flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white border-3 border-[#0f172a] shadow-[3px_3px_0px_#0f172a] flex items-center justify-center text-3xl mb-4">
                👨‍👩‍👧
              </div>
              <span className="neo-badge px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black mb-2">
                PORTAL ORANG TUA
              </span>
              <h3 className="font-black text-xl text-[#0f172a] dark:text-white mt-1">Orang Tua Pendamping</h3>
              <p className="text-xs font-bold text-slate-800 dark:text-emerald-200 mt-2 leading-relaxed">
                Akses aman dan transparan untuk memantau progres belajar anak, rasionalisasi prodi pilihan, dan konsultasi arah masa depan.
              </p>
            </div>
            <button
              onClick={() => onOpenLogin('ortu')}
              className="mt-6 neo-btn w-full py-2.5 bg-emerald-400 hover:bg-emerald-500 text-[#0f172a] text-xs font-black shadow-[3px_3px_0px_#0f172a]"
            >
              Masuk Portal Ortu &rarr;
            </button>
          </div>

          {/* Role Admin */}
          <div className="neo-card p-6 bg-amber-100 dark:bg-[#332213] flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-[#0f172a] border-3 border-[#0f172a] shadow-[3px_3px_0px_#0f172a] flex items-center justify-center text-3xl mb-4">
                🛡️
              </div>
              <span className="neo-badge px-2.5 py-0.5 bg-[#0f172a] text-amber-300 text-[10px] font-black mb-2">
                PORTAL PENGELOLA
              </span>
              <h3 className="font-black text-xl text-[#0f172a] dark:text-white mt-1">Admin Bimbingan Belajar</h3>
              <p className="text-xs font-bold text-slate-800 dark:text-amber-200 mt-2 leading-relaxed">
                Verifikasi pendaftaran siswa, kelola token registrasi, atur masa akses, upload modul belajar, dan pantau log aktivitas.
              </p>
            </div>
            <button
              onClick={() => onOpenLogin('admin')}
              className="mt-6 neo-btn w-full py-2.5 bg-amber-300 hover:bg-amber-400 text-[#0f172a] text-xs font-black shadow-[3px_3px_0px_#0f172a]"
            >
              Konsol Admin &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* 6. FAQ NEO-BRUTALISM ACCORDION */}
      <section id="faq" className="scroll-mt-28 py-16 bg-white dark:bg-[#181133] border-t-3 border-[#0f172a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 neo-badge px-3 py-1 bg-pink-200 text-[#0f172a] text-xs font-black mb-2">
              <span>❓ TANYA JAWAB</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0f172a] dark:text-white">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="neo-card bg-[#faf5ff] dark:bg-[#1f1540] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-black text-xs sm:text-sm text-[#0f172a] dark:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-purple-600 dark:text-purple-400' : 'text-slate-700 dark:text-purple-300'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs font-bold text-slate-800 dark:text-purple-200 leading-relaxed border-t-2 border-[#0f172a]/10 dark:border-purple-800/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-purple-200 dark:bg-[#0c0819] border-t-3 border-[#0f172a] py-10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-black text-[#0f172a] dark:text-white">
              AnalisaKu 2027 • High School Edition
            </span>
          </div>
          <p className="text-xs font-extrabold text-[#0f172a] dark:text-purple-200 max-w-md mx-auto">
            Sistem Rasionalisasi Peluang SNBP &amp; SNBT Terlengkap • Dikelola oleh {settings.NAMA_LEMBAGA}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenLogin('siswa')}
              className="neo-btn px-3.5 py-1.5 bg-white hover:bg-amber-200 text-[#0f172a] text-xs font-black shadow-[2px_2px_0px_#0f172a]"
            >
              Login Siswa
            </button>
            <button
              onClick={() => onOpenLogin('ortu')}
              className="neo-btn px-3.5 py-1.5 bg-white hover:bg-emerald-200 text-[#0f172a] text-xs font-black shadow-[2px_2px_0px_#0f172a]"
            >
              Portal Orang Tua
            </button>
            <button
              onClick={() => onOpenLogin('admin')}
              className="neo-btn px-3.5 py-1.5 bg-white hover:bg-cyan-200 text-[#0f172a] text-xs font-black shadow-[2px_2px_0px_#0f172a]"
            >
              Akses Admin
            </button>
          </div>
          <div className="pt-4 border-t-2 border-[#0f172a]/20">
            <p className="text-sm font-black text-[#0f172a] dark:text-amber-300 tracking-wide">
              © 2027 AnalisaKu by. Pak GuruAI
            </p>
            <p className="text-xs font-bold text-slate-800 dark:text-purple-300 mt-1">
              Hak Cipta Dilindungi Undang-Undang • Platform Resmi Persiapan Lolos PTN 2027
            </p>
          </div>
        </div>
      </footer>

      {/* 8. FLOATING SMOOTH NAVIGATION & BACK TO TOP BUTTON */}
      {showScrollTop && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 animate-bounce-in">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Kembali ke Atas"
            className="neo-btn p-3 bg-amber-300 hover:bg-amber-400 text-[#0f172a] shadow-[3px_3px_0px_#0f172a] flex items-center gap-1.5 text-xs font-black"
            title="Kembali ke Atas"
          >
            <ArrowUp className="w-5 h-5" />
            <span className="hidden sm:inline">Ke Atas</span>
          </button>
        </div>
      )}
    </div>
  );
};
