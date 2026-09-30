import React, { useState } from 'react';
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
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Users,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { AppSettings } from '../types';

interface LandingPageProps {
  settings: AppSettings;
  onOpenLogin: (defaultTab?: 'siswa' | 'ortu' | 'daftar' | 'admin') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ settings, onOpenLogin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      q: 'Bagaimana jika saya lupa password akun?',
      a: 'Anda dapat menghubungi Admin cabang atau bimbingan belajar melalui nomor WhatsApp resmi yang tersedia di tombol bantuan, atau meminta admin mereset password akun Anda ke kata sandi standar.',
    },
    {
      q: 'Apakah orang tua memiliki akses portal terpisah?',
      a: 'Ya, orang tua dapat login melalui tab khusus menggunakan NIS siswa dan 4 digit terakhir nomor HP orang tua. Portal orang tua menyajikan ringkasan analisis peluang, grafik capaian, dan unduhan laporan A4 resmi secara praktis dan transparan.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4FF] dark:bg-[#0D0920] text-[#1A0835] dark:text-[#EDE8FF] transition-colors duration-300">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-amber-400/10 dark:bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar Sticky */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-[#160E2E]/85 border-b border-purple-100 dark:border-purple-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7C3AED] via-purple-600 to-[#F59E0B] flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-black text-xl">
              🎓
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-700 via-purple-900 to-amber-600 dark:from-purple-300 dark:to-amber-300 bg-clip-text text-transparent">
                AnalisaKu 2027
              </div>
              <p className="text-[11px] font-semibold text-purple-600/80 dark:text-purple-300/70">
                {settings.NAMA_LEMBAGA}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onOpenLogin('ortu')}
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-all"
            >
              👨‍👩‍👧 Portal Ortu
            </button>
            <button
              onClick={() => onOpenLogin('siswa')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-500/25 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>🚀 Masuk Aplikasi</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Platform Analisa Rasionalisasi SNBP & SNBT 2027</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Rasionalisasi Peluang Lolos{' '}
          <span className="bg-gradient-to-r from-[#7C3AED] via-purple-600 to-[#F59E0B] bg-clip-text text-transparent">
            PTN Impianmu
          </span>
          , Lebih Terarah & Akurat.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-gray-600 dark:text-purple-200/80 max-w-2xl mx-auto leading-relaxed">
          Kombinasi analisis komprehensif nilai rapor semester 1–5 terbobot, skor TKA IRT, dan formula UTBK 60:40 dengan database ribuan prodi PTN se-Indonesia.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => onOpenLogin('siswa')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-sm sm:text-base shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <span>Masuk Aplikasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenLogin('daftar')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-[#160E2E] border-2 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-200 font-bold text-sm sm:text-base shadow-md hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all"
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* 4 Highlight Cards */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-100 dark:border-purple-950/50 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-lg mb-3">
              📊
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">SNBP Jalur Rapor</h3>
            <p className="text-xs text-gray-600 dark:text-purple-200/70 mt-1">
              Bobot semester Sem1-Sem4 10-15%, Sem5 50%, validasi TKA IRT, mapel pendukung, dan sertifikat berpoin.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#160E2E] border border-red-100 dark:border-red-950/30 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 flex items-center justify-center font-bold text-lg mb-3">
              🎯
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">SNBT Formula 60 : 40</h3>
            <p className="text-xs text-gray-600 dark:text-purple-200/70 mt-1">
              TPS 60% (PU, PBM, PPU, PK) dan Literasi/PM 40% dari 9 Try Out berkala teruji terhadap target NAM.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#160E2E] border border-amber-100 dark:border-amber-950/30 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-lg mb-3">
              ⚡
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Analisa Real-Time</h3>
            <p className="text-xs text-gray-600 dark:text-purple-200/70 mt-1">
              Hasil peluang, radar subtes, rekomendasi semester berikutnya, dan grafik interaktif langsung terhitung.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#160E2E] border border-emerald-100 dark:border-emerald-950/30 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-lg mb-3">
              💡
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">3 Rekomendasi Alternatif</h3>
            <p className="text-xs text-gray-600 dark:text-purple-200/70 mt-1">
              Sistem menyaring prodi cadangan paling rasional dan aman dari seluruh database PTN Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* 8 Feature Cards */}
      <section className="py-16 bg-white/60 dark:bg-[#120B27]/70 border-y border-purple-100 dark:border-purple-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Fitur Lengkap untuk Sukses Masuk PTN
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-purple-300">
              Dirancang khusus untuk bimbingan belajar dan sekolah modern dengan standar seleksi nasional terkini.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: FileCheck,
                color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40',
                title: 'Input Rapor & TKA',
                desc: 'Mendukung Kurikulum 2013 dan Kurikulum Merdeka (Saintek, Soshum, Bahasa, Campuran) serta IRT 200–800.',
              },
              {
                icon: TrendingUp,
                color: 'text-red-600 bg-red-100 dark:bg-red-900/40',
                title: 'Input 9 Try Out SNBT',
                desc: 'Pratinjau otomatis 60:40 saat mengetik skor, grafik tren TO 1 s.d. 9, dan analisis ketercapaian per subtes.',
              },
              {
                icon: Compass,
                color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40',
                title: 'Pilihan PTN & Prodi',
                desc: 'Maksimal 2 pilihan SNBP dengan validasi wilayah provinsi sekolah serta hingga 4 pilihan SNBT.',
              },
              {
                icon: Award,
                color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40',
                title: 'Sertifikat & Prestasi',
                desc: 'Katalog penilaian sertifikat terakreditasi untuk Olimpiade, Olahraga, Seni, dan Kepengurusan Organisasi.',
              },
              {
                icon: BookOpen,
                color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40',
                title: 'Modul Belajar Aman',
                desc: 'Viewer layar penuh berproteksi anti-inspeksi dan watermark, tersaring otomatis berdasarkan kelas dan program.',
              },
              {
                icon: Users,
                color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40',
                title: 'Portal Orang Tua',
                desc: 'Akses transparan bagi wali siswa untuk memantau kemajuan belajar anak dan mengunduh laporan perkembangan.',
              },
              {
                icon: MessageCircle,
                color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/40',
                title: 'Chat & Bantuan Admin',
                desc: 'Konsultasi interaktif langsung antara siswa dan admin/konselor bimbingan belajar untuk pemilihan jurusan.',
              },
              {
                icon: ShieldCheck,
                color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40',
                title: 'Rangkuman Analisis Digital',
                desc: 'Dashboard analisis komprehensif real-time dengan rekomendasi strategi taktis untuk siswa, orang tua, dan sekolah.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-100 dark:border-purple-950/40 shadow-sm hover:border-purple-300 transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-purple-300/80 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 Cara Kerja */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            4 Langkah Menuju PTN Impian
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-purple-300">
            Alur analisa yang sistematis, objektif, dan terbukti membantu ribuan alumni lolos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            { step: '01', title: 'Daftar Akun', desc: 'Isi data diri dan pilih program SNBP, SNBT, atau keduanya.' },
            { step: '02', title: 'Input Nilai', desc: 'Masukkan nilai rapor semester 1–5, nilai TKA, atau hasil Try Out berkala.' },
            { step: '03', title: 'Pilih Prodi PTN', desc: 'Cari universitas dan jurusan incaran dengan filter ketetatan & NRM/NAM.' },
            { step: '04', title: 'Lihat Rasionalisasi', desc: 'Dapatkan persentase peluang, grafik radar, evaluasi subtes, dan laporan A4.' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-100 dark:border-purple-950/40 text-center relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-black text-lg mx-auto flex items-center justify-center mb-4">
                {item.step}
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-xs text-gray-600 dark:text-purple-200/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Peran Pengguna */}
      <section className="py-16 bg-purple-50/50 dark:bg-[#140D2D]/60 border-y border-purple-100 dark:border-purple-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Tiga Peran Pengguna Terintegrasi
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-purple-300">
              Sinergi antara siswa, orang tua, dan bimbingan belajar/sekolah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-200 dark:border-purple-900 shadow-sm">
              <span className="text-3xl mb-3 block">👨‍🎓</span>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Siswa</h3>
              <p className="text-xs text-gray-600 dark:text-purple-200/80 mt-2">
                Mengisi nilai mandiri, melihat grafik capaian, membandingkan jurusan, membaca modul terproteksi, serta konsultasi via chat admin.
              </p>
              <button
                onClick={() => onOpenLogin('siswa')}
                className="mt-4 text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Masuk sebagai Siswa</span> &rarr;
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-200 dark:border-purple-900 shadow-sm">
              <span className="text-3xl mb-3 block">👨‍👩‍👧</span>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Orang Tua</h3>
              <p className="text-xs text-gray-600 dark:text-purple-200/80 mt-2">
                Memantau rasionalisasi peluang dan tren grafik Try Out anak secara transparan tanpa khawatir data tertukar.
              </p>
              <button
                onClick={() => onOpenLogin('ortu')}
                className="mt-4 text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Portal Orang Tua</span> &rarr;
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-200 dark:border-purple-900 shadow-sm">
              <span className="text-3xl mb-3 block">🔐</span>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Admin Sekolah / Bimbel</h3>
              <p className="text-xs text-gray-600 dark:text-purple-200/80 mt-2">
                Verifikasi pendaftaran, generate token instan, manajemen modul, dan log aktivitas sistem.
              </p>
              <button
                onClick={() => onOpenLogin('admin')}
                className="mt-4 text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Dashboard Admin</span> &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-purple-300">
            Ketahui lebih banyak mengenai fitur dan mekanisme kalkulasi AnalisaKu 2027.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-100 dark:border-purple-950/40 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left flex justify-between items-center gap-3 font-bold text-sm text-gray-900 dark:text-white hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-purple-600 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs text-gray-600 dark:text-purple-200/80 leading-relaxed border-t border-purple-50 dark:border-purple-950/20 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Banner CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-[#7C3AED] via-purple-700 to-[#F59E0B] p-8 sm:p-12 text-white text-center shadow-xl shadow-purple-600/20 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold">Siap Memaksimalkan Peluang Lolos PTN?</h2>
            <p className="mt-3 text-purple-100 text-xs sm:text-sm">
              Jangan biarkan pemilihan jurusan dilakukan dengan spekulasi. Analisa data Anda sekarang juga.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onOpenLogin('siswa')}
                className="px-6 py-3 rounded-xl bg-white text-purple-800 font-bold text-xs sm:text-sm hover:bg-purple-50 transition-all shadow-md"
              >
                Masuk Sekarang
              </button>
              <a
                href={`https://wa.me/${settings.WA_ADMIN}?text=Halo%20Admin%20AnalisaKu%202027,%20saya%20ingin%20berkonsultasi.`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-purple-900/60 hover:bg-purple-900 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konsultasi WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#120B27] border-t border-purple-100 dark:border-purple-950/40 py-10 px-4 sm:px-6 lg:px-8 text-xs text-gray-500 dark:text-purple-300/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="font-bold text-gray-800 dark:text-purple-100 text-sm">
              AnalisaKu 2027 by {settings.NAMA_LEMBAGA} © 2027
            </div>
            <div className="mt-1">@Copyright Pak Guru AI 2026</div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => onOpenLogin('siswa')} className="hover:text-purple-700 dark:hover:text-purple-300">
              Siswa
            </button>
            <button onClick={() => onOpenLogin('ortu')} className="hover:text-purple-700 dark:hover:text-purple-300">
              Orang Tua
            </button>
            <button onClick={() => onOpenLogin('daftar')} className="hover:text-purple-700 dark:hover:text-purple-300">
              Daftar Baru
            </button>
            <button onClick={() => onOpenLogin('admin')} className="hover:text-purple-700 dark:hover:text-purple-300">
              Admin
            </button>
            <a
              href={`https://wa.me/${settings.WA_ADMIN}?text=Halo%20Admin%20AnalisaKu%202027,%20saya%20butuh%20bantuan.`}
              target="_blank"
              rel="noreferrer"
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
            >
              Hubungi Admin via WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
