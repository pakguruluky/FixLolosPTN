import React, { useState, useEffect } from 'react';
import {
  Users,
  LogOut,
  Compass,
  TrendingUp,
  Award,
  Sparkles,
  BookOpen,
  Calendar,
  Printer,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { Siswa, AppSettings } from '../types';
import { getAnalisaLengkap, getAnalisaSNBT } from '../services/api';
import { SNBPAnalisa } from './student/SNBPAnalisa';
import { SNBTAnalisa } from './student/SNBTAnalisa';
import { RatioBar6040, BarChartSVG, ChartJSLine } from './charts/SVGCharts';

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
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'snbp' | 'snbt'>('ringkasan');
  const [snbpData, setSnbpData] = useState<any>(null);
  const [snbtData, setSnbtData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [siswa]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (siswa.pilihan_program !== 'SNBT') {
        const snbp = await getAnalisaLengkap(siswa.nis);
        setSnbpData(snbp);
      }
      if (siswa.pilihan_program !== 'SNBP') {
        const snbt = await getAnalisaSNBT(siswa.nis);
        setSnbtData(snbt);
      }
    } catch (e) {
      console.error('Error loading analisa ortu:', e);
    } finally {
      setLoading(false);
    }
  };

  const showSNBP = siswa.pilihan_program === 'SNBP' || siswa.pilihan_program === 'SNBP+SNBT';
  const showSNBT = siswa.pilihan_program === 'SNBT' || siswa.pilihan_program === 'SNBP+SNBT';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F6FE] dark:bg-[#0B061A] text-[#1A0835] dark:text-[#EDE8FF] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/20">
              👨‍👩‍👧
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-purple-100 text-xs font-bold mb-1.5 backdrop-blur-sm">
                <span>Portal Orang Tua Siswa</span>
                <span>•</span>
                <span>Laporan Hasil Analisa SNBP & SNBT</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Selamat Datang, {siswa.nama_ortu || 'Bapak/Ibu Orang Tua'}
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/90 mt-0.5">
                Memantau hasil evaluasi akademik, rasionalisasi SNBP, dan capaian try out UTBK-SNBT ananda{' '}
                <strong className="text-white underline decoration-amber-400 decoration-2">{siswa.nama_siswa}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-2 border border-white/15 shadow-sm"
              title="Cetak Laporan"
            >
              <Printer className="w-4 h-4 text-purple-200" />
              <span>Cetak Hasil</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Profil Singkat Siswa */}
        <div className="bg-white dark:bg-[#150D2E] rounded-2xl border border-purple-100 dark:border-purple-950/40 p-5 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div>
              <span className="text-gray-400 dark:text-purple-300/60 block text-[10px] font-bold uppercase tracking-wider">Nama Ananda</span>
              <strong className="text-gray-900 dark:text-white text-sm">{siswa.nama_siswa}</strong>
            </div>
            <div>
              <span className="text-gray-400 dark:text-purple-300/60 block text-[10px] font-bold uppercase tracking-wider">NIS Siswa</span>
              <strong className="font-mono text-purple-700 dark:text-purple-300 text-sm">{siswa.nis}</strong>
            </div>
            <div>
              <span className="text-gray-400 dark:text-purple-300/60 block text-[10px] font-bold uppercase tracking-wider">Kelas</span>
              <strong className="text-gray-900 dark:text-white text-sm">{siswa.kelas}</strong>
            </div>
            <div>
              <span className="text-gray-400 dark:text-purple-300/60 block text-[10px] font-bold uppercase tracking-wider">Asal Sekolah</span>
              <strong className="text-gray-900 dark:text-white truncate block text-sm" title={siswa.asal_sekolah}>{siswa.asal_sekolah}</strong>
            </div>
            <div>
              <span className="text-gray-400 dark:text-purple-300/60 block text-[10px] font-bold uppercase tracking-wider">Cabang Bimbel</span>
              <strong className="text-gray-900 dark:text-white text-sm">{siswa.cabang}</strong>
            </div>
            <div>
              <span className="text-gray-400 dark:text-purple-300/60 block text-[10px] font-bold uppercase tracking-wider">Fokus Program</span>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                {siswa.pilihan_program}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#150D2E] border border-purple-100 dark:border-purple-950/40 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ringkasan'
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-gray-600 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Ringkasan Hasil Analisa</span>
          </button>

          {showSNBP && (
            <button
              onClick={() => setActiveTab('snbp')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'snbp'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'text-gray-600 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <Compass className="w-4 h-4 text-purple-300" />
              <span>Hasil Analisa Lengkap SNBP</span>
            </button>
          )}

          {showSNBT && (
            <button
              onClick={() => setActiveTab('snbt')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'snbt'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'text-gray-600 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span>Hasil Analisa Lengkap SNBT</span>
            </button>
          )}
        </div>

        {/* TAB CONTENT: RINGKASAN */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-6">
            {/* Quick KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card SNBP */}
              {showSNBP && (
                <div className="bg-white dark:bg-[#150D2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Jalur SNBP (Nilai Rapor)</h3>
                        <p className="text-[11px] text-gray-400">Rasionalisasi peluang seleksi prestasi</p>
                      </div>
                    </div>
                    {snbpData?.peluang && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-black ${snbpData.peluang.color_total} bg-purple-50 dark:bg-purple-950`}>
                        {snbpData.peluang.label_total}
                      </span>
                    )}
                  </div>

                  {snbpData?.peluang ? (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600 dark:text-purple-200">Indeks Peluang Rata-Rata</span>
                        <span className="text-xl font-black text-purple-700 dark:text-purple-300">{snbpData.peluang.peluang_total}%</span>
                      </div>

                      {/* Rincian Pilihan SNBP */}
                      <div className="space-y-2">
                        {snbpData.peluang.pilihanAnalisa?.map((pil: any) => (
                          <div key={pil.pilihan_ke} className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A1038] border border-gray-100 dark:border-purple-950/30 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-extrabold text-gray-800 dark:text-white">
                                Pil {pil.pilihan_ke}: {pil.prodi}
                              </div>
                              <div className="text-[11px] text-gray-400">{pil.ptn}</div>
                            </div>
                            <span className={`font-black ${pil.color_peluang}`}>{pil.peluang_prodi}%</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveTab('snbp')}
                        className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs transition-all text-center block"
                      >
                        Lihat Analisis Detail SNBP & Rapor →
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 py-6 text-center">
                      Belum ada data nilai rapor / pilihan prodi SNBP yang diisi oleh ananda.
                    </div>
                  )}
                </div>
              )}

              {/* Card SNBT */}
              {showSNBT && (
                <div className="bg-white dark:bg-[#150D2E] rounded-3xl border border-emerald-100 dark:border-emerald-950/40 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Jalur SNBT (Tes UTBK)</h3>
                        <p className="text-[11px] text-gray-400">Progres capaian try out berkala</p>
                      </div>
                    </div>
                    {snbtData?.stats && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {snbtData.stats.trendLabel}
                      </span>
                    )}
                  </div>

                  {snbtData?.stats && snbtData.toList && snbtData.toList.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
                          <span className="text-[10px] text-gray-500 block font-bold">Rata-rata Skor</span>
                          <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{snbtData.stats.avgTert}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
                          <span className="text-[10px] text-gray-500 block font-bold">Skor Tertinggi</span>
                          <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{snbtData.stats.maxTert}</span>
                        </div>
                      </div>

                      {/* Info Pilihan Prodi Terdekat */}
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A1038] border border-gray-100 dark:border-purple-950/30 text-xs space-y-1">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Target Pilihan 1:</span>
                        <div className="font-extrabold text-gray-800 dark:text-white">
                          {snbtData.pilihanDetail?.[0]?.prodi || 'Belum dipilih'} ({snbtData.pilihanDetail?.[0]?.singk_ptn || '-'})
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1">
                          <span>Target NAM: <strong>{snbtData.pilihanDetail?.[0]?.namTarget || '-'}</strong></span>
                          <span>Ketercapaian: <strong className="text-emerald-600">{snbtData.pilihanDetail?.[0]?.ketercapaian || 0}%</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('snbt')}
                        className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-all text-center block"
                      >
                        Lihat Rincian Try Out & Subtes UTBK →
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 py-6 text-center">
                      Belum ada rekaman nilai Try Out UTBK yang dimasukkan.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Panduan & Saran Pendampingan untuk Orang Tua */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 rounded-3xl border border-amber-200/60 dark:border-amber-900/30 p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
                <HeartHandshake className="w-5 h-5" />
                <span>Tips Pendampingan Belajar dari Tim Konselor {settings.NAMA_LEMBAGA}</span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                Persiapan menuju PTN membutuhkan stamina mental dan dukungan emosional yang konsisten. Bapak/Ibu disarankan untuk:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#150D2E]/70 border border-amber-100 dark:border-amber-900/20">
                  <div className="font-extrabold text-amber-900 dark:text-amber-200 mb-1">1. Apresiasi Proses</div>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                    Fokus pada konsistensi latihan soal harian ananda, bukan sekadar angka skor fluktuatif di satu try out.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#150D2E]/70 border border-amber-100 dark:border-amber-900/20">
                  <div className="font-extrabold text-amber-900 dark:text-amber-200 mb-1">2. Diskusikan Pilihan Realistis</div>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                    Buka dialog sehat mengenai kombinasi jurusan impian (Pilihan 1) dan jurusan pengaman (Pilihan 2 & 3).
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#150D2E]/70 border border-amber-100 dark:border-amber-900/20">
                  <div className="font-extrabold text-amber-900 dark:text-amber-200 mb-1">3. Jaga Kebugaran & Istirahat</div>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                    Pastikan ananda memiliki pola tidur cukup dan nutrisi seimbang agar fokus serta daya ingat tetap optimal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: ANALISA LENGKAP SNBP */}
        {activeTab === 'snbp' && showSNBP && (
          <div className="space-y-4">
            <div className="bg-purple-100/60 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200/50 dark:border-purple-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold">
                <Compass className="w-4 h-4 text-purple-600" />
                <span>Menampilkan Laporan Lengkap Rasionalisasi SNBP Ananda ({siswa.nama_siswa})</span>
              </div>
              <button
                onClick={() => setActiveTab('ringkasan')}
                className="text-purple-700 dark:text-purple-300 font-bold hover:underline"
              >
                ← Kembali ke Ringkasan
              </button>
            </div>

            {/* Render Komponen Analisa Lengkap SNBP */}
            <SNBPAnalisa siswa={siswa} />
          </div>
        )}

        {/* TAB CONTENT: ANALISA LENGKAP SNBT */}
        {activeTab === 'snbt' && showSNBT && (
          <div className="space-y-4">
            <div className="bg-emerald-100/60 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Menampilkan Laporan Lengkap Analisis Try Out & Peluang UTBK-SNBT Ananda ({siswa.nama_siswa})</span>
              </div>
              <button
                onClick={() => setActiveTab('ringkasan')}
                className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline"
              >
                ← Kembali ke Ringkasan
              </button>
            </div>

            {/* Render Komponen Analisa Lengkap SNBT */}
            <SNBTAnalisa siswa={siswa} />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-6 border-t border-purple-100 dark:border-purple-950/40">
          <div>Portal Pemantauan Orang Tua • {settings.NAMA_LEMBAGA} © 2027</div>
          <div className="mt-0.5">Sistem Analisis Kelulusan SNBP & SNBT 2027</div>
        </footer>
      </div>
    </div>
  );
};
