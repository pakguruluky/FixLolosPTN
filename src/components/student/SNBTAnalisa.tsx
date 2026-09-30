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
      {/* Top Banner / Actions */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-purple-800 rounded-3xl p-6 text-white shadow-xl shadow-red-600/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-red-100 text-[11px] font-bold mb-3 backdrop-blur-sm">
            <span>🎯 Rasionalisasi SNBT 2027 (Formula 60 : 40)</span>
            <span>•</span>
            <span>Tren: {stats.trendLabel}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black">
            Rata-rata Tertimbang:{' '}
            <span className="text-amber-300 font-mono underline decoration-amber-400">
              {stats.avgTert}
            </span>
          </h2>

          <div className="flex flex-wrap gap-3 mt-2 text-xs text-red-100">
            <span>
              Terbaik: <strong>{stats.best}</strong>
            </span>
            <span>•</span>
            <span>
              Terbaru: <strong>{stats.latest}</strong>
            </span>
            <span>•</span>
            <span>
              TPS (60%): <strong>{stats.avgTPS}</strong>
            </span>
            <span>•</span>
            <span>
              Literasi (40%): <strong>{stats.avgLit}</strong>
            </span>
            <span>•</span>
            <span>
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

      {/* KESIMPULAN HASIL ANALISIS SNBT (Realtime) */}
      <div className="bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-[#1E1540] dark:to-[#160E2E] rounded-3xl p-6 border-2 border-red-200 dark:border-red-950/60 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-100 dark:border-red-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-700 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-700/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-300">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Rangkuman Evaluasi UTBK • Update Realtime</span>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Kesimpulan Hasil Analisis SNBT 2027
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-red-700 text-white shadow-sm">
              {kesimpulanStrategi.kesimpulan.statusCapaian}
            </span>
          </div>
        </div>

        {/* Grid 4 Poin Kesimpulan Kunci */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#160E2E] border border-red-100 dark:border-red-950/50 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-300 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span>Posisi Terhadap Target Ambang Masuk (NAM)</span>
            </span>
            <p className="text-gray-700 dark:text-purple-200/90 leading-relaxed">
              {kesimpulanStrategi.kesimpulan.posisiTarget}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#160E2E] border border-red-100 dark:border-red-950/50 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Evaluasi Subtes Kunci (Kekuatan vs Kelemahan)</span>
            </span>
            <p className="text-gray-700 dark:text-purple-200/90 leading-relaxed">
              {kesimpulanStrategi.kesimpulan.evaluasiSubtesKunci}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#160E2E] border border-red-100 dark:border-red-950/50 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Konsistensi &amp; Rekapitulasi Try Out</span>
            </span>
            <p className="text-gray-700 dark:text-purple-200/90 leading-relaxed">
              {kesimpulanStrategi.kesimpulan.konsistensiTryOut}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#160E2E] border border-red-100 dark:border-red-950/50 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>Rata-rata Skor Tertimbang Saat Ini</span>
            </span>
            <p className="text-gray-700 dark:text-purple-200/90 leading-relaxed">
              Skor rata-rata tertimbang Anda adalah <strong className="font-mono text-red-600 dark:text-red-400 font-black">{kesimpulanStrategi.kesimpulan.rataTertimbang}</strong> (Formula 60% TPS + 40% Literasi &amp; Penalaran Matematika).
            </p>
          </div>
        </div>

        {/* Box Kesimpulan Akhir */}
        <div className="p-4 rounded-2xl bg-red-100/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-red-700 dark:text-red-300 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-black text-red-950 dark:text-red-200 text-xs block">
              Saran Evaluasi Utama UTBK-SNBT:
            </span>
            <p className="text-red-950 dark:text-red-100 leading-relaxed font-medium">
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
      <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 border border-purple-100 dark:border-purple-950/40 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-5 h-5 text-red-600" />
            <span>Ketercapaian Nilai Akhir Masuk (NAM) per Pilihan</span>
          </span>
          <span className="text-xs text-gray-400">Rata-rata Tertimbang: {stats.avgTert}</span>
        </h3>

        {pilihanDetail.length === 0 ? (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1E1540] text-xs text-gray-400 text-center">
            Belum ada prodi yang dipilih. Silakan isi pada menu Pilihan PTN SNBT.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pilihanDetail.map((p: any) => {
              const kc = p.ketercapaian;
              return (
                <div
                  key={p.pilihan_ke}
                  className="p-5 rounded-2xl border-2 border-gray-100 dark:border-purple-900/60 bg-gray-50/50 dark:bg-[#1E1540]/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                        Pilihan {p.pilihan_ke}
                      </span>
                      {p.ptnTier && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                          {p.ptnTier}
                        </span>
                      )}
                      {p.isCustom && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                          ✏️ Mandiri
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-extrabold ${kc.colorClass}`}>
                      {kc.statusLabel} ({kc.gap >= 0 ? `+${kc.gap}` : kc.gap})
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{p.prodi}</h4>
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{p.ptn_nama}</p>
                  </div>

                  {/* Skala Prediksi Skor Live */}
                  {p.skalaPrediksi && (
                    <div className="p-3 rounded-2xl bg-white dark:bg-[#1E1540] border border-red-200/80 dark:border-purple-900/80 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          Skala Prediksi Lolos:
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${p.skalaPrediksi.badgeColor}`}>
                          {p.skalaPrediksi.label} ({p.skalaPrediksi.chancePct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${p.skalaPrediksi.gradientColor} transition-all duration-500`}
                          style={{ width: `${p.skalaPrediksi.chancePct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-purple-200/70 italic">
                        💡 {p.skalaPrediksi.advice}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-purple-100 dark:border-purple-950/40 text-xs space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-sans">Target NAM Masuk:</span>
                      <strong>{p.namTarget}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-sans">Skor Rata-rata Anda:</span>
                      <strong className="text-purple-700 dark:text-purple-300">{stats.avgTert}</strong>
                    </div>
                  </div>

                  {/* Prioritas Subtes 6.4 */}
                  <div className="pt-2 border-t border-purple-100 dark:border-purple-950/40 text-xs space-y-1.5 font-sans">
                    <div className="text-[11px] font-bold text-gray-700 dark:text-purple-200">
                      Subtes Prioritas Jurusan:
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-700 text-white">
                        ⭐ DOMINAN: {p.prioritas.dominan.toUpperCase()} ({stats.avgSubtes[p.prioritas.dominan]})
                      </span>
                      {p.prioritas.pendukung.map((pk: string) => (
                        <span key={pk} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white">
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
      <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 border border-purple-100 dark:border-purple-950/40 shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Evaluasi Penguasaan per Subtes</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(SUBTES_NAMES) as (keyof typeof SUBTES_NAMES)[]).map((k) => {
            const val = stats.avgSubtes[k];
            const st = getStatusSubtes(val);
            const isTPS = SUBTES_NAMES[k].grup === 'TPS';

            return (
              <div
                key={k}
                className="p-3.5 rounded-2xl border border-gray-100 dark:border-purple-900/60 bg-gray-50/50 dark:bg-[#1E1540]/60 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-gray-700 dark:text-purple-200 uppercase">{k}</span>
                  <span className={`font-bold ${st.colorClass}`}>{st.status}</span>
                </div>
                <div className="text-xl font-black font-mono text-gray-900 dark:text-white">
                  {val > 0 ? val : '-'}
                </div>
                <div className="text-[10px] text-gray-500 truncate">{st.keterangan}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6.5 3 Alternatif PTN SNBT */}
      {alternatif.length > 0 && (
        <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 border border-red-200 dark:border-red-950/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>3 Rekomendasi Alternatif PTN SNBT (Realistis Sesuai Skor Tertimbang)</span>
            </h4>
            <span className="text-xs text-gray-400 font-mono">
              Rentang: {stats.avgTert - 80} s.d. {stats.avgTert + 30}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {alternatif.map((alt: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-gray-100 dark:border-purple-900 bg-gray-50/50 dark:bg-[#1E1540]/60 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-400">Alternatif {idx + 1}</span>
                    <span className={`text-[10px] font-bold ${alt.color}`}>{alt.label}</span>
                  </div>
                  <div className="font-bold text-xs text-gray-900 dark:text-white">{alt.prodi}</div>
                  <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold">{alt.ptn}</div>
                </div>

                <div className="pt-2 border-t border-purple-50 dark:border-purple-950/40 text-[11px] flex justify-between items-center font-mono">
                  <span>Target NAM: <strong>{alt.skor}</strong></span>
                  <span className="text-emerald-600 font-bold">Peluang: {alt.estimasiPeluang}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STRATEGI YANG HARUS DILAKUKAN SISWA (ACTION PLAN SNBT) */}
      <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 border-2 border-red-200 dark:border-red-950/60 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-100 dark:border-red-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-700 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-700/30">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-300">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Rencana Aksi Berdasarkan Analisis Skor</span>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Strategi yang Harus Dilakukan Siswa (Action Plan SNBT 2027)
              </h3>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
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
                className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                  isKrusial
                    ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20'
                    : isTinggi
                    ? 'border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20'
                    : 'border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-[#1E1540]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      {strat.kategori}
                    </span>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight">
                      {strat.judul}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black flex-shrink-0 ${
                      isKrusial
                        ? 'bg-amber-500 text-white'
                        : isTinggi
                        ? 'bg-red-700 text-white'
                        : 'bg-purple-700 text-white'
                    }`}
                  >
                    Prioritas {strat.prioritas}
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-gray-700 dark:text-purple-200/90">
                  {strat.poinAksi.map((poin: string, pIdx: number) => (
                    <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
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
      <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 border border-purple-100 dark:border-purple-950/40 shadow-sm space-y-3">
        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <span>7 Strategi Peningkatan Skor UTBK (Rekomendasi Ahli Bimbel)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-purple-200/80 leading-relaxed">
          {STRATEGI_PENINGKATAN_SNBT.map((strat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-purple-700 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
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
