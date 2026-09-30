import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  BookOpen,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Zap,
  FileText,
  Target,
  ShieldCheck,
  Layers,
  ListChecks,
} from 'lucide-react';
import { Siswa } from '../../types';
import { getAnalisaLengkap } from '../../services/api';
import { BarChartSVG, PieChartSVG, ChartJSLine } from '../charts/SVGCharts';
import {
  calcKesesuaianMapelRaporTKA,
  generateKesimpulanStrategiSNBP,
} from '../../lib/calc';

interface SNBPAnalisaProps {
  siswa: Siswa;
}

export const SNBPAnalisa: React.FC<SNBPAnalisaProps> = ({ siswa }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalisa();
  }, [siswa]);

  const loadAnalisa = async () => {
    setLoading(true);
    try {
      const res = await getAnalisaLengkap(siswa.nis);
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
        Menghitung analisis rasionalisasi SNBP...
      </div>
    );
  }

  if (!data || data.nilaiRapor.length === 0) {
    return (
      <div className="bg-white dark:bg-[#160E2E] rounded-2xl border border-purple-100 dark:border-purple-950/40 p-8 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
          Data Rapor Belum Lengkap
        </h3>
        <p className="text-xs text-gray-500 dark:text-purple-300 max-w-md mx-auto">
          Silakan isi nilai rapor minimal satu semester pada menu <strong>Nilai Rapor</strong> untuk membuka seluruh kalkulasi analisa rasionalisasi peluang SNBP.
        </p>
      </div>
    );
  }

  const {
    peluang,
    nilaiAkhir,
    rekomendasiSemester,
    rekomendasiAlternatif,
    pilihan,
    nilaiRapor,
    tka,
  } = data;

  const kesesuaianMapel =
    data.kesesuaianMapel || calcKesesuaianMapelRaporTKA(pilihan, nilaiRapor, tka);

  const kesimpulanStrategi =
    data.kesimpulanStrategi || generateKesimpulanStrategiSNBP(peluang, kesesuaianMapel, siswa, pilihan);

  // Chart.js data per semester
  const semesterLabels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];
  const calcSemAvg = (semKey: 'sem1' | 'sem2' | 'sem3' | 'sem4' | 'sem5') => {
    const valid = nilaiRapor.map((r: any) => r[semKey]).filter((v: number) => v > 0);
    return valid.length > 0
      ? Number((valid.reduce((a: number, b: number) => a + b, 0) / valid.length).toFixed(1))
      : 0;
  };
  const semAvgValues = [
    calcSemAvg('sem1'),
    calcSemAvg('sem2'),
    calcSemAvg('sem3'),
    calcSemAvg('sem4'),
    calcSemAvg('sem5'),
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-[#7C3AED] rounded-3xl p-6 text-white shadow-xl shadow-purple-600/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-purple-100 text-[11px] font-bold mb-3 backdrop-blur-sm">
            <span>✨ Rasionalisasi SNBP 2027</span>
            <span>•</span>
            <span>{peluang.hasTKA ? 'Terverifikasi TKA IRT' : 'Tanpa TKA'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black">
            Peluang Lolos Total:{' '}
            <span className="text-amber-300 font-mono underline decoration-amber-400">
              {peluang.peluang_total}%
            </span>
          </h2>

          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            Prediksi gabungan berdasarkan nilai rapor terbobot ({peluang.rata_rapor}), sertifikat ({peluang.skor_sertifikat} poin), akreditasi sekolah, rekam jejak alumni, dan keketatan prodi tujuan.
          </p>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold border border-white/20">
            Status: {peluang.label_total}
          </span>
        </div>
      </div>

      {/* KESIMPULAN HASIL ANALISIS SNBP (Realtime) */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-[#1E1540] dark:to-[#160E2E] rounded-3xl p-6 border-2 border-purple-300 dark:border-purple-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-200 dark:border-purple-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-700/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Rangkuman Eksekutif • Update Realtime</span>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Kesimpulan Hasil Analisis SNBP 2027
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-purple-700 text-white shadow-sm">
              {kesimpulanStrategi.kesimpulan.statusKelayakan}
            </span>
          </div>
        </div>

        {/* Grid 4 Poin Kesimpulan Kunci */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#160E2E] border border-purple-100 dark:border-purple-900/60 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Modal Nilai Rapor &amp; NRM</span>
            </span>
            <p className="text-gray-700 dark:text-purple-200/90 leading-relaxed">
              {kesimpulanStrategi.kesimpulan.ringkasanRapor}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#160E2E] border border-purple-100 dark:border-purple-900/60 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span>Kesesuaian Mapel dengan Prodi Pilihan</span>
            </span>
            <p className="text-gray-700 dark:text-purple-200/90 leading-relaxed">
              {kesimpulanStrategi.kesimpulan.kesesuaianMapelProdi}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#160E2E] border border-purple-100 dark:border-purple-900/60 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Kredibilitas Validasi TKA IRT</span>
            </span>
            <p className="text-gray-700 dark:text-purple-200/90 leading-relaxed">
              {kesimpulanStrategi.kesimpulan.validasiTKA}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#160E2E] border border-purple-100 dark:border-purple-900/60 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>Daya Dukung Sekolah &amp; Prestasi</span>
            </span>
            <p className="text-gray-700 dark:text-purple-200/90 leading-relaxed">
              {kesimpulanStrategi.kesimpulan.dayaDukungSekolah}
            </p>
          </div>
        </div>

        {/* Box Kesimpulan Akhir */}
        <div className="p-4 rounded-2xl bg-purple-100/70 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-purple-700 dark:text-purple-300 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-black text-purple-900 dark:text-purple-100 text-xs block">
              Saran Evaluasi Utama:
            </span>
            <p className="text-purple-950 dark:text-purple-200 leading-relaxed font-medium">
              {kesimpulanStrategi.kesimpulan.kesimpulanAkhir}
            </p>
          </div>
        </div>
      </div>

      {/* Cards Per Pilihan PTN */}
      {peluang.pilihanAnalisa.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {peluang.pilihanAnalisa.map((pil: any) => (
            <div
              key={pil.pilihan_ke}
              className="bg-white dark:bg-[#160E2E] rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 p-5 shadow-sm space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                    Pilihan {pil.pilihan_ke} {pil.pilihan_ke === 1 ? '(Utama)' : '(Cadangan)'}
                  </span>
                  {pil.tier && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                      {pil.tier}
                    </span>
                  )}
                  {pil.isCustom && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300">
                      ✏️ Mandiri
                    </span>
                  )}
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${pil.color_peluang} bg-gray-50 dark:bg-[#1E1540]`}>
                  {pil.label_peluang} ({pil.peluang_prodi}%)
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {pil.prodi}
                </h3>
                <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  {pil.ptn} ({pil.provinsi_ptn})
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Nilai Rataan Minimal (NRM):</span>
                  <span className="font-mono font-bold">{pil.nrm > 0 ? pil.nrm : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mapel Pendukung 1 ({pil.mapelPendukung[0] || '-'}):</span>
                  <span className={pil.statusMapel.mapel1Ada ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {pil.statusMapel.mapel1Ada ? 'Ada di Rapor ✅' : 'Belum Ada ❌'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mapel Pendukung 2 ({pil.mapelPendukung[1] || '-'}):</span>
                  <span className={pil.statusMapel.mapel2Ada ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {pil.statusMapel.mapel2Ada ? 'Ada di Rapor ✅' : 'Belum Ada ❌'}
                  </span>
                </div>
              </div>

              {pil.ptnDetail && (
                <div className="text-[11px] text-gray-500 dark:text-purple-300/80 space-y-1 pt-1 border-t border-purple-50 dark:border-purple-950/30">
                  <div>
                    <strong className="text-gray-700 dark:text-purple-200">Keketatan:</strong>{' '}
                    {pil.ptnDetail.keketatan} ({pil.ptnDetail.tingkatKetetatan})
                  </div>
                  <div>
                    <strong className="text-gray-700 dark:text-purple-200">Portofolio:</strong>{' '}
                    {pil.ptnDetail.portfolio}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>Anda belum memilih PTN pada menu Pilihan PTN SNBP. Silakan tentukan pilihan Anda.</span>
        </div>
      )}

      {/* EVALUASI KESESUAIAN MAPEL RAPOR & NILAI TKA DENGAN PILIHAN SISWA (Realtime) */}
      {kesesuaianMapel.length > 0 && (
        <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-indigo-950/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-700/30">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Kesesuaian Rapor &amp; TKA • Terhubung Realtime</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Evaluasi Kesesuaian Mapel Rapor &amp; Nilai TKA dengan Pilihan Siswa
                </h3>
              </div>
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-purple-300">
              Kepmendikbudristek 345 &amp; Kepmendikdasmen 102
            </span>
          </div>

          <div className="space-y-4">
            {kesesuaianMapel.map((km: any) => (
              <div
                key={km.pilihan_ke}
                className="p-5 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-purple-950/20 space-y-4"
              >
                {/* Header Pilihan */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-700 text-white">
                        Pilihan {km.pilihan_ke}
                      </span>
                      <span className="text-base font-black text-gray-900 dark:text-white">
                        {km.prodi}
                      </span>
                    </div>
                    <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold block mt-0.5">
                      {km.ptn}
                    </span>
                  </div>

                  {/* Meter Indeks Keselarasan */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-500 block">Indeks Keselarasan</span>
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
                          km.statusKesesuaian === 'Sangat Selaras'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : km.statusKesesuaian === 'Selaras'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                            : km.statusKesesuaian === 'Cukup Selaras'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {km.statusKesesuaian} ({km.indeksKesesuaian}%)
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-700 text-white font-mono font-black text-sm flex items-center justify-center shadow-md">
                      {km.indeksKesesuaian}%
                    </div>
                  </div>
                </div>

                {/* Tabel Mapel Pendukung Rapor vs TKA */}
                <div className="overflow-x-auto rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-white dark:bg-[#160E2E]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-indigo-700 text-white font-bold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Mapel Pendukung Prodi</th>
                        <th className="py-2.5 px-3 text-center">Nilai Rapor Terbobot</th>
                        <th className="py-2.5 px-3 text-center">Skor TKA (IRT / Skala 100)</th>
                        <th className="py-2.5 px-3 text-center">Selisih (GAP)</th>
                        <th className="py-2.5 px-3 text-center">Status Kesesuaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50 dark:divide-purple-950/40 font-mono text-[11px]">
                      {km.detailMapel.map((dm: any) => (
                        <tr key={dm.nama} className="hover:bg-indigo-50/30 dark:hover:bg-purple-950/20">
                          <td className="py-2.5 px-3 font-sans font-bold text-gray-800 dark:text-purple-200">
                            {dm.nama}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {dm.adaDiRapor ? (
                              <span className="font-bold text-purple-700 dark:text-purple-300">
                                {dm.nilaiRaporTerbobot.toFixed(2)} ✅
                              </span>
                            ) : (
                              <span className="text-rose-500 font-sans text-[10px] font-bold">
                                Belum Ada Nilai ❌
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {dm.adaDiTKA ? (
                              <span className="font-bold text-indigo-700 dark:text-indigo-300">
                                IRT: {dm.skorTKA_IRT} ({dm.skorTKA_100.toFixed(1)})
                              </span>
                            ) : (
                              <span className="text-gray-400 font-sans text-[10px]">
                                Tidak Diambil di TKA
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {dm.adaDiRapor && dm.adaDiTKA ? (
                              <span
                                className={`font-bold ${
                                  dm.gapRaporTKA <= 10
                                    ? 'text-emerald-600'
                                    : dm.gapRaporTKA <= 20
                                    ? 'text-amber-600'
                                    : 'text-rose-600'
                                }`}
                              >
                                {dm.gapRaporTKA.toFixed(1)} poin
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-sans">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                dm.statusKesesuaian === 'Sangat Sesuai'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : dm.statusKesesuaian === 'Sesuai'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : dm.statusKesesuaian === 'Perlu Perhatian'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {dm.statusKesesuaian}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Catatan Keselarasan */}
                <div className="p-3 rounded-xl bg-white/80 dark:bg-[#160E2E] border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-gray-700 dark:text-purple-200/90 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Analisis Keselarasan:</strong> {km.catatanKesesuaian}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5.10 Nilai Akhir SNBP (NAS) Card */}
      <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 border-2 border-purple-300 dark:border-purple-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-900/40 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Formulasi Standar Nasional
            </span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Nilai Akhir SNBP (Skala 0–100)</span>
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-gray-500">Status Kelayakan:</div>
              <div className={`text-base font-black ${nilaiAkhir.color}`}>
                {nilaiAkhir.label}
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-purple-700 text-white font-mono font-black text-2xl flex items-center justify-center shadow-lg shadow-purple-600/25">
              {nilaiAkhir.nilaiAkhir}
            </div>
          </div>
        </div>

        {/* 3 Pillars Formula Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40">
            <div className="text-xs font-bold text-gray-500 dark:text-purple-300">
              Pilar 1: Nilai Rapor (50%)
            </div>
            <div className="text-xl font-black text-purple-800 dark:text-purple-200 mt-1 font-mono">
              {nilaiAkhir.skorRapor50} <span className="text-xs font-normal text-gray-400">/ 50</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Dihitung dari rata-rata rapor 5 semester terbobot.</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40">
            <div className="text-xs font-bold text-gray-500 dark:text-purple-300">
              Pilar 2: Prestasi & TKA (30%)
            </div>
            <div className="text-xl font-black text-purple-800 dark:text-purple-200 mt-1 font-mono">
              {nilaiAkhir.skorPrestasi30} <span className="text-xs font-normal text-gray-400">/ 30</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Sertifikat terakreditasi + bonus TKA IRT &gt;60.</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40">
            <div className="text-xs font-bold text-gray-500 dark:text-purple-300">
              Pilar 3: Rekam Jejak Sekolah (20%)
            </div>
            <div className="text-xl font-black text-purple-800 dark:text-purple-200 mt-1 font-mono">
              {nilaiAkhir.skorTambahan20} <span className="text-xs font-normal text-gray-400">/ 20</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Akreditasi sekolah, ranking, dan alumni di PTN pilihan.</p>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 dark:text-purple-400/60 mt-4 text-center">
          * Catatan: Nilai Akhir SNBP merupakan perkiraan berbasis model statistik bimbingan belajar. Keputusan mutlak berada pada seleksi nasional masing-masing PTN.
        </p>
      </div>

      {/* Visual Charts: Bar & Pie Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BarChartSVG
          title="Distribusi Poin Komponen Peluang SNBP"
          labels={peluang.breakdown.map((b: any) => b.nama)}
          values={peluang.breakdown.map((b: any) => b.poin)}
          colors={['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#E8A020', '#10B981', '#3B82F6', '#6366F1']}
          maxVal={25}
        />

        <PieChartSVG
          title="Komposisi Bobot Terisi (%)"
          labels={peluang.breakdown.map((b: any) => b.nama)}
          values={peluang.breakdown.map((b: any) => Math.max(1, b.poin))}
        />
      </div>

      {/* Chart.js Line Chart Rata-rata Rapor per Semester */}
      <ChartJSLine
        title="Tren Nilai Rapor Semester 1 s.d. Semester 5"
        labels={semesterLabels}
        datasets={[
          {
            label: 'Rata-rata Semester',
            data: semAvgValues,
            borderColor: '#7C3AED',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
          },
        ]}
        minVal={70}
        maxVal={100}
      />

      {/* Breakdown Komponen Table */}
      <div className="bg-white dark:bg-[#160E2E] rounded-2xl border border-purple-100 dark:border-purple-950/40 p-5 shadow-sm">
        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-3">
          Rincian Komponen Penilaian SNBP (Maksimal 95 Poin Pra-Keketatan)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-purple-50 dark:bg-purple-950/50 text-gray-700 dark:text-purple-200">
              <tr>
                <th className="py-2.5 px-3">Komponen</th>
                <th className="py-2.5 px-2 text-center">Bobot Maks</th>
                <th className="py-2.5 px-2 text-center">Poin Didapat</th>
                <th className="py-2.5 px-3 min-w-[120px]">Capaian (%)</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 dark:divide-purple-950/30">
              {peluang.breakdown.map((b: any) => (
                <tr key={b.key} className="hover:bg-purple-50/30">
                  <td className="py-2 px-3 font-semibold text-gray-800 dark:text-purple-200">{b.nama}</td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-gray-400">{b.bobotMaks}</td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-purple-700 dark:text-purple-300">
                    {b.poin}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-purple-950 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, b.persen)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px]">{b.persen}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-gray-500 dark:text-purple-300/80">{b.keterangan}</td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Baik'
                          ? 'bg-emerald-100 text-emerald-700'
                          : b.status === 'Cukup'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-purple-100/70 dark:bg-purple-950/80 font-bold border-t-2 border-purple-200 dark:border-purple-800">
              <tr>
                <td className="py-3 px-3 text-purple-900 dark:text-purple-100 font-extrabold">
                  TOTAL PRA-KEKETATAN (MAKS. 95 POIN)
                </td>
                <td className="py-3 px-2 text-center font-mono font-black text-purple-900 dark:text-purple-200">
                  95
                </td>
                <td className="py-3 px-2 text-center font-mono font-black text-purple-700 dark:text-purple-300 text-sm">
                  {peluang.peluang_tanpa_keketatan}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2.5 rounded-full bg-purple-200 dark:bg-purple-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((peluang.peluang_tanpa_keketatan / 95) * 100))}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] font-black">
                      {Math.round((peluang.peluang_tanpa_keketatan / 95) * 100)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-[11px] text-purple-800 dark:text-purple-200 font-semibold">
                  Akumulasi seluruh pilar rapor, prestasi &amp; sekolah
                </td>
                <td className="py-3 px-2 text-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      peluang.peluang_tanpa_keketatan >= 76
                        ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                        : peluang.peluang_tanpa_keketatan >= 50
                        ? 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {peluang.peluang_tanpa_keketatan >= 76
                      ? 'Baik'
                      : peluang.peluang_tanpa_keketatan >= 50
                      ? 'Cukup'
                      : 'Tingkatkan'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Info Ringkasan 95 Poin Pra-Keketatan + 5 Poin Keketatan */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 dark:from-[#1E1540] dark:to-[#160E2E] border border-purple-200 dark:border-purple-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-[#160E2E] border border-purple-100 dark:border-purple-900/50">
            <span className="text-[10px] text-gray-500 dark:text-purple-300 font-bold block">
              Skor Pra-Keketatan
            </span>
            <div className="text-xl font-black text-purple-800 dark:text-purple-200 font-mono mt-0.5">
              {peluang.peluang_tanpa_keketatan} <span className="text-xs font-bold text-gray-400">/ 95 Poin</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Rapor, mapel prodi, prestasi, dan rekam jejak sekolah.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-[#160E2E] border border-purple-100 dark:border-purple-900/50">
            <span className="text-[10px] text-gray-500 dark:text-purple-300 font-bold block">
              Skor Keketatan Prodi Tujuan
            </span>
            <div className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono mt-0.5">
              +{peluang.skor_keketatan_final} <span className="text-xs font-bold text-gray-400">/ 5 Poin</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Diperoleh jika rata-rata rapor Anda memenuhi ambang batas NRM prodi pilihan.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-700 text-white shadow-md">
            <span className="text-[10px] text-purple-200 font-bold block">
              Peluang Lolos SNBP Final
            </span>
            <div className="text-2xl font-black font-mono mt-0.5">
              {peluang.peluang_total}% <span className="text-xs font-bold text-purple-200">/ 100%</span>
            </div>
            <p className="text-[10px] text-purple-200/90 mt-1">
              Total kumulatif akhir (Pra-keketatan + keketatan prodi pilihan).
            </p>
          </div>
        </div>
      </div>

      {/* 5.11 Rekomendasi Nilai Semester Berikutnya */}
      {rekomendasiSemester.hasRekomendasi && (
        <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 border border-purple-200 dark:border-purple-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Rekomendasi Target Semester {rekomendasiSemester.semBerikutnya} (Bobot: {rekomendasiSemester.bobotBerikutnya}%)</span>
            </h4>
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
              Target Rata-rata: {rekomendasiSemester.target_rata}
            </span>
          </div>

          <p className="text-xs text-gray-600 dark:text-purple-200/80">
            Berdasarkan semester terakhir yang terisi (Semester {rekomendasiSemester.semTerakhir}), berikut adalah fokus mapel unggulan dan target nilai yang direkomendasikan untuk mendongkrak peluang lolos SNBP Anda:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rekomendasiSemester.top2Mapel.map((item: any) => (
              <div
                key={item.mapel}
                className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-800 dark:text-purple-200">{item.mapel}</span>
                  {item.isMapelProdi && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                      Mapel Prodi ⭐
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Rata-rata Saat Ini: <strong>{item.rataM}</strong></span>
                  <span className="text-purple-700 dark:text-purple-300 font-bold">
                    Target Sem {rekomendasiSemester.semBerikutnya}: <strong>{item.targetMapel}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tips per semester */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
            {rekomendasiSemester.tipsSemester.map((t: any) => (
              <div
                key={t.sem}
                className={`p-3 rounded-xl border text-[11px] ${
                  t.sem === `Sem ${rekomendasiSemester.semBerikutnya}`
                    ? 'border-purple-600 bg-purple-100/60 dark:bg-purple-900/60 font-semibold'
                    : 'border-gray-100 dark:border-purple-950/40 text-gray-500'
                }`}
              >
                <div className="font-bold text-purple-700 dark:text-purple-300 mb-0.5">{t.sem}</div>
                <div>{t.tip}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5.12 3 Rekomendasi Alternatif PTN SNBP */}
      {rekomendasiAlternatif.length > 0 && (
        <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 border border-purple-200 dark:border-purple-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>3 Rekomendasi PTN Alternatif (Sesuai Rata-rata Rapor)</span>
              </h4>
              <p className="text-xs text-gray-500 dark:text-purple-300 mt-0.5">
                Disaring dari seluruh database PTN berdasarkan NRM dalam rentang realistis ({peluang.rata_rapor - 15} s.d. {peluang.rata_rapor + 2}).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {rekomendasiAlternatif.map((alt: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-purple-100 dark:border-purple-900/60 bg-gray-50/50 dark:bg-[#1E1540]/60 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-400">Alternatif {idx + 1}</span>
                    <span className={`text-[10px] font-bold ${alt.color}`}>{alt.label}</span>
                  </div>
                  <div className="font-bold text-xs text-gray-900 dark:text-white">{alt.prodi}</div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">{alt.ptn}</div>
                </div>

                <div className="pt-2 border-t border-purple-50 dark:border-purple-950/40 text-[11px] flex justify-between items-center font-mono">
                  <span>NRM: <strong>{alt.nrm}</strong></span>
                  <span className="text-emerald-600 font-bold">Peluang: {alt.estimasiPeluang}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STRATEGI YANG HARUS DILAKUKAN (ACTION PLAN SNBP) */}
      <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 border-2 border-purple-200 dark:border-purple-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100 dark:border-purple-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-700 to-pink-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Rencana Aksi Berdasarkan Data Riil</span>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Strategi yang Harus Dilakukan Siswa (Action Plan SNBP 2027)
              </h3>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
            {kesimpulanStrategi.strategi.length} Langkah Taktis
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
                    ? 'border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20'
                    : 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-[#1E1540]/40'
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
                        ? 'bg-purple-700 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    Prioritas {strat.prioritas}
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-gray-700 dark:text-purple-200/90">
                  {strat.poinAksi.map((poin: string, pIdx: number) => (
                    <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>{poin}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
