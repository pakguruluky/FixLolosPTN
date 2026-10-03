import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Award,
  BookOpen,
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  Play,
  Pause,
  Volume2,
  Sliders,
  CheckCircle,
  Lock,
  Flame,
  Zap,
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

  // What-If Simulator state
  const [simulasiRapor, setSimulasiRapor] = useState<number>(88.5);
  const [simulasiUTBK, setSimulasiUTBK] = useState<number>(685);

  // Lo-Fi Music Player state
  const [isPlayingLofi, setIsPlayingLofi] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<any>(null);

  // Target date for countdown (UTBK 2027)
  const targetDateStr = settings.SNBT_DATE || '2027-05-08T07:00:00';

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
        if (snbp?.peluang?.rata_rapor > 0) {
          setSimulasiRapor(Number(snbp.peluang.rata_rapor.toFixed(1)));
        }
      }
      if (siswa.pilihan_program !== 'SNBP') {
        const snbt = await getAnalisaSNBT(siswa.nis);
        setSnbtData(snbt);
        if (snbt?.stats?.avgTert > 0) {
          setSimulasiUTBK(Math.round(snbt.stats.avgTert));
        }
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

  // Audio Ambient Synthesizer for Lo-Fi Music Player
  const toggleLofiMusic = () => {
    if (isPlayingLofi) {
      // Pause
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setIsPlayingLofi(false);
    } else {
      // Play Ambient Lo-Fi Synthesizer (pentatonic chill chords)
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Notes: F3, A3, C4, E4, G4, D4 (Chill Neo-Soul Lo-Fi Chords)
        const notes = [174.61, 220.0, 261.63, 329.63, 392.0, 293.66, 349.23];
        let noteIndex = 0;

        const playWarmTone = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(550, ctx.currentTime);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(notes[noteIndex % notes.length], ctx.currentTime);

          gain.gain.setValueAtTime(0.001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 2.0);

          noteIndex = (noteIndex + 1) % notes.length;
        };

        playWarmTone();
        timerRef.current = setInterval(playWarmTone, 1400);
        setIsPlayingLofi(true);
      } catch (err) {
        console.warn('Web Audio error:', err);
        setIsPlayingLofi(!isPlayingLofi);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Hitung prediksi What-If Simulator
  const hitungSimulasiPeluang = () => {
    const skorRaporPct = Math.min(100, Math.max(0, ((simulasiRapor - 70) / (98 - 70)) * 100));
    const skorUTBKPct = Math.min(100, Math.max(0, ((simulasiUTBK - 450) / (780 - 450)) * 100));
    const peluangSimulasi = Math.round(skorRaporPct * 0.45 + skorUTBKPct * 0.55);
    return Math.min(96, Math.max(35, peluangSimulasi));
  };

  const peluangHasilSimulasi = hitungSimulasiPeluang();

  const showSNBP = siswa.pilihan_program === 'SNBP' || siswa.pilihan_program === 'SNBP+SNBT';
  const showSNBT = siswa.pilihan_program === 'SNBT' || siswa.pilihan_program === 'SNBP+SNBT';

  return (
    <div className="space-y-6 pb-20">
      {/* ========================================================
          A. HERO BANNER (RPG CHARACTER STYLE NEO-BRUTALISM)
          ======================================================== */}
      <div className="neo-card p-6 sm:p-7 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
        {/* Subtle decorative Neo-Brutalism grid & shapes */}
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none neo-dot-grid" />
        <div className="absolute -bottom-8 -right-8 w-44 h-44 rounded-full bg-pink-400/20 blur-xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            {/* User Rank & Gamification Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="neo-badge px-3 py-1 bg-amber-300 text-[#0f172a] text-xs font-black">
                🔥 Rank: Pejuang PTN (Lvl 12)
              </span>
              <span className="neo-badge px-3 py-1 bg-cyan-200 text-[#0f172a] text-xs font-black">
                ⚡ Streak 15 Hari Belajar!
              </span>
              <span className="neo-badge px-2.5 py-1 bg-pink-200 text-[#0f172a] text-xs font-black">
                🛡️ Status: {siswa.akses || '1 BULAN'}
              </span>
            </div>

            {/* Personal Greeting */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Halo, {siswa.nama_siswa || 'Gita'}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-purple-100 font-medium mt-1.5 max-w-xl leading-relaxed">
                Fokus ke target impianmu di PTN 2027. Konsistensi harian, evaluasi rapor, dan latihan try out intensif adalah kunci utama menembus ambang batas kelulusan! 🚀
              </p>
            </div>

            {/* Quick Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="neo-badge px-2.5 py-0.5 bg-white text-[#0f172a] font-bold">
                🏫 {siswa.asal_sekolah || 'SMA Negeri'}
              </span>
              <span className="neo-badge px-2.5 py-0.5 bg-purple-200 text-[#0f172a] font-bold">
                🎯 {siswa.pilihan_program || 'SNBP + SNBT'}
              </span>
              <span className="neo-badge px-2.5 py-0.5 bg-emerald-200 text-[#0f172a] font-bold">
                📍 Cabang {siswa.cabang || 'ONLINE'}
              </span>
            </div>
          </div>

          {/* Countdown UTBK Flip Clock Retro Card */}
          <div className="neo-card-dark p-4 sm:p-5 text-center min-w-[280px] sm:min-w-[310px] shrink-0">
            <div className="inline-flex items-center gap-1.5 neo-badge px-2.5 py-0.5 bg-amber-400 text-[#0f172a] text-[11px] font-black mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>HITUNG MUNDUR UTBK-SNBT 2027</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { val: countdown.days, label: 'HARI' },
                { val: countdown.hours, label: 'JAM' },
                { val: countdown.minutes, label: 'MENIT' },
                { val: countdown.seconds, label: 'DETIK' },
              ].map((c, i) => (
                <div key={i} className="neo-flip-box p-2 text-center flex flex-col justify-center">
                  <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 leading-none">
                    {String(c.val).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] font-black text-purple-200 mt-1 uppercase tracking-wider">
                    {c.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-[10px] text-purple-300 font-bold">
              🗓️ Target Ujian: 08 Mei 2027 • Gelombang 1
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          B. TARGET PTN CARDS (TRADING CARD STYLE)
          ======================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#0f172a] dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-600" />
            <span>Target PTN Impian (Trading Card Rasionalisasi)</span>
          </h2>
          <span className="text-xs font-black text-slate-700 dark:text-purple-200 hidden sm:inline-block">
            Prediksi Berbasis Data Historis &amp; NRM/NAM Resmi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: SNBP Trading Card */}
          <div className="neo-card p-5 bg-purple-50/50 dark:bg-[#160E2E] flex flex-col justify-between space-y-4">
            <div>
              {/* Header Card */}
              <div className="flex items-center justify-between border-b-2 border-[#0f172a] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📘</span>
                  <div>
                    <h3 className="font-black text-sm text-[#0f172a] dark:text-white">
                      Jalur SNBP 2027 (Nilai Rapor)
                    </h3>
                    <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                      Rasionalisasi Rapor 5 Semester &amp; Bobot Prestasi
                    </p>
                  </div>
                </div>
                <span className="neo-badge px-2.5 py-0.5 bg-purple-300 text-[#0f172a] text-[10px] font-black">
                  2 PILIHAN
                </span>
              </div>

              {/* Trading Card Slots */}
              <div className="space-y-3">
                {/* Pilihan 1: IPB - Fisika (Peluang 88%) */}
                <div className="neo-card-sm p-3.5 bg-white dark:bg-[#1E1540]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="neo-badge px-2 py-0.5 bg-purple-200 text-[#0f172a] text-[9px] font-black">
                        PILIHAN 1 (UTAMA)
                      </span>
                      <h4 className="font-black text-sm text-[#0f172a] dark:text-white mt-1">
                        {pilihanSNBP[0]?.prodi || 'Fisika'}
                      </h4>
                      <p className="text-xs font-bold text-gray-600 dark:text-purple-200">
                        {pilihanSNBP[0]?.ptn || 'Institut Pertanian Bogor (IPB)'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                        88%
                      </div>
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-400 mt-1 inline-block">
                        PELUANG TINGGI
                      </span>
                    </div>
                  </div>

                  {/* Neon Progress Bar Emerald */}
                  <div className="mt-2.5">
                    <div className="h-3 w-full bg-gray-200 dark:bg-purple-950 rounded-full border-2 border-[#0f172a] overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-500"
                        style={{ width: '88%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pilihan 2: Unsika - Matematika (Peluang 94%) */}
                <div className="neo-card-sm p-3.5 bg-white dark:bg-[#1E1540]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="neo-badge px-2 py-0.5 bg-indigo-200 text-[#0f172a] text-[9px] font-black">
                        PILIHAN 2 (CADANGAN AMAN)
                      </span>
                      <h4 className="font-black text-sm text-[#0f172a] dark:text-white mt-1">
                        {pilihanSNBP[1]?.prodi || 'Matematika'}
                      </h4>
                      <p className="text-xs font-bold text-gray-600 dark:text-purple-200">
                        {pilihanSNBP[1]?.ptn || 'Universitas Singaperbangsa Karawang'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                        94%
                      </div>
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-400 mt-1 inline-block">
                        SANGAT AMAN
                      </span>
                    </div>
                  </div>

                  {/* Neon Progress Bar Emerald */}
                  <div className="mt-2.5">
                    <div className="h-3 w-full bg-gray-200 dark:bg-purple-950 rounded-full border-2 border-[#0f172a] overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-500"
                        style={{ width: '94%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('snbp_analisa')}
              className="neo-btn w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs gap-1.5"
            >
              <span>Buka Analisis SNBP Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: SNBT Trading Card */}
          <div className="neo-card p-5 bg-rose-50/50 dark:bg-[#160E2E] flex flex-col justify-between space-y-4">
            <div>
              {/* Header Card */}
              <div className="flex items-center justify-between border-b-2 border-[#0f172a] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-black text-sm text-[#0f172a] dark:text-white">
                      Jalur SNBT 2027 (Tes UTBK IRT)
                    </h3>
                    <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300">
                      Formula 60:40 TPS &amp; Literasi vs Target Skor NAM
                    </p>
                  </div>
                </div>
                <span className="neo-badge px-2.5 py-0.5 bg-rose-300 text-[#0f172a] text-[10px] font-black">
                  4 PILIHAN
                </span>
              </div>

              {/* Trading Card Slots */}
              <div className="space-y-3">
                {/* Pilihan 1: UI - Kesmas (Peluang 65%) */}
                <div className="neo-card-sm p-3.5 bg-white dark:bg-[#1E1540]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="neo-badge px-2 py-0.5 bg-amber-200 text-[#0f172a] text-[9px] font-black">
                        PILIHAN 1 (KOMPETITIF)
                      </span>
                      <h4 className="font-black text-sm text-[#0f172a] dark:text-white mt-1">
                        {pilihanSNBT[0]?.prodi || 'Kesehatan Masyarakat (Kesmas)'}
                      </h4>
                      <p className="text-xs font-bold text-gray-600 dark:text-purple-200">
                        {pilihanSNBT[0]?.ptn_nama || 'Universitas Indonesia (UI)'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                        65%
                      </div>
                      <span className="text-[9px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-400 mt-1 inline-block">
                        SEDANG
                      </span>
                    </div>
                  </div>

                  {/* Neon Progress Bar Amber */}
                  <div className="mt-2.5">
                    <div className="h-3 w-full bg-gray-200 dark:bg-purple-950 rounded-full border-2 border-[#0f172a] overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-500"
                        style={{ width: '65%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pilihan 2: UGM - Kedokteran (Peluang 48%) */}
                <div className="neo-card-sm p-3.5 bg-white dark:bg-[#1E1540]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="neo-badge px-2 py-0.5 bg-rose-200 text-[#0f172a] text-[9px] font-black">
                        PILIHAN 2 (SUPER KETAT)
                      </span>
                      <h4 className="font-black text-sm text-[#0f172a] dark:text-white mt-1">
                        {pilihanSNBT[1]?.prodi || 'Kedokteran'}
                      </h4>
                      <p className="text-xs font-bold text-gray-600 dark:text-purple-200">
                        {pilihanSNBT[1]?.ptn_nama || 'Universitas Gadjah Mada (UGM)'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black font-mono text-rose-600 dark:text-rose-400 leading-none">
                        48%
                      </div>
                      <span className="text-[9px] font-black text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-400 mt-1 inline-block">
                        MENANTANG
                      </span>
                    </div>
                  </div>

                  {/* Neon Progress Bar Rose */}
                  <div className="mt-2.5">
                    <div className="h-3 w-full bg-gray-200 dark:bg-purple-950 rounded-full border-2 border-[#0f172a] overflow-hidden">
                      <div
                        className="h-full bg-rose-500 transition-all duration-500"
                        style={{ width: '48%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('snbt_analisa')}
              className="neo-btn w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs gap-1.5"
            >
              <span>Buka Analisis SNBT Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          C. INNOVATION WIDGETS (WHAT-IF SIMULATOR & BADGES)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Interactive Slider Widget (What-If Simulator) - Col Span 7 */}
        <div className="lg:col-span-7 neo-card p-6 bg-cyan-50/60 dark:bg-[#160E2E] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#0f172a] pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 neo-badge px-2.5 py-0.5 bg-cyan-200 text-[#0f172a] text-[10px] font-black">
                <Sliders className="w-3 h-3" />
                <span>INNOVATION TOOL</span>
              </div>
              <h3 className="font-black text-base text-[#0f172a] dark:text-white mt-1">
                What-If Simulator Peluang Kelulusan
              </h3>
            </div>
            <span className="neo-badge px-2.5 py-1 bg-amber-300 text-[#0f172a] text-xs font-black">
              REAL-TIME
            </span>
          </div>

          <p className="text-xs text-slate-800 dark:text-purple-200 font-bold leading-relaxed">
            Geser slider di bawah ini untuk menguji bagaimana kenaikan nilai rapor semester atau lonjakan skor Try Out UTBK dapat mendongkrak probabilitas kelulusanmu!
          </p>

          <div className="space-y-4 pt-1">
            {/* Slider 1: Rata-Rata Nilai Rapor */}
            <div className="neo-card-sm p-4 bg-white dark:bg-[#1E1540] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#0f172a] dark:text-white flex items-center gap-1.5">
                  <span>📘 Rata-Rata Nilai Rapor Siswa</span>
                </label>
                <div className="neo-badge px-3 py-0.5 bg-purple-200 text-[#0f172a] font-mono font-black text-sm">
                  {simulasiRapor.toFixed(1)} / 100
                </div>
              </div>
              <input
                type="range"
                min="70"
                max="98"
                step="0.1"
                value={simulasiRapor}
                onChange={(e) => setSimulasiRapor(parseFloat(e.target.value))}
                className="w-full h-3 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600 border border-[#0f172a]"
              />
              <div className="flex justify-between text-[10px] text-slate-700 dark:text-purple-300 font-black">
                <span>70.0 (Batas KKM)</span>
                <span>85.0 (Kompetitif)</span>
                <span>98.0 (Juara Umum)</span>
              </div>
            </div>

            {/* Slider 2: Target Skor Tryout UTBK IRT */}
            <div className="neo-card-sm p-4 bg-white dark:bg-[#1E1540] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#0f172a] dark:text-white flex items-center gap-1.5">
                  <span>🎯 Target Skor Tryout UTBK IRT</span>
                </label>
                <div className="neo-badge px-3 py-0.5 bg-rose-200 text-[#0f172a] font-mono font-black text-sm">
                  {simulasiUTBK} Poin
                </div>
              </div>
              <input
                type="range"
                min="450"
                max="820"
                step="5"
                value={simulasiUTBK}
                onChange={(e) => setSimulasiUTBK(parseInt(e.target.value))}
                className="w-full h-3 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-600 border border-[#0f172a]"
              />
              <div className="flex justify-between text-[10px] text-slate-700 dark:text-purple-300 font-black">
                <span>450 (Dasar)</span>
                <span>650 (Top PTN)</span>
                <span>820 (Peringkat 1 Nasional)</span>
              </div>
            </div>
          </div>

          {/* Dynamic Result Box */}
          <div className="neo-card-sm p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase text-purple-200 tracking-wider">
                Proyeksi Kelulusan Simulasi
              </div>
              <div className="text-sm font-bold mt-0.5">
                {peluangHasilSimulasi >= 80
                  ? 'Peluang Sangat Tinggi & Mengamankan Kursi! 🔥'
                  : peluangHasilSimulasi >= 65
                  ? 'Kompetitif! Tingkatkan 25 poin lagi untuk aman.'
                  : 'Perlu penguatan pada mapel pendukung prodi.'}
              </div>
            </div>
            <div className="neo-card p-3 bg-amber-300 text-[#0f172a] text-center shrink-0">
              <div className="text-2xl font-black font-mono leading-none">
                {peluangHasilSimulasi}%
              </div>
              <div className="text-[8px] font-black uppercase tracking-wider mt-0.5">
                ESTIMASI
              </div>
            </div>
          </div>
        </div>

        {/* Badge Achievements Grid - Col Span 5 */}
        <div className="lg:col-span-5 neo-card p-6 bg-amber-50/60 dark:bg-[#160E2E] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b-2 border-[#0f172a] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <h3 className="font-black text-base text-[#0f172a] dark:text-white">
                    Badge Achievements
                  </h3>
                  <p className="text-[10px] font-black text-amber-800 dark:text-amber-300">
                    Pencapaian &amp; Misi Siswa Kelas 12
                  </p>
                </div>
              </div>
              <span className="neo-badge px-2.5 py-0.5 bg-amber-300 text-[#0f172a] text-[10px] font-black">
                2/4 UNLOCKED
              </span>
            </div>

            {/* 4 Kotak Badge */}
            <div className="grid grid-cols-2 gap-3">
              {/* Badge 1: Master Math (Unlocked) */}
              <div className="neo-card-sm p-3 bg-white dark:bg-[#1E1540] border-2.5 border-[#0f172a] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-purple-200 border-2 border-[#0f172a] flex items-center justify-center text-lg">
                    🧮
                  </div>
                  <span className="neo-badge px-1.5 py-0.2 bg-emerald-300 text-[#0f172a] text-[8px] font-black">
                    TERBUKA
                  </span>
                </div>
                <div className="font-black text-xs text-[#0f172a] dark:text-white">
                  Master Math
                </div>
                <p className="text-[10px] text-slate-700 dark:text-purple-200 font-bold leading-tight">
                  Nilai rapor Matematika konsisten &gt;88.
                </p>
              </div>

              {/* Badge 2: 15-Day Streak (Unlocked) */}
              <div className="neo-card-sm p-3 bg-white dark:bg-[#1E1540] border-2.5 border-[#0f172a] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-200 border-2 border-[#0f172a] flex items-center justify-center text-lg">
                    🔥
                  </div>
                  <span className="neo-badge px-1.5 py-0.2 bg-emerald-300 text-[#0f172a] text-[8px] font-black">
                    TERBUKA
                  </span>
                </div>
                <div className="font-black text-xs text-[#0f172a] dark:text-white">
                  15-Day Streak
                </div>
                <p className="text-[10px] text-slate-700 dark:text-purple-200 font-bold leading-tight">
                  Konsisten login belajar 15 hari beruntun.
                </p>
              </div>

              {/* Badge 3: Top 1% UTBK (Locked) */}
              <div className="neo-card-sm p-3 bg-gray-100 dark:bg-purple-950/30 opacity-85 border-2.5 border-[#0f172a] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-gray-200 border-2 border-[#0f172a] flex items-center justify-center text-lg grayscale">
                    🎯
                  </div>
                  <span className="neo-badge px-1.5 py-0.2 bg-gray-300 text-gray-800 text-[8px] font-black flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    LOCKED
                  </span>
                </div>
                <div className="font-black text-xs text-[#0f172a] dark:text-white">
                  Top 1% UTBK
                </div>
                <p className="text-[10px] text-slate-700 dark:text-purple-300 font-bold leading-tight">
                  Capai skor rata-rata try out &gt;720 poin.
                </p>
              </div>

              {/* Badge 4: Tiket PTN (Locked) */}
              <div className="neo-card-sm p-3 bg-gray-100 dark:bg-purple-950/30 opacity-85 border-2.5 border-[#0f172a] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-gray-200 border-2 border-[#0f172a] flex items-center justify-center text-lg grayscale">
                    🎫
                  </div>
                  <span className="neo-badge px-1.5 py-0.2 bg-gray-300 text-gray-800 text-[8px] font-black flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    LOCKED
                  </span>
                </div>
                <div className="font-black text-xs text-[#0f172a] dark:text-white">
                  Tiket PTN
                </div>
                <p className="text-[10px] text-slate-700 dark:text-purple-300 font-bold leading-tight">
                  Tuntas verifikasi pendaftaran PTN 2027.
                </p>
              </div>
            </div>
          </div>

          <div className="neo-card-sm p-3 bg-white dark:bg-[#1E1540] text-center text-xs font-black text-[#0f172a] dark:text-amber-300">
            💡 Selesaikan 2 try out berikutnya untuk membuka badge <strong>Top 1% UTBK</strong>!
          </div>
        </div>
      </div>

      {/* ========================================================
          MODUL BELAJAR PILIHAN SISWA
          ======================================================== */}
      {latestModuls.length > 0 && (
        <div className="neo-card p-6 bg-white dark:bg-[#160E2E] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#0f172a] pb-3">
            <h3 className="font-black text-sm sm:text-base text-[#0f172a] dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Modul Belajar Terverifikasi Bimbel</span>
            </h3>
            <button
              onClick={() => onNavigate('modul')}
              className="neo-btn-sm px-3 py-1 bg-purple-100 text-[#0f172a] text-xs font-black"
            >
              Semua Modul &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestModuls.map((m) => (
              <div
                key={m.id}
                onClick={() => onNavigate('modul')}
                className="neo-card-sm p-4 bg-purple-50/50 dark:bg-[#1E1540]/60 hover:bg-purple-100/60 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="neo-badge px-2 py-0.5 text-[9px] font-black uppercase bg-purple-200 text-purple-900">
                    {m.tipe_file}
                  </span>
                  <h4 className="font-black text-xs text-[#0f172a] dark:text-white mt-2 line-clamp-2">
                    {m.judul}
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-purple-300 mt-1 line-clamp-2">
                    {m.deskripsi}
                  </p>
                </div>
                <div className="text-[10px] text-purple-700 dark:text-purple-400 font-black pt-3 flex items-center gap-1">
                  <span>Pelajari Materi</span>
                  <span>&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          4. FLOATING WIDGET (MINI LO-FI MUSIC PLAYER - POJOK KANAN BAWAH)
          ======================================================== */}
      <div className="fixed bottom-5 right-5 z-40">
        <div className="neo-card-sm p-2.5 sm:p-3 bg-white dark:bg-[#160E2E] border-3 border-[#0f172a] shadow-[4px_4px_0px_#0f172a] flex items-center gap-3">
          {/* Animated Headphone / Cassette Icon */}
          <div className={`w-10 h-10 rounded-xl border-2 border-[#0f172a] flex items-center justify-center text-xl shrink-0 transition-transform ${
            isPlayingLofi ? 'bg-amber-300 scale-105 shadow-[1px_1px_0px_#0f172a]' : 'bg-purple-200'
          }`}>
            🎧
          </div>

          {/* Info Track & Animated Equalizer */}
          <div className="min-w-[130px]">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-[#0f172a] dark:text-white leading-none">
                Study Beats Lofi
              </span>
              {isPlayingLofi && (
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-1 bg-purple-600 animate-pulse h-2 rounded-full" />
                  <span className="w-1 bg-amber-500 animate-pulse h-3 rounded-full" />
                  <span className="w-1 bg-pink-500 animate-pulse h-1.5 rounded-full" />
                </span>
              )}
            </div>
            <div className="text-[10px] font-bold text-gray-500 dark:text-purple-300 mt-0.5">
              {isPlayingLofi ? '● Ambient Active Sound' : 'Fokus Belajar & Tryout'}
            </div>
          </div>

          {/* Play / Pause Neo Button */}
          <button
            onClick={toggleLofiMusic}
            className={`neo-btn-sm px-3 py-1.5 font-black text-xs flex items-center gap-1 shrink-0 ${
              isPlayingLofi
                ? 'bg-rose-400 text-[#0f172a]'
                : 'bg-emerald-300 text-[#0f172a]'
            }`}
            title={isPlayingLofi ? 'Pause Lo-Fi Beats' : 'Play Lo-Fi Beats'}
          >
            {isPlayingLofi ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
