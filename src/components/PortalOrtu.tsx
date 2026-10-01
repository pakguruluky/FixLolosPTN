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
} from 'lucide-react';
import { Siswa, AppSettings } from '../types';
import { getAnalisaLengkap, getAnalisaSNBT } from '../services/api';
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showSNBP = siswa.pilihan_program === 'SNBP' || siswa.pilihan_program === 'SNBP+SNBT';
  const showSNBT = siswa.pilihan_program === 'SNBT' || siswa.pilihan_program === 'SNBP+SNBT';

  return (
    <div className="min-h-screen bg-[#F7F4FF] dark:bg-[#0D0920] text-[#1A0835] dark:text-[#EDE8FF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl">
              👨‍👩‍👧
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-purple-100 text-xs font-bold mb-1">
                <span>Portal Orang Tua Siswa</span>
                <span>•</span>
                <span>Mode Pemantauan</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black">
                Selamat Datang, {siswa.nama_ortu || 'Bapak/Ibu Orang Tua'}
              </h1>
              <p className="text-xs sm:text-sm text-purple-100/90 mt-0.5">
                Memantau perkembangan persiapan seleksi masuk perguruan tinggi ananda{' '}
                <strong>{siswa.nama_siswa}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Profil Siswa Card */}
        <div className="bg-white dark:bg-[#160E2E] rounded-2xl border border-purple-100 dark:border-purple-950/40 p-5 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Nama Siswa</span>
              <strong className="text-gray-900 dark:text-white">{siswa.nama_siswa}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] font-bold uppercase">NIS Siswa</span>
              <strong className="font-mono text-purple-700 dark:text-purple-300">{siswa.nis}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Kelas</span>
              <strong className="text-gray-900 dark:text-white">{siswa.kelas}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Sekolah Asal</span>
              <strong className="text-gray-900 dark:text-white truncate block">{siswa.asal_sekolah}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Cabang Bimbel</span>
              <strong className="text-gray-900 dark:text-white">{siswa.cabang}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Program Pilihan</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200">
                {siswa.pilihan_program}
              </span>
            </div>
          </div>
        </div>

        {/* SEKSI ANALISA SNBP (RINGKAS) */}
        {showSNBP && snbpData && (
          <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-purple-50 dark:border-purple-950/40 pb-4">
              <div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                  Evaluasi Jalur Rapor
                </span>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-purple-600" />
                  <span>Rasionalisasi Peluang SNBP: {snbpData.peluang.peluang_total}%</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${snbpData.peluang.color_total} bg-purple-50 dark:bg-purple-950 font-bold`}>
                    {snbpData.peluang.label_total}
                  </span>
                </h3>
              </div>
            </div>

            {/* Pilihan Prodi SNBP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {snbpData.peluang.pilihanAnalisa.map((pil: any) => (
                <div
                  key={pil.pilihan_ke}
                  className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-2"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-purple-800 dark:text-purple-300">
                      Pilihan {pil.pilihan_ke}
                    </span>
                    <span className={`font-bold ${pil.color_peluang}`}>
                      {pil.label_peluang} ({pil.peluang_prodi}%)
                    </span>
                  </div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white">{pil.prodi}</div>
                  <div className="text-xs text-gray-500">{pil.ptn}</div>
                </div>
              ))}
            </div>

            {/* Breakdown Komponen SNBP */}
            <BarChartSVG
              title="Capaian Komponen Peluang SNBP"
              labels={snbpData.peluang.breakdown.map((b: any) => b.nama)}
              values={snbpData.peluang.breakdown.map((b: any) => b.poin)}
              maxVal={25}
            />
          </div>
        )}

        {/* SEKSI PROGRESS SNBT (RINGKAS) */}
        {showSNBT && snbtData && (
          <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-red-100 dark:border-red-950/40 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-red-50 dark:border-red-950/40 pb-4">
              <div>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                  Evaluasi Jalur Tes UTBK
                </span>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <span>Rata-rata Skor Tertimbang: {snbtData.stats.avgTert}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold">
                    Tren: {snbtData.stats.trendLabel}
                  </span>
                </h3>
              </div>
            </div>

            <RatioBar6040
              tpsScore={snbtData.stats.avgTPS}
              literasiScore={snbtData.stats.avgLit}
              tertimbang={snbtData.stats.avgTert}
            />

            <ChartJSLine
              title="Perjalanan Try Out UTBK Ananda"
              labels={snbtData.toList.map((t: any) => `TO ${t.to_ke} (${t.bulan})`)}
              datasets={[
                {
                  label: 'Skor Tertimbang',
                  data: snbtData.toList.map((t: any) => t.skor_tertimbang),
                  borderColor: '#DC2626',
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                },
              ]}
              minVal={500}
              maxVal={800}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-6 border-t border-purple-100 dark:border-purple-950/40">
          <div>AnalisaKu 2027 by {settings.NAMA_LEMBAGA} © 2027</div>
          <div className="mt-0.5">@Copyright Pak Guru AI 2026</div>
        </footer>
      </div>
    </div>
  );
};
