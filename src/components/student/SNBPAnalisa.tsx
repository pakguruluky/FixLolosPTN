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
  Scale,
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

      {/* 5.10 Nilai Akhir SNBP (NAS) Card - Formulasi Standar Nasional */}
      <div className="bg-white dark:bg-[#160E2E] rounded-3xl p-6 sm:p-7 border-2 border-purple-300 dark:border-purple-800 shadow-md">
        {/* Header Formulasi Standar Nasional */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-purple-100 dark:border-purple-900/40 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 text-[11px] font-black border border-purple-200 dark:border-purple-700/60">
              <Scale className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
              <span>FORMULASI STANDAR NASIONAL (SNPMB PTN)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
              <Award className="w-6 h-6 text-amber-500 shrink-0" />
              <span>Nilai Akhir SNBP</span>
            </h3>
            <p className="text-xs text-gray-600 dark:text-purple-300/80 max-w-2xl">
              Perhitungan kelayakan berbasis 3 pilar resmi seleksi nasional: <strong>50% Rata-rata Rapor Akademik</strong> + <strong>30% Prestasi &amp; Bakat (TKA)</strong> + <strong>20% Rekam Jejak Sekolah</strong>.
            </p>
          </div>

          {/* Badge Skor & Kelayakan */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-purple-50/90 dark:bg-purple-950/60 px-4 py-3 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 self-start lg:self-auto shadow-sm">
            <div className="text-right">
              <div className="text-[10px] font-extrabold text-gray-500 dark:text-purple-300 uppercase tracking-wider">
                Status Kelayakan
              </div>
              <div className={`text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-full mt-0.5 inline-block ${
                nilaiAkhir.label.includes('Kompetitif')
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
              }`}>
                {nilaiAkhir.label}
              </div>
            </div>
            <div className="min-w-[5.6rem] px-3 py-2 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-mono text-center shadow-md shadow-purple-800/25 shrink-0">
              <div className="text-[10px] uppercase font-bold text-purple-200 tracking-wider">Nilai Akhir</div>
              <div className="text-2xl sm:text-3xl font-black leading-tight">
                {nilaiAkhir.nilaiAkhir}
              </div>
              <div className="text-[9px] text-purple-200/90 font-medium">dari 100 Poin</div>
            </div>
          </div>
        </div>

        {/* Visual Equation Banner (Rumus Formulasi) */}
        <div className="bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl p-4 border border-purple-200/80 dark:border-purple-800/60 my-5">
          <div className="text-[11px] font-black uppercase tracking-wider text-purple-800 dark:text-purple-300 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Struktur Penjumlahan Formulasi 3 Pilar</span>
            </span>
            <span className="text-[10px] font-bold text-gray-500 dark:text-purple-400">
              Maksimal 100 Poin
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {/* Pilar 1 */}
            <div className="bg-white dark:bg-[#1a1236] p-3 rounded-xl border border-purple-200 dark:border-purple-800 shadow-xs relative">
              <div className="text-[10px] font-extrabold uppercase text-purple-600 dark:text-purple-400">Pilar 1 (50%)</div>
              <div className="text-xs font-bold text-gray-800 dark:text-purple-100 truncate">Rapor Akademik</div>
              <div className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono mt-1">
                {nilaiAkhir.skorRapor50}
              </div>
              <div className="text-[10px] text-gray-400 font-medium">Maks. 50 Poin</div>
            </div>

            {/* Pilar 2 */}
            <div className="bg-white dark:bg-[#1a1236] p-3 rounded-xl border border-purple-200 dark:border-purple-800 shadow-xs relative">
              <div className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400">Pilar 2 (30%)</div>
              <div className="text-xs font-bold text-gray-800 dark:text-purple-100 truncate">Prestasi &amp; TKA</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                {nilaiAkhir.skorPrestasi30}
              </div>
              <div className="text-[10px] text-gray-400 font-medium">Maks. 30 Poin</div>
            </div>

            {/* Pilar 3 */}
            <div className="bg-white dark:bg-[#1a1236] p-3 rounded-xl border border-purple-200 dark:border-purple-800 shadow-xs relative">
              <div className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">Pilar 3 (20%)</div>
              <div className="text-xs font-bold text-gray-800 dark:text-purple-100 truncate">Rekam Jejak Sekolah</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {nilaiAkhir.skorTambahan20}
              </div>
              <div className="text-[10px] text-gray-400 font-medium">Maks. 20 Poin</div>
            </div>

            {/* Total Nilai Akhir */}
            <div className="bg-gradient-to-br from-purple-700 to-indigo-800 text-white p-3 rounded-xl shadow-md border border-purple-600/50">
              <div className="text-[10px] font-extrabold uppercase text-purple-200">Hasil Akhir</div>
              <div className="text-xs font-bold text-white truncate">Nilai Akhir SNBP</div>
              <div className="text-xl font-black text-white font-mono mt-1">
                {nilaiAkhir.nilaiAkhir}
              </div>
              <div className="text-[10px] text-purple-200 font-medium">Skala 0–100</div>
            </div>
          </div>
        </div>

        {/* 3 Pillars Formula Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Pilar 1 Card */}
          <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border-2 border-purple-200 dark:border-purple-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Pilar 1: Nilai Rapor</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-200/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 text-[10px] font-black">
                  Bobot 50%
                </span>
              </div>
              <div className="text-2xl font-black text-purple-900 dark:text-purple-100 font-mono">
                {nilaiAkhir.skorRapor50}{' '}
                <span className="text-xs font-normal text-gray-400">/ 50 Poin</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-purple-200/70 dark:bg-purple-900/50 h-2 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (nilaiAkhir.skorRapor50 / 50) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-gray-500 dark:text-purple-300/80 mt-1">
                <span>Capaian Pilar</span>
                <span>{Math.round((nilaiAkhir.skorRapor50 / 50) * 100)}%</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-purple-300/90 mt-3 pt-2 border-t border-purple-200/60 dark:border-purple-900/40">
              Dihitung dari rata-rata rapor semester 1 s.d. 5 ({peluang.rata_rapor}) dikonversi ke porsi 50%.
            </p>
          </div>

          {/* Pilar 2 Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Pilar 2: Prestasi &amp; TKA</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[10px] font-black">
                  Bobot 30%
                </span>
              </div>
              <div className="text-2xl font-black text-amber-900 dark:text-amber-100 font-mono">
                {nilaiAkhir.skorPrestasi30}{' '}
                <span className="text-xs font-normal text-gray-400">/ 30 Poin</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-amber-200/70 dark:bg-amber-900/50 h-2 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (nilaiAkhir.skorPrestasi30 / 30) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-gray-500 dark:text-amber-300/80 mt-1">
                <span>Capaian Pilar</span>
                <span>{Math.round((nilaiAkhir.skorPrestasi30 / 30) * 100)}%</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-amber-300/90 mt-3 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
              Sertifikat kompetisi terakreditasi + validasi skor Uji TKA IRT untuk memperkuat peluang prodi.
            </p>
          </div>

          {/* Pilar 3 Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-900/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>Pilar 3: Rekam Jejak Sekolah</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-black">
                  Bobot 20%
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100 font-mono">
                {nilaiAkhir.skorTambahan20}{' '}
                <span className="text-xs font-normal text-gray-400">/ 20 Poin</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-emerald-200/70 dark:bg-emerald-900/50 h-2 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (nilaiAkhir.skorTambahan20 / 20) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-gray-500 dark:text-emerald-300/80 mt-1">
                <span>Capaian Pilar</span>
                <span>{Math.round((nilaiAkhir.skorTambahan20 / 20) * 100)}%</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-emerald-300/90 mt-3 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
              Akreditasi SMA ({siswa.akreditasi || 'A'}), ranking paralel, dan sebaran alumni sekolah di PTN pilihan.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 dark:text-purple-400/60 mt-4 text-center">
          * Catatan: Formulasi Standar Nasional merupakan model analitik bimbingan belajar berbasis ketentuan SNPMB Kemendikbudristek. Keputusan akhir kelulusan mutlak berada pada seleksi nasional masing-masing PTN.
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Rincian Komponen Penilaian SNBP</span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-purple-300/80 mt-0.5">
              Evaluasi komprehensif pilar rapor, prestasi, rekam jejak sekolah, dan keketatan prodi pilihan
            </p>
          </div>
        </div>

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
                <tr
                  key={b.key}
                  className={`hover:bg-purple-50/30 ${
                    b.key === 'keketatan_prodi'
                      ? 'bg-pink-50/40 dark:bg-pink-950/20 font-medium'
                      : ''
                  }`}
                >
                  <td className="py-2 px-3 font-semibold text-gray-800 dark:text-purple-200 flex items-center gap-1.5">
                    {b.key === 'keketatan_prodi' && (
                      <span className="w-2 h-2 rounded-full bg-pink-500 inline-block shrink-0" />
                    )}
                    <span>{b.nama}</span>
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-gray-400">{b.bobotMaks}</td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-purple-700 dark:text-purple-300">
                    {b.poin}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-purple-950 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            b.key === 'keketatan_prodi'
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                              : 'bg-purple-600'
                          }`}
                          style={{ width: `${Math.min(100, b.persen)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px]">{b.persen}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-gray-600 dark:text-purple-300/90">{b.keterangan}</td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Baik'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : b.status === 'Cukup'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="font-bold border-t-2 border-purple-200 dark:border-purple-800 divide-y divide-purple-200 dark:divide-purple-800">
              {/* Baris 1: Subtotal Pra-Keketatan (Maks 95 Poin) */}
              <tr className="bg-purple-50/80 dark:bg-purple-950/50 text-gray-700 dark:text-purple-200 text-xs">
                <td className="py-2.5 px-3 font-bold text-purple-900 dark:text-purple-200">
                  Subtotal Pra-Keketatan (9 Pilar Rapor &amp; Sekolah)
                </td>
                <td className="py-2.5 px-2 text-center font-mono font-bold text-gray-500 dark:text-gray-400">
                  95
                </td>
                <td className="py-2.5 px-2 text-center font-mono font-bold text-purple-700 dark:text-purple-300">
                  {peluang.peluang_tanpa_keketatan}
                </td>
                <td className="py-2.5 px-3">
                  <span className="font-mono text-[11px]">
                    {Math.round((peluang.peluang_tanpa_keketatan / 95) * 100)}%
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[11px] text-gray-500">
                  Nilai sebelum ditambah poin keketatan prodi
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span className="text-[10px] text-gray-500 font-semibold">Subtotal</span>
                </td>
              </tr>

              {/* Baris 2: TOTAL AKHIR (MAKSIMAL 100 POIN) */}
              <tr className="bg-purple-100/90 dark:bg-purple-950/90 text-sm">
                <td className="py-3 px-3 text-purple-950 dark:text-purple-100 font-black">
                  TOTAL KOMPONEN PENILAIAN SNBP
                </td>
                <td className="py-3 px-2 text-center font-mono font-black text-purple-900 dark:text-purple-200">
                  100
                </td>
                <td className="py-3 px-2 text-center font-mono font-black text-purple-700 dark:text-purple-300 text-base">
                  {peluang.peluang_total}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 rounded-full bg-purple-200 dark:bg-purple-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round(peluang.peluang_total))}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs font-black">
                      {Math.round(peluang.peluang_total)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-[11px] text-purple-900 dark:text-purple-200 font-bold">
                  Akumulasi Final: 95 Pra-Keketatan + {peluang.skor_keketatan_final} Keketatan
                </td>
                <td className="py-3 px-2 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-black shadow-sm ${
                      peluang.peluang_total >= 76
                        ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                        : peluang.peluang_total >= 50
                        ? 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {peluang.peluang_total >= 76
                      ? 'Baik'
                      : peluang.peluang_total >= 50
                      ? 'Cukup'
                      : 'Tingkatkan'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Panduan & Info 4 Kategori Keketatan Prodi Favorit (Bobot Maksimal 5 Poin) */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50/50 to-indigo-50 dark:from-[#1E1540] dark:to-[#160E2E] border border-purple-200 dark:border-purple-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 dark:border-purple-900/50 pb-2">
            <div>
              <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider block">
                Parameter Tambahan 5 Poin Keketatan
              </span>
              <h5 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">
                Skala Keketatan Program Studi Favorit (Bobot Maks. 5 Poin)
              </h5>
            </div>
            {peluang.kategori_keketatan_final && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200 border border-pink-300 dark:border-pink-800 self-start sm:self-auto">
                Prodi Favorit Anda: {peluang.kategori_keketatan_final} (+{peluang.skor_keketatan_final} Poin)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {/* Kategori 1: Sangat Ketat */}
            <div className={`p-3 rounded-xl border transition-all ${
              peluang.kategori_keketatan_final === 'Sangat Ketat'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 ring-2 ring-rose-400/30'
                : 'bg-white/80 dark:bg-[#160E2E] border-rose-100 dark:border-rose-950/50'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="text-rose-700 dark:text-rose-400 font-extrabold">🔴 Sangat Ketat</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-black">
                  2.0 - 2.5 Poin
                </span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-purple-300/80 leading-snug">
                Keketatan <strong>&lt; 2.5%</strong>. Prodi super favorit (Kedokteran, TI UI/ITB/UGM). Persaingan sangat sengit.
              </p>
            </div>

            {/* Kategori 2: Ketat */}
            <div className={`p-3 rounded-xl border transition-all ${
              peluang.kategori_keketatan_final === 'Ketat'
                ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-400 dark:border-orange-600 ring-2 ring-orange-400/30'
                : 'bg-white/80 dark:bg-[#160E2E] border-orange-100 dark:border-orange-950/50'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="text-orange-700 dark:text-orange-400 font-extrabold">🟠 Ketat</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200 font-black">
                  3.0 - 3.5 Poin
                </span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-purple-300/80 leading-snug">
                Keketatan <strong>2.5% – 5.0%</strong>. Prodi favorit tinggi dengan selektivitas ketat.
              </p>
            </div>

            {/* Kategori 3: Sedang / Cukup Ketat */}
            <div className={`p-3 rounded-xl border transition-all ${
              peluang.kategori_keketatan_final === 'Sedang / Cukup Ketat'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/30'
                : 'bg-white/80 dark:bg-[#160E2E] border-amber-100 dark:border-amber-950/50'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="text-amber-700 dark:text-amber-400 font-extrabold">🟡 Sedang / Cukup Ketat</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-black">
                  4.0 - 4.5 Poin
                </span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-purple-300/80 leading-snug">
                Keketatan <strong>5.0% – 10.0%</strong>. Persaingan proporsional dengan peluang kompetisi terukur.
              </p>
            </div>

            {/* Kategori 4: Tidak Ketat */}
            <div className={`p-3 rounded-xl border transition-all ${
              peluang.kategori_keketatan_final === 'Tidak Ketat'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-400/30'
                : 'bg-white/80 dark:bg-[#160E2E] border-emerald-100 dark:border-emerald-950/50'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">🟢 Tidak Ketat</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-black">
                  5.0 Poin (Maks)
                </span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-purple-300/80 leading-snug">
                Keketatan <strong>&gt; 10.0%</strong>. Daya tampung longgar, peluang kelulusan dari faktor keketatan optimal.
              </p>
            </div>
          </div>
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
              Rapor, mapel prodi, ranking kelas &amp; sekolah, prestasi, akreditasi, dan alumni.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-[#160E2E] border border-purple-100 dark:border-purple-900/50">
            <span className="text-[10px] text-gray-500 dark:text-purple-300 font-bold block">
              Skor Keketatan Prodi Favorit
            </span>
            <div className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono mt-0.5">
              +{peluang.skor_keketatan_final} <span className="text-xs font-bold text-gray-400">/ 5 Poin</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Kategori <strong>{peluang.kategori_keketatan_final || 'Sedang / Cukup Ketat'}</strong> berdasarkan daya tampung &amp; peminat prodi pilihan.
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
              Total kumulatif akhir (95 Poin Pra-keketatan + {peluang.skor_keketatan_final} Poin Keketatan).
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
