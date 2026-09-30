import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  BookOpen,
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Siswa, AppSettings, Modul } from '../../types';
import {
  getAnalisaLengkap,
  getAnalisaSNBT,
  getPilihanPTN,
  getPilihanSNBT,
  getModulSiswa,
} from '../../services/api';
import { BarChartSVG, RatioBar6040, RadarChartSVG, ChartJSLine } from '../charts/SVGCharts';

interface StudentDashboardProps {
  siswa: Siswa;
  settings: AppSettings;
  onNavigate: (tabId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  siswa,
  settings,
  onNavigate,
}) => {
  const [snbpData, setSnbpData] = useState<any>(null);
  const [snbtData, setSnbtData] = useState<any>(null);
  const [pilihanSNBP, setPilihanSNBP] = useState<any[]>([]);
  const [pilihanSNBT, setPilihanSNBT] = useState<any[]>([]);
  const [latestModuls, setLatestModuls] = useState<Modul[]>([]);

  // Countdown state
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // WIB Greeting
  const getWIBGreeting = () => {
    const now = new Date();
    // Use Asia/Jakarta hours
    const wibHour = parseInt(
      now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false })
    );

    if (wibHour >= 4 && wibHour <= 10) return { text: 'Selamat Pagi 🌤️', icon: '🌤️' };
    if (wibHour >= 11 && wibHour <= 14) return { text: 'Selamat Siang ☀️', icon: '☀️' };
    if (wibHour >= 15 && wibHour <= 17) return { text: 'Selamat Sore 🌅', icon: '🌅' };
    return { text: 'Selamat Malam 🌙', icon: '🌙' };
  };

  const greeting = getWIBGreeting();

  // Target date for countdown
  const isSNBPPrimary = siswa.pilihan_program === 'SNBP';
  const targetDateStr = isSNBPPrimary ? settings.SNBP_DATE : settings.SNBT_DATE;
  const targetLabel = isSNBPPrimary ? 'SNBP 2027' : 'UTBK-SNBT 2027';

  useEffect(() => {
    loadDashboardData();
  }, [siswa]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(targetDateStr).getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  const loadDashboardData = async () => {
    try {
      if (siswa.pilihan_program !== 'SNBT') {
        const snbp = await getAnalisaLengkap(siswa.nis);
        setSnbpData(snbp);
      }
      if (siswa.pilihan_program !== 'SNBP') {
        const snbt = await getAnalisaSNBT(siswa.nis);
        setSnbtData(snbt);
      }
      const pSNBP = await getPilihanPTN(siswa.nis);
      setPilihanSNBP(pSNBP);

      const pSNBT = await getPilihanSNBT(siswa.nis);
      setPilihanSNBT(pSNBT);

      const moduls = await getModulSiswa(siswa.nis);
      setLatestModuls(moduls.slice(0, 4));
    } catch (e) {
      console.error(e);
    }
  };

  const showSNBP = siswa.pilihan_program === 'SNBP' || siswa.pilihan_program === 'SNBP+SNBT';
  const showSNBT = siswa.pilihan_program === 'SNBT' || siswa.pilihan_program === 'SNBP+SNBT';

  return (
    <div className="space-y-6">
      {/* Personalized Greeting & Countdown Header */}
      <div className="bg-gradient-to-r from-purple-800 via-[#7C3AED] to-purple-900 rounded-3xl p-6 text-white shadow-xl shadow-purple-600/20 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-purple-100 text-xs font-bold mb-3 backdrop-blur-sm">
              <span>{greeting.icon}</span>
              <span>{greeting.text}</span>
              <span>•</span>
              <span>WIB Indonesia Barat</span>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black">
                Halo, {siswa.nama_siswa}! 🔥
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-purple-950">
                ⚡ Aktif &amp; Siap Lolos
              </span>
            </div>

            <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-xl">
              Dashboard evaluasi &amp; rasionalisasi kampus impian 2027. Pantau terus grafik nilai rapor dan skor try out untuk mengamankan tiket ke PTN idamanmu! 🚀
            </p>

            <div className="flex flex-wrap gap-2 mt-4 text-[11px] font-semibold">
              <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
                Paket: <strong>{siswa.akses}</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
                Program: <strong>{siswa.pilihan_program}</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
                Cabang: <strong>{siswa.cabang}</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-400 text-purple-950 font-black">
                🏢 {settings.NAMA_LEMBAGA}
              </span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[280px]">
            <div className="text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Hitung Mundur Pelaksanaan {targetLabel}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { val: countdown.days, label: 'Hari' },
                { val: countdown.hours, label: 'Jam' },
                { val: countdown.minutes, label: 'Mnt' },
                { val: countdown.seconds, label: 'Dtk' },
              ].map((c, i) => (
                <div key={i} className="p-2 rounded-xl bg-white/10 text-center">
                  <div className="text-xl font-black font-mono leading-none">{c.val}</div>
                  <div className="text-[9px] text-purple-200 mt-1">{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RINGKASAN PILIHAN PTN WIDGET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SNBP CHOICES SUMMARY */}
        {showSNBP && (
          <div className="bg-white dark:bg-[#160E2E] rounded-2xl border border-purple-100 dark:border-purple-950/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" />
                <span>Pilihan PTN SNBP ({pilihanSNBP.length}/2)</span>
              </h3>
              <button
                onClick={() => onNavigate('snbp_pilihan')}
                className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline"
              >
                Ubah Pilihan &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {[1, 2].map((ke) => {
                const pil = pilihanSNBP.find((p) => p.pilihan_ke === ke);
                return (
                  <div
                    key={ke}
                    className="p-3 rounded-xl border border-gray-100 dark:border-purple-900/50 bg-gray-50/50 dark:bg-[#1E1540]/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-800 dark:text-purple-200 flex items-center gap-1.5">
                        <span>{ke === 1 ? 'Pilihan 1 (Utama)' : 'Pilihan 2 (Cadangan)'}:</span>
                        {pil?.tier && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            {pil.tier}
                          </span>
                        )}
                        {pil?.isCustom && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300">
                            ✏️ Mandiri
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 dark:text-purple-300 mt-0.5">
                        {pil ? `${pil.prodi} — ${pil.ptn}` : <span className="text-gray-400 italic">Slot kosong</span>}
                      </div>
                    </div>
                    {!pil && (
                      <button
                        onClick={() => onNavigate('snbp_pilihan')}
                        className="px-2.5 py-1 rounded-lg bg-purple-700 text-white font-bold text-[10px]"
                      >
                        + Isi Slot
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SNBT CHOICES SUMMARY */}
        {showSNBT && (
          <div className="bg-white dark:bg-[#160E2E] rounded-2xl border border-red-100 dark:border-red-950/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-red-600" />
                <span>Pilihan PTN SNBT ({pilihanSNBT.length}/4)</span>
              </h3>
              <button
                onClick={() => onNavigate('snbt_pilihan')}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
              >
                Ubah Pilihan &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {[1, 2, 3, 4].map((ke) => {
                const pil = pilihanSNBT.find((p) => p.pilihan_ke === ke);
                return (
                  <div
                    key={ke}
                    className="p-2.5 rounded-xl border border-gray-100 dark:border-purple-900/50 bg-gray-50/50 dark:bg-[#1E1540]/60 flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[240px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-700 dark:text-purple-200">Pil {ke}: </span>
                        {pil?.tier && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            {pil.tier}
                          </span>
                        )}
                        {pil?.isCustom && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300">
                            ✏️ Mandiri
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 dark:text-purple-300 truncate mt-0.5">
                        {pil ? `${pil.prodi} (${pil.singk_ptn})` : <span className="text-gray-400 italic">Slot kosong</span>}
                      </div>
                    </div>
                    {!pil && (
                      <button
                        onClick={() => onNavigate('snbt_pilihan')}
                        className="px-2 py-0.5 rounded-lg bg-red-600 text-white font-bold text-[10px]"
                      >
                        + Isi
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SNBP SECTION HIGHLIGHT */}
      {showSNBP && snbpData && snbpData.nilaiRapor.length > 0 && (
        <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-50 dark:border-purple-950/40 pb-4">
            <div>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                Jalur Rapor (SNBP 2027)
              </span>
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>Rasionalisasi Peluang Total: {snbpData.peluang.peluang_total}%</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full ${snbpData.peluang.color_total} bg-purple-50 dark:bg-purple-950`}>
                  {snbpData.peluang.label_total}
                </span>
              </h3>
            </div>

            <button
              onClick={() => onNavigate('snbp_analisa')}
              className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Lihat Analisis Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <BarChartSVG
              title="Poin Komponen Peluang SNBP"
              labels={snbpData.peluang.breakdown.map((b: any) => b.nama)}
              values={snbpData.peluang.breakdown.map((b: any) => b.poin)}
              maxVal={25}
            />

            {/* Nilai Akhir SNBP mini badge */}
            <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  Nilai Akhir SNBP (Prakiraan Skor Gabungan 0–100)
                </div>
                <div className="text-4xl font-black font-mono text-purple-900 dark:text-white mt-2">
                  {snbpData.nilaiAkhir.nilaiAkhir}
                </div>
                <div className={`text-xs font-bold mt-1 ${snbpData.nilaiAkhir.color}`}>
                  Status: {snbpData.nilaiAkhir.label}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 dark:text-purple-200">
                <div className="flex justify-between">
                  <span>Rapor (50%):</span>
                  <strong>{snbpData.nilaiAkhir.skorRapor50} / 50</strong>
                </div>
                <div className="flex justify-between">
                  <span>Prestasi & TKA (30%):</span>
                  <strong>{snbpData.nilaiAkhir.skorPrestasi30} / 30</strong>
                </div>
                <div className="flex justify-between">
                  <span>Rekam Jejak (20%):</span>
                  <strong>{snbpData.nilaiAkhir.skorTambahan20} / 20</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SNBT SECTION HIGHLIGHT */}
      {showSNBT && snbtData && snbtData.toList.length > 0 && (
        <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-red-100 dark:border-red-950/40 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-50 dark:border-red-950/40 pb-4">
            <div>
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                Jalur Tes (UTBK-SNBT 2027)
              </span>
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>Rata-rata Tertimbang: {snbtData.stats.avgTert}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold">
                  Tren {snbtData.stats.trendLabel}
                </span>
              </h3>
            </div>

            <button
              onClick={() => onNavigate('snbt_analisa')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-bold hover:opacity-95 transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Lihat Analisis Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <RatioBar6040
            tpsScore={snbtData.stats.avgTPS}
            literasiScore={snbtData.stats.avgLit}
            tertimbang={snbtData.stats.avgTert}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartJSLine
              title="Perjalanan Try Out UTBK"
              labels={snbtData.toList.map((t: any) => `TO ${t.to_ke}`)}
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

            <RadarChartSVG
              title="Radar 7 Subtes UTBK"
              labels={['PU', 'PBM', 'PPU', 'PK', 'LBI', 'LBE', 'PM']}
              values={[
                snbtData.stats.avgSubtes.pu,
                snbtData.stats.avgSubtes.pbm,
                snbtData.stats.avgSubtes.ppu,
                snbtData.stats.avgSubtes.pk,
                snbtData.stats.avgSubtes.lbi,
                snbtData.stats.avgSubtes.lbe,
                snbtData.stats.avgSubtes.pm,
              ]}
              maxVal={800}
            />
          </div>
        </div>
      )}

      {/* 4 MODUL TERBARU */}
      {latestModuls.length > 0 && (
        <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Modul &amp; Materi Belajar Pilihan</span>
            </h3>
            <button
              onClick={() => onNavigate('modul')}
              className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline"
            >
              Semua Modul &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestModuls.map((m) => (
              <div
                key={m.id}
                onClick={() => onNavigate('modul')}
                className="p-4 rounded-2xl border border-gray-100 dark:border-purple-900/60 bg-gray-50/50 dark:bg-[#1E1540]/60 hover:border-purple-400 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                    {m.tipe_file}
                  </span>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mt-2 line-clamp-2">
                    {m.judul}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{m.deskripsi}</p>
                </div>
                <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold pt-3 flex items-center gap-1">
                  <span>Pelajari Materi</span>
                  <span>&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
