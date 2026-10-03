import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Target,
  Zap,
  BookOpen,
  FileText,
  ListChecks,
} from 'lucide-react';
import { Siswa } from '../../types';
import { getAnalisaSNBT } from '../../services/api';
import { RadarChartSVG, RatioBar6040, ChartJSLine } from '../charts/SVGCharts';
import {
  SUBTES_NAMES,
  STRATEGI_PENINGKATAN_SNBT,
  getStatusSubtes,
  generateKesimpulanStrategiSNBT,
} from '../../lib/calc';

interface SNBTAnalisaProps {
  siswa: Siswa;
}

export const SNBTAnalisa: React.FC<SNBTAnalisaProps> = ({ siswa }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalisa();
  }, [siswa]);

  const loadAnalisa = async () => {
    setLoading(true);
    try {
      const res = await getAnalisaSNBT(siswa.nis);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-xs text-gray-400">
        Menghitung analisa rasionalisasi SNBT...
      </div>
    );
  }

  if (!data || data.toList.length === 0) {
    return (
      <div className="bg-white dark:bg-[#160E2E] rounded-2xl border border-red-100 dark:border-red-950/40 p-8 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
          Data Try Out Belum Ada
        </h3>
        <p className="text-xs text-gray-500 dark:text-purple-300 max-w-md mx-auto">
          Silakan isi hasil Try Out minimal satu kali pada menu <strong>Nilai Try Out</strong> untuk mengaktifkan seluruh analisis tren, radar subtes, dan rasionalisasi SNBT 60:40.
        </p>
      </div>
    );
  }

  const { toList, stats, pilihanDetail, alternatif } = data;

  const kesimpulanStrategi =
    data.kesimpulanStrategi || generateKesimpulanStrategiSNBT(stats, pilihanDetail, toList);

  // ChartJS line chart data for TO trends
  const toLabels = toList.map((t: any) => `TO ${t.to_ke} (${t.bulan})`);
  const tertimbangData = toList.map((t: any) => t.skor_tertimbang);
  const tpsData = toList.map((t: any) => t.skor_tps);
  const litData = toList.map((t: any) => t.skor_literasi);
  const target730 = toList.map(() => 730);
  const target710 = toList.map(() => 710);

  // Radar values
  const radarLabels = ['PU', 'PBM', 'PPU', 'PK', 'LBI', 'LBE', 'PM'];
  const radarValues = [
    stats.avgSubtes.pu,
    stats.avgSubtes.pbm,
    stats.avgSubtes.ppu,
    stats.avgSubtes.pk,
    stats.avgSubtes.lbi,
    stats.avgSubtes.lbe,
    stats.avgSubtes.pm,
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions - Neo-Brutalism */}
      <div className="neo-card p-6 sm:p-7 bg-rose-600 text-white relative overflow-hidden shadow-[6px_6px_0px_#0f172a] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 neo-badge px-3 py-1 bg-amber-300 text-[#0f172a] text-xs font-black mb-3">
            <span>🎯 Rasionalisasi SNBT 2027 (Formula 60 : 40)</span>
            <span>•</span>
            <span>Tren: {stats.trendLabel}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Rata-rata Tertimbang:{' '}
            <span className="text-amber-300 font-mono underline decoration-amber-400">
              {stats.avgTert}
            </span>
          </h2>

          <div className="flex flex-wrap gap-2.5 mt-2.5 text-xs text-white font-bold">
            <span className="neo-badge px-2.5 py-0.5 bg-black/20 text-white">
              Terbaik: <strong>{stats.best}</strong>
            </span>
            <span className="neo-badge px-2.5 py-0.5 bg-black/20 text-white">
              Terbaru: <strong>{stats.latest}</strong>
            </span>
            <span className="neo-badge px-2.5 py-0.5 bg-black/20 text-white">
              TPS (60%): <strong>{stats.avgTPS}</strong>
            </span>
            <span className="neo-badge px-2.5 py-0.5 bg-black/20 text-white">
              Literasi (40%): <strong>{stats.avgLit}</strong>
            </span>
            <span className="neo-badge px-2.5 py-0.5 bg-amber-300 text-[#0f172a]">
              {stats.validCount} dari 9 TO Terisi
            </span>
          </div>
        </div>
      </div>

      {/* Rasio Bar 60:40 */}
      <RatioBar6040
        tpsScore={stats.avgTPS}
        literasiScore={stats.avgLit}
        tertimbang={stats.avgTert}
      />

      {/* KESIMPULAN HASIL ANALISIS SNBT (Realtime) - Neo-Brutalism */}
      <div className="neo-card p-6 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#0f172a]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Rangkuman Evaluasi UTBK • Update Realtime</span>
              </div>
              <h3 className="text-lg font-black text-[#0f172a] dark:text-white">
                Kesimpulan Hasil Analisis SNBT 2027
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="neo-badge px-3.5 py-1.5 text-xs font-black bg-rose-600 text-white shadow-[2px_2px_0px_#0f172a]">
              {kesimpulanStrategi.kesimpulan.statusCapaian}
            </span>
          </div>
        </div>

        {/* Grid 4 Poin Kesimpulan Kunci */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="neo-card-sm p-4 bg-rose-50 dark:bg-[#1E1540] space-y-1.5 shadow-[2px_2px_0px_#0f172a]">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300" />
              <span>Posisi Terhadap Target Ambang Masuk (NAM)</span>
            </span>
            <p className="text-slate-800 dark:text-purple-100 font-bold leading-relaxed">
              {kesimpulanStrategi.kesimpulan.posisiTarget}
            </p>
          </div>

          <div className="neo-card-sm p-4 bg-purple-50 dark:bg-[#1E1540] space-y-1.5 shadow-[2px_2px_0px_#0f172a]">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
              <span>Evaluasi Subtes Kunci (Kekuatan vs Kelemahan)</span>
            </span>
            <p className="text-slate-800 dark:text-purple-100 font-bold leading-relaxed">
              {kesimpulanStrategi.kesimpulan.evaluasiSubtesKunci}
            </p>
          </div>

          <div className="neo-card-sm p-4 bg-rose-50 dark:bg-[#1E1540] space-y-1.5 shadow-[2px_2px_0px_#0f172a]">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300" />
              <span>Konsistensi &amp; Rekapitulasi Try Out</span>
            </span>
            <p className="text-slate-800 dark:text-purple-100 font-bold leading-relaxed">
              {kesimpulanStrategi.kesimpulan.konsistensiTryOut}
            </p>
          </div>

          <div className="neo-card-sm p-4 bg-amber-50 dark:bg-[#1E1540] space-y-1.5 shadow-[2px_2px_0px_#0f172a]">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
              <span>Rata-rata Skor Tertimbang Saat Ini</span>
            </span>
            <p className="text-slate-800 dark:text-purple-100 font-bold leading-relaxed">
              Skor rata-rata tertimbang Anda adalah <strong className="font-mono text-rose-700 dark:text-rose-300 font-black">{kesimpulanStrategi.kesimpulan.rataTertimbang}</strong> (Formula 60% TPS + 40% Literasi &amp; Penalaran Matematika).
            </p>
          </div>
        </div>

        {/* Box Kesimpulan Akhir */}
        <div className="neo-card-sm p-4 bg-rose-200 dark:bg-rose-950 text-xs flex items-start gap-3 shadow-[2px_2px_0px_#0f172a]">
          <CheckCircle2 className="w-5 h-5 text-rose-900 dark:text-rose-200 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-black text-rose-950 dark:text-white text-xs block">
              Saran Evaluasi Utama UTBK-SNBT:
            </span>
            <p className="text-rose-950 dark:text-rose-100 leading-relaxed font-bold">
              {kesimpulanStrategi.kesimpulan.kesimpulanAkhir}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Line Chart & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Line Chart */}
        <ChartJSLine
          title="Tren Capaian 9 Try Out vs Garis Target (730 & 710)"
          labels={toLabels}
          datasets={[
            {
              label: 'Skor Tertimbang',
              data: tertimbangData,
              borderColor: '#7C3AED',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
            },
            {
              label: 'TPS (60%)',
              data: tpsData,
              borderColor: '#8B5CF6',
              borderDash: [4, 4],
            },
            {
              label: 'Literasi & PM (40%)',
              data: litData,
              borderColor: '#EF4444',
              borderDash: [4, 4],
            },
            {
              label: 'Target Unggulan (730)',
              data: target730,
              borderColor: '#F59E0B',
              borderDash: [6, 6],
            },
            {
              label: 'Target Cadangan (710)',
              data: target710,
              borderColor: '#10B981',
              borderDash: [6, 6],
            },
          ]}
          minVal={500}
          maxVal={800}
        />

        {/* Radar Chart */}
        <RadarChartSVG
          title="Analisis Kekuatan 7 Subtes (TPS Ungu & Literasi Merah)"
          labels={radarLabels}
          values={radarValues}
          maxVal={800}
        />
      </div>

      {/* Ketercapaian vs Target NAM Per Pilihan */}
      <div className="neo-card p-6 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a] space-y-4">
        <h3 className="font-black text-base text-[#0f172a] dark:text-white flex items-center justify-between border-b-2 border-[#0f172a]/20 pb-3">
          <span className="flex items-center gap-2">
            <Target className="w-5 h-5 text-rose-600" />
            <span>Ketercapaian Nilai Akhir Masuk (NAM) per Pilihan</span>
          </span>
          <span className="neo-badge px-3 py-1 bg-purple-200 text-[#0f172a] text-xs font-black">
            Rata-rata: {stats.avgTert}
          </span>
        </h3>

        {pilihanDetail.length === 0 ? (
          <div className="neo-card-sm p-4 bg-amber-100 text-[#0f172a] text-xs font-black text-center">
            Belum ada prodi yang dipilih. Silakan isi pada menu Pilihan PTN SNBT.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pilihanDetail.map((p: any) => {
              const kc = p.ketercapaian;
              return (
                <div
                  key={p.pilihan_ke}
                  className="neo-card-sm p-5 bg-white dark:bg-[#1E1540] space-y-3 shadow-[3px_3px_0px_#0f172a]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="neo-badge px-3 py-1 text-xs font-black bg-rose-200 text-[#0f172a]">
                        Pilihan {p.pilihan_ke}
                      </span>
                      {p.ptnTier && (
                        <span className="neo-badge px-2 py-0.5 text-[10px] font-black bg-amber-300 text-[#0f172a]">
                          {p.ptnTier}
                        </span>
                      )}
                      {p.isCustom && (
                        <span className="neo-badge px-2 py-0.5 text-[9px] font-black bg-purple-200 text-[#0f172a]">
                          ✏️ Mandiri
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg border-2 border-[#0f172a] ${kc.colorClass}`}>
                      {kc.statusLabel} ({kc.gap >= 0 ? `+${kc.gap}` : kc.gap})
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-base text-[#0f172a] dark:text-white">{p.prodi}</h4>
                    <p className="text-xs text-rose-700 dark:text-rose-300 font-black mt-0.5">{p.ptn_nama}</p>
                  </div>

                  {/* Skala Prediksi Skor Live */}
                  {p.skalaPrediksi && (
                    <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-[#160E2E] border-2 border-[#0f172a] space-y-2 shadow-[2px_2px_0px_#0f172a]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-700 dark:text-purple-300 font-black uppercase tracking-wider">
                          Skala Prediksi Lolos:
                        </span>
                        <span className={`neo-badge px-2.5 py-0.5 text-[10px] font-black ${p.skalaPrediksi.badgeColor}`}>
                          {p.skalaPrediksi.label} ({p.skalaPrediksi.chancePct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-purple-950 h-2.5 rounded-full overflow-hidden border border-[#0f172a]/20">
                        <div
                          className={`h-full bg-gradient-to-r ${p.skalaPrediksi.gradientColor} transition-all duration-500`}
                          style={{ width: `${p.skalaPrediksi.chancePct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-800 dark:text-purple-200 font-bold">
                        💡 {p.skalaPrediksi.advice}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t-2 border-[#0f172a]/15 text-xs space-y-1 font-mono font-bold">
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-purple-300 font-sans">Target NAM Masuk:</span>
                      <strong className="text-slate-900 dark:text-white font-black">{p.namTarget}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-purple-300 font-sans">Skor Rata-rata Anda:</span>
                      <strong className="text-purple-700 dark:text-purple-300 font-black">{stats.avgTert}</strong>
                    </div>
                  </div>

                  {/* Prioritas Subtes 6.4 */}
                  <div className="pt-2 border-t-2 border-[#0f172a]/15 text-xs space-y-1.5 font-sans">
                    <div className="text-[11px] font-black text-slate-800 dark:text-purple-200">
                      Subtes Prioritas Jurusan:
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="neo-badge px-2.5 py-0.5 text-[10px] font-black bg-purple-700 text-white">
                        ⭐ DOMINAN: {p.prioritas.dominan.toUpperCase()} ({stats.avgSubtes[p.prioritas.dominan]})
                      </span>
                      {p.prioritas.pendukung.map((pk: string) => (
                        <span key={pk} className="neo-badge px-2.5 py-0.5 text-[10px] font-black bg-rose-600 text-white">
                          🔧 PENDUKUNG: {pk.toUpperCase()} ({stats.avgSubtes[pk]})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6.3 Status per Subtes (Kuat, Cukup, Lemah) */}
      <div className="neo-card p-6 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a] space-y-4">
        <h4 className="font-black text-base text-[#0f172a] dark:text-white flex items-center gap-2 border-b-2 border-[#0f172a]/20 pb-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Evaluasi Penguasaan per Subtes</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(SUBTES_NAMES) as (keyof typeof SUBTES_NAMES)[]).map((k) => {
            const val = stats.avgSubtes[k];
            const st = getStatusSubtes(val);

            return (
              <div
                key={k}
                className="neo-card-sm p-4 bg-purple-50 dark:bg-[#1E1540] space-y-1 shadow-[2px_2px_0px_#0f172a]"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-900 dark:text-white uppercase">{k}</span>
                  <span className={`neo-badge px-2 py-0.2 text-[10px] font-black ${st.colorClass}`}>{st.status}</span>
                </div>
                <div className="text-2xl font-black font-mono text-[#0f172a] dark:text-white">
                  {val > 0 ? val : '-'}
                </div>
                <div className="text-xs text-slate-700 dark:text-purple-300 font-bold truncate">{st.keterangan}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6.5 3 Alternatif PTN SNBT */}
      {alternatif.length > 0 && (
        <div className="neo-card p-6 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#0f172a]/20 pb-3">
            <h4 className="font-black text-sm sm:text-base text-[#0f172a] dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span>3 Rekomendasi Alternatif PTN SNBT (Realistis Sesuai Skor Tertimbang)</span>
            </h4>
            <span className="neo-badge px-3 py-1 bg-amber-300 text-[#0f172a] text-xs font-black font-mono">
              Rentang: {stats.avgTert - 80} s.d. {stats.avgTert + 30}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {alternatif.map((alt: any, idx: number) => (
              <div
                key={idx}
                className="neo-card-sm p-4 bg-purple-50 dark:bg-[#1E1540] space-y-2 flex flex-col justify-between shadow-[3px_3px_0px_#0f172a]"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-slate-600 dark:text-purple-300">Alternatif {idx + 1}</span>
                    <span className={`neo-badge px-2 py-0.5 text-[10px] font-black ${alt.color}`}>{alt.label}</span>
                  </div>
                  <div className="font-black text-xs text-slate-900 dark:text-white">{alt.prodi}</div>
                  <div className="text-xs text-rose-700 dark:text-rose-300 font-black">{alt.ptn}</div>
                </div>

                <div className="pt-2 border-t-2 border-[#0f172a]/15 text-xs flex justify-between items-center font-mono">
                  <span>Target NAM: <strong className="font-black">{alt.skor}</strong></span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-black">Peluang: {alt.estimasiPeluang}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STRATEGI YANG HARUS DILAKUKAN SISWA (ACTION PLAN SNBT) */}
      <div className="neo-card p-6 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#0f172a]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] shrink-0">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Rencana Aksi Berdasarkan Analisis Skor</span>
              </div>
              <h3 className="text-lg font-black text-[#0f172a] dark:text-white">
                Strategi yang Harus Dilakukan Siswa (Action Plan SNBT 2027)
              </h3>
            </div>
          </div>
          <span className="neo-badge px-3 py-1 bg-rose-200 text-[#0f172a] text-xs font-black">
            {kesimpulanStrategi.strategi.length} Taktik Utama
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kesimpulanStrategi.strategi.map((strat: any, idx: number) => {
            const isKrusial = strat.prioritas === 'Krusial';
            const isTinggi = strat.prioritas === 'Tinggi';

            return (
              <div
                key={idx}
                className={`neo-card-sm p-4 transition-all space-y-3 shadow-[3px_3px_0px_#0f172a] ${
                  isKrusial
                    ? 'bg-amber-100 dark:bg-amber-950/40'
                    : isTinggi
                    ? 'bg-rose-100 dark:bg-rose-950/40'
                    : 'bg-purple-100 dark:bg-purple-950/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-700 dark:text-purple-300 uppercase tracking-wider block">
                      {strat.kategori}
                    </span>
                    <h4 className="font-black text-sm text-[#0f172a] dark:text-white leading-tight">
                      {strat.judul}
                    </h4>
                  </div>
                  <span
                    className={`neo-badge px-2.5 py-0.5 text-[10px] font-black flex-shrink-0 ${
                      isKrusial
                        ? 'bg-amber-400 text-[#0f172a]'
                        : isTinggi
                        ? 'bg-rose-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    Prioritas {strat.prioritas}
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-800 dark:text-purple-100 font-bold">
                  {strat.poinAksi.map((poin: string, pIdx: number) => (
                    <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-rose-700 dark:text-rose-300 flex-shrink-0 mt-0.5" />
                      <span>{poin}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6.7 Strategi Peningkatan Teks Tetap */}
      <div className="neo-card p-6 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a] space-y-4">
        <h4 className="font-black text-base text-[#0f172a] dark:text-white flex items-center gap-2 border-b-2 border-[#0f172a]/20 pb-3">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <span>7 Strategi Peningkatan Skor UTBK (Rekomendasi Ahli Bimbel)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-800 dark:text-purple-100 font-bold leading-relaxed">
          {STRATEGI_PENINGKATAN_SNBT.map((strat, idx) => (
            <div
              key={idx}
              className="neo-card-sm p-3.5 bg-purple-50 dark:bg-purple-950/40 flex items-start gap-2.5 shadow-[2px_2px_0px_#0f172a]"
            >
              <span className="w-5 h-5 rounded-full bg-purple-700 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#0f172a]">
                {idx + 1}
              </span>
              <span>{strat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
