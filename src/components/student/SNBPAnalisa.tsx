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
      {/* Top Banner / Actions - Neo-Brutalism */}
      <div className="neo-card p-6 sm:p-7 bg-purple-600 text-white relative overflow-hidden shadow-[6px_6px_0px_#0f172a] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 neo-badge px-3 py-1 bg-amber-300 text-[#0f172a] text-xs font-black mb-3">
            <span>✨ Rasionalisasi SNBP 2027</span>
            <span>•</span>
            <span>{peluang.hasTKA ? 'Terverifikasi TKA IRT' : 'Tanpa TKA'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Peluang Lolos Total:{' '}
            <span className="text-amber-300 font-mono underline decoration-amber-400">
              {peluang.peluang_total}%
            </span>
          </h2>

          <p className="text-xs text-purple-100 font-bold mt-1.5 max-w-xl leading-relaxed">
            Prediksi gabungan berdasarkan nilai rapor terbobot ({peluang.rata_rapor}), sertifikat ({peluang.skor_sertifikat} poin), akreditasi sekolah, rekam jejak alumni, dan keketatan prodi tujuan.
          </p>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-2">
          <span className="neo-badge px-4 py-2 bg-white text-[#0f172a] text-xs font-black shadow-[2px_2px_0px_#0f172a]">
            Status: {peluang.label_total}
          </span>
        </div>
      </div>

      {/* KESIMPULAN HASIL ANALISIS SNBP (Realtime) - Neo-Brutalism */}
      <div className="neo-card p-6 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#0f172a]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Rangkuman Eksekutif • Update Realtime</span>
              </div>
              <h3 className="text-lg font-black text-[#0f172a] dark:text-white">
                Kesimpulan Hasil Analisis SNBP 2027
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="neo-badge px-3.5 py-1.5 text-xs font-black bg-purple-600 text-white shadow-[2px_2px_0px_#0f172a]">
              {kesimpulanStrategi.kesimpulan.statusKelayakan}
            </span>
          </div>
        </div>

        {/* Grid 4 Poin Kesimpulan Kunci */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="neo-card-sm p-4 bg-purple-50 dark:bg-[#1E1540] space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-800 dark:text-purple-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
              <span>Modal Nilai Rapor &amp; NRM</span>
            </span>
            <p className="text-slate-800 dark:text-purple-100 font-bold leading-relaxed">
              {kesimpulanStrategi.kesimpulan.ringkasanRapor}
            </p>
          </div>

          <div className="neo-card-sm p-4 bg-indigo-50 dark:bg-[#1E1540] space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-200 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-300" />
              <span>Kesesuaian Mapel dengan Prodi Pilihan</span>
            </span>
            <p className="text-slate-800 dark:text-purple-100 font-bold leading-relaxed">
              {kesimpulanStrategi.kesimpulan.kesesuaianMapelProdi}
            </p>
          </div>

          <div className="neo-card-sm p-4 bg-emerald-50 dark:bg-[#1E1540] space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
              <span>Kredibilitas Validasi TKA IRT</span>
            </span>
            <p className="text-slate-800 dark:text-purple-100 font-bold leading-relaxed">
              {kesimpulanStrategi.kesimpulan.validasiTKA}
            </p>
          </div>

          <div className="neo-card-sm p-4 bg-amber-50 dark:bg-[#1E1540] space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
              <span>Daya Dukung Sekolah &amp; Prestasi</span>
            </span>
            <p className="text-slate-800 dark:text-purple-100 font-bold leading-relaxed">
              {kesimpulanStrategi.kesimpulan.dayaDukungSekolah}
            </p>
          </div>
        </div>

        {/* Box Kesimpulan Akhir */}
        <div className="neo-card-sm p-4 bg-purple-200 dark:bg-purple-950 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-purple-900 dark:text-purple-200 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-black text-purple-950 dark:text-white text-xs block">
              Saran Evaluasi Utama:
            </span>
            <p className="text-purple-950 dark:text-purple-100 leading-relaxed font-bold">
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
              className="neo-card p-5 bg-white dark:bg-[#181133] shadow-[4px_4px_0px_#0f172a] space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="neo-badge px-3 py-1 bg-purple-200 text-[#0f172a] text-xs font-black">
                    Pilihan {pil.pilihan_ke} {pil.pilihan_ke === 1 ? '(Utama)' : '(Cadangan)'}
                  </span>
                  {pil.tier && (
                    <span className="neo-badge px-2 py-0.5 bg-amber-300 text-[#0f172a] text-[10px] font-black">
                      {pil.tier}
                    </span>
                  )}
                  {pil.isCustom && (
                    <span className="neo-badge px-2 py-0.5 bg-pink-200 text-[#0f172a] text-[9px] font-black">
                      ✏️ Mandiri
                    </span>
                  )}
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg border-2 border-[#0f172a] ${pil.color_peluang} bg-gray-50 dark:bg-[#1E1540]`}>
                  {pil.label_peluang} ({pil.peluang_prodi}%)
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-[#0f172a] dark:text-white">
                  {pil.prodi}
                </h3>
                <div className="text-xs font-black text-purple-700 dark:text-purple-300">
                  {pil.ptn} ({pil.provinsi_ptn})
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-[#1E1540] border-2 border-[#0f172a] text-xs font-bold space-y-1.5 shadow-[2px_2px_0px_#0f172a]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 dark:text-purple-200">Nilai Rataan Minimal (NRM):</span>
                  <span className="font-mono font-black text-[#0f172a] dark:text-white">{pil.nrm > 0 ? pil.nrm : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 dark:text-purple-200">Mapel Pendukung 1 ({pil.mapelPendukung[0] || '-'}):</span>
                  <span className={pil.statusMapel.mapel1Ada ? 'text-emerald-700 dark:text-emerald-300 font-black' : 'text-rose-700 dark:text-rose-300 font-black'}>
                    {pil.statusMapel.mapel1Ada ? 'Ada di Rapor ✅' : 'Belum Ada ❌'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 dark:text-purple-200">Mapel Pendukung 2 ({pil.mapelPendukung[1] || '-'}):</span>
                  <span className={pil.statusMapel.mapel2Ada ? 'text-emerald-700 dark:text-emerald-300 font-black' : 'text-rose-700 dark:text-rose-300 font-black'}>
                    {pil.statusMapel.mapel2Ada ? 'Ada di Rapor ✅' : 'Belum Ada ❌'}
                  </span>
                </div>
              </div>

              {pil.ptnDetail && (
                <div className="text-xs text-slate-800 dark:text-purple-200 space-y-1 pt-1 border-t-2 border-[#0f172a]/15 font-bold">
                  <div>
                    <strong className="text-[#0f172a] dark:text-white">Keketatan:</strong>{' '}
                    {pil.ptnDetail.keketatan} ({pil.ptnDetail.tingkatKetetatan})
                  </div>
                  <div>
                    <strong className="text-[#0f172a] dark:text-white">Portofolio:</strong>{' '}
                    {pil.ptnDetail.portfolio}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="neo-card-sm p-4 bg-amber-200 text-[#0f172a] text-xs font-black flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>Anda belum memilih PTN pada menu Pilihan PTN SNBP. Silakan tentukan pilihan Anda.</span>
        </div>
      )}

      {/* EVALUASI KESESUAIAN MAPEL RAPOR & NILAI TKA DENGAN PILIHAN SISWA (Realtime) */}
      {kesesuaianMapel.length > 0 && (
        <div className="neo-card p-6 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#0f172a]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Kesesuaian Rapor &amp; TKA • Terhubung Realtime</span>
                </div>
                <h3 className="text-lg font-black text-[#0f172a] dark:text-white">
                  Evaluasi Kesesuaian Mapel Rapor &amp; Nilai TKA dengan Pilihan Siswa
                </h3>
              </div>
            </div>
            <span className="neo-badge px-3 py-1 bg-indigo-100 text-[#0f172a] text-xs font-black">
              Kepmendikbudristek 345 &amp; Kepmendikdasmen 102
            </span>
          </div>

          <div className="space-y-4">
            {kesesuaianMapel.map((km: any) => (
              <div
                key={km.pilihan_ke}
                className="neo-card-sm p-5 bg-indigo-50/50 dark:bg-purple-950/30 space-y-4 shadow-[3px_3px_0px_#0f172a]"
              >
                {/* Header Pilihan */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="neo-badge px-3 py-0.5 text-xs font-black bg-indigo-700 text-white">
                        Pilihan {km.pilihan_ke}
                      </span>
                      <span className="text-base font-black text-[#0f172a] dark:text-white">
                        {km.prodi}
                      </span>
                    </div>
                    <span className="text-xs text-indigo-700 dark:text-indigo-300 font-black block mt-1">
                      {km.ptn}
                    </span>
                  </div>

                  {/* Meter Indeks Keselarasan */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-700 dark:text-purple-300 block">Indeks Keselarasan</span>
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-lg border-2 border-[#0f172a] ${
                          km.statusKesesuaian === 'Sangat Selaras'
                            ? 'bg-emerald-200 text-[#0f172a]'
                            : km.statusKesesuaian === 'Selaras'
                            ? 'bg-indigo-200 text-[#0f172a]'
                            : km.statusKesesuaian === 'Cukup Selaras'
                            ? 'bg-amber-200 text-[#0f172a]'
                            : 'bg-rose-200 text-[#0f172a]'
                        }`}
                      >
                        {km.statusKesesuaian} ({km.indeksKesesuaian}%)
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-700 text-white font-mono font-black text-sm flex items-center justify-center border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a]">
                      {km.indeksKesesuaian}%
                    </div>
                  </div>
                </div>

                {/* Tabel Mapel Pendukung Rapor vs TKA */}
                <div className="overflow-x-auto rounded-xl border-2 border-[#0f172a] bg-white dark:bg-[#160E2E]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0f172a] text-white font-black text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Mapel Pendukung Prodi</th>
                        <th className="py-2.5 px-3 text-center">Nilai Rapor Terbobot</th>
                        <th className="py-2.5 px-3 text-center">Skor TKA (IRT / Skala 100)</th>
                        <th className="py-2.5 px-3 text-center">Selisih (GAP)</th>
                        <th className="py-2.5 px-3 text-center">Status Kesesuaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[#0f172a]/15 font-mono text-[11px]">
                      {km.detailMapel.map((dm: any) => (
                        <tr key={dm.nama} className="hover:bg-indigo-50/50 dark:hover:bg-purple-950/30">
                          <td className="py-2.5 px-3 font-sans font-black text-slate-900 dark:text-white">
                            {dm.nama}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {dm.adaDiRapor ? (
                              <span className="font-black text-purple-700 dark:text-purple-300">
                                {dm.nilaiRaporTerbobot.toFixed(2)} ✅
                              </span>
                            ) : (
                              <span className="text-rose-600 font-sans text-[10px] font-black">
                                Belum Ada Nilai ❌
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {dm.adaDiTKA ? (
                              <span className="font-black text-indigo-700 dark:text-indigo-300">
                                IRT: {dm.skorTKA_IRT} ({dm.skorTKA_100.toFixed(1)})
                              </span>
                            ) : (
                              <span className="text-slate-500 font-sans text-[10px] font-bold">
                                Tidak Diambil di TKA
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {dm.adaDiRapor && dm.adaDiTKA ? (
                              <span
                                className={`font-black ${
                                  dm.gapRaporTKA <= 10
                                    ? 'text-emerald-700 dark:text-emerald-300'
                                    : dm.gapRaporTKA <= 20
                                    ? 'text-amber-700 dark:text-amber-300'
                                    : 'text-rose-700 dark:text-rose-300'
                                }`}
                              >
                                {dm.gapRaporTKA.toFixed(1)} poin
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-sans">
                            <span
                              className={`neo-badge px-2 py-0.5 text-[10px] font-black ${
                                dm.statusKesesuaian === 'Sangat Sesuai'
                                  ? 'bg-emerald-200 text-[#0f172a]'
                                  : dm.statusKesesuaian === 'Sesuai'
                                  ? 'bg-indigo-200 text-[#0f172a]'
                                  : dm.statusKesesuaian === 'Perlu Perhatian'
                                  ? 'bg-amber-200 text-[#0f172a]'
                                  : 'bg-rose-200 text-[#0f172a]'
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
                <div className="neo-card-sm p-3.5 bg-white dark:bg-[#160E2E] text-xs text-slate-800 dark:text-purple-100 flex items-start gap-2.5 font-bold">
                  <Info className="w-4 h-4 text-indigo-700 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#0f172a] dark:text-white">Analisis Keselarasan:</strong> {km.catatanKesesuaian}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5.10 Nilai Akhir SNBP (NAS) Card - Formulasi Standar Nasional */}
      <div className="neo-card p-6 sm:p-7 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a]">
        {/* Header Formulasi Standar Nasional */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b-2 border-[#0f172a]/20 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 neo-badge px-3 py-1 bg-purple-200 text-[#0f172a] text-[11px] font-black">
              <Scale className="w-3.5 h-3.5 text-purple-700" />
              <span>FORMULASI STANDAR NASIONAL (SNPMB PTN)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white flex items-center gap-2.5">
              <Award className="w-6 h-6 text-amber-500 shrink-0" />
              <span>Nilai Akhir SNBP</span>
            </h3>
            <p className="text-xs text-slate-700 dark:text-purple-200 font-bold max-w-2xl leading-relaxed">
              Perhitungan kelayakan berbasis 3 pilar resmi seleksi nasional: <strong className="text-purple-700 dark:text-purple-300">50% Rata-rata Rapor Akademik</strong> + <strong className="text-amber-700 dark:text-amber-300">30% Prestasi &amp; Bakat (TKA)</strong> + <strong className="text-emerald-700 dark:text-emerald-300">20% Rekam Jejak Sekolah</strong>.
            </p>
          </div>

          {/* Badge Skor & Kelayakan */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 neo-card-sm px-4 py-3 bg-purple-100 dark:bg-[#1E1540] self-start lg:self-auto shadow-[3px_3px_0px_#0f172a]">
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-700 dark:text-purple-300 uppercase tracking-wider">
                Status Kelayakan
              </div>
              <div className={`text-xs sm:text-sm font-black neo-badge px-3 py-0.5 mt-1 inline-block ${
                nilaiAkhir.label.includes('Kompetitif')
                  ? 'bg-emerald-300 text-[#0f172a]'
                  : 'bg-amber-300 text-[#0f172a]'
              }`}>
                {nilaiAkhir.label}
              </div>
            </div>
            <div className="min-w-[5.6rem] px-3.5 py-2.5 rounded-xl bg-purple-700 text-white font-mono text-center border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] shrink-0">
              <div className="text-[10px] uppercase font-black text-purple-200 tracking-wider">Nilai Akhir</div>
              <div className="text-2xl sm:text-3xl font-black leading-tight text-white">
                {nilaiAkhir.nilaiAkhir}
              </div>
              <div className="text-[9px] text-purple-200 font-bold">dari 100 Poin</div>
            </div>
          </div>
        </div>

        {/* Visual Equation Banner (Rumus Formulasi) */}
        <div className="neo-card-sm p-4 bg-purple-100 dark:bg-purple-950/40 my-5 shadow-[3px_3px_0px_#0f172a]">
          <div className="text-[11px] font-black uppercase tracking-wider text-[#0f172a] dark:text-purple-200 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
              <span>Struktur Penjumlahan Formulasi 3 Pilar</span>
            </span>
            <span className="neo-badge px-2 py-0.5 bg-amber-300 text-[#0f172a] text-[10px] font-black">
              Maksimal 100 Poin
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {/* Pilar 1 */}
            <div className="neo-card-sm bg-white dark:bg-[#1a1236] p-3 shadow-[2px_2px_0px_#0f172a] relative">
              <div className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-300">Pilar 1 (50%)</div>
              <div className="text-xs font-black text-slate-900 dark:text-white truncate">Rapor Akademik</div>
              <div className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono mt-1">
                {nilaiAkhir.skorRapor50}
              </div>
              <div className="text-[10px] text-slate-600 dark:text-purple-300 font-bold">Maks. 50 Poin</div>
            </div>

            {/* Pilar 2 */}
            <div className="neo-card-sm bg-white dark:bg-[#1a1236] p-3 shadow-[2px_2px_0px_#0f172a] relative">
              <div className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">Pilar 2 (30%)</div>
              <div className="text-xs font-black text-slate-900 dark:text-white truncate">Prestasi &amp; TKA</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                {nilaiAkhir.skorPrestasi30}
              </div>
              <div className="text-[10px] text-slate-600 dark:text-purple-300 font-bold">Maks. 30 Poin</div>
            </div>

            {/* Pilar 3 */}
            <div className="neo-card-sm bg-white dark:bg-[#1a1236] p-3 shadow-[2px_2px_0px_#0f172a] relative">
              <div className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">Pilar 3 (20%)</div>
              <div className="text-xs font-black text-slate-900 dark:text-white truncate">Rekam Jejak Sekolah</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {nilaiAkhir.skorTambahan20}
              </div>
              <div className="text-[10px] text-slate-600 dark:text-purple-300 font-bold">Maks. 20 Poin</div>
            </div>

            {/* Total Nilai Akhir */}
            <div className="neo-card-sm bg-purple-700 text-white p-3 shadow-[2px_2px_0px_#0f172a]">
              <div className="text-[10px] font-black uppercase text-purple-200">Hasil Akhir</div>
              <div className="text-xs font-black text-white truncate">Nilai Akhir SNBP</div>
              <div className="text-xl font-black text-white font-mono mt-1">
                {nilaiAkhir.nilaiAkhir}
              </div>
              <div className="text-[10px] text-purple-200 font-bold">Skala 0–100</div>
            </div>
          </div>
        </div>

        {/* 3 Pillars Formula Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Pilar 1 Card */}
          <div className="neo-card-sm p-4 bg-purple-50 dark:bg-purple-950/40 flex flex-col justify-between shadow-[3px_3px_0px_#0f172a]">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-black text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Pilar 1: Nilai Rapor</span>
                </span>
                <span className="neo-badge px-2 py-0.5 bg-purple-200 text-[#0f172a] text-[10px] font-black">
                  Bobot 50%
                </span>
              </div>
              <div className="text-2xl font-black text-purple-900 dark:text-purple-100 font-mono">
                {nilaiAkhir.skorRapor50}{' '}
                <span className="text-xs font-bold text-slate-600 dark:text-purple-300">/ 50 Poin</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-purple-200 dark:bg-purple-900 h-2.5 rounded-full mt-2.5 overflow-hidden border border-[#0f172a]/20">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (nilaiAkhir.skorRapor50 / 50) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-700 dark:text-purple-300 mt-1.5">
                <span>Capaian Pilar</span>
                <span>{Math.round((nilaiAkhir.skorRapor50 / 50) * 100)}%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-purple-200 font-bold mt-3 pt-2 border-t-2 border-[#0f172a]/15">
              Dihitung dari rata-rata rapor semester 1 s.d. 5 ({peluang.rata_rapor}) dikonversi ke porsi 50%.
            </p>
          </div>

          {/* Pilar 2 Card */}
          <div className="neo-card-sm p-4 bg-amber-50 dark:bg-amber-950/20 flex flex-col justify-between shadow-[3px_3px_0px_#0f172a]">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Pilar 2: Prestasi &amp; TKA</span>
                </span>
                <span className="neo-badge px-2 py-0.5 bg-amber-200 text-[#0f172a] text-[10px] font-black">
                  Bobot 30%
                </span>
              </div>
              <div className="text-2xl font-black text-amber-900 dark:text-amber-100 font-mono">
                {nilaiAkhir.skorPrestasi30}{' '}
                <span className="text-xs font-bold text-slate-600 dark:text-purple-300">/ 30 Poin</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-amber-200 dark:bg-amber-900 h-2.5 rounded-full mt-2.5 overflow-hidden border border-[#0f172a]/20">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (nilaiAkhir.skorPrestasi30 / 30) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-700 dark:text-amber-300 mt-1.5">
                <span>Capaian Pilar</span>
                <span>{Math.round((nilaiAkhir.skorPrestasi30 / 30) * 100)}%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-purple-200 font-bold mt-3 pt-2 border-t-2 border-[#0f172a]/15">
              Sertifikat kompetisi terakreditasi + validasi skor Uji TKA IRT untuk memperkuat peluang prodi.
            </p>
          </div>

          {/* Pilar 3 Card */}
          <div className="neo-card-sm p-4 bg-emerald-50 dark:bg-emerald-950/20 flex flex-col justify-between shadow-[3px_3px_0px_#0f172a]">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>Pilar 3: Rekam Jejak Sekolah</span>
                </span>
                <span className="neo-badge px-2 py-0.5 bg-emerald-200 text-[#0f172a] text-[10px] font-black">
                  Bobot 20%
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100 font-mono">
                {nilaiAkhir.skorTambahan20}{' '}
                <span className="text-xs font-bold text-slate-600 dark:text-purple-300">/ 20 Poin</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-2.5 rounded-full mt-2.5 overflow-hidden border border-[#0f172a]/20">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (nilaiAkhir.skorTambahan20 / 20) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-700 dark:text-emerald-300 mt-1.5">
                <span>Capaian Pilar</span>
                <span>{Math.round((nilaiAkhir.skorTambahan20 / 20) * 100)}%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-purple-200 font-bold mt-3 pt-2 border-t-2 border-[#0f172a]/15">
              Akreditasi SMA ({siswa.akreditasi || 'A'}), ranking paralel, dan sebaran alumni sekolah di PTN pilihan.
            </p>
          </div>
        </div>

        <p className="text-[11px] font-bold text-slate-700 dark:text-purple-300 mt-4 text-center">
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
      <div className="neo-card p-6 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b-2 border-[#0f172a]/20 pb-3">
          <div>
            <h4 className="font-black text-base text-[#0f172a] dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Rincian Komponen Penilaian SNBP</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-purple-200 font-bold mt-1">
              Evaluasi komprehensif pilar rapor, prestasi, rekam jejak sekolah, dan keketatan prodi pilihan
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border-2 border-[#0f172a]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f172a] text-white font-black text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Komponen</th>
                <th className="py-2.5 px-2 text-center">Bobot Maks</th>
                <th className="py-2.5 px-2 text-center">Poin Didapat</th>
                <th className="py-2.5 px-3 min-w-[120px]">Capaian (%)</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#0f172a]/15">
              {peluang.breakdown.map((b: any) => (
                <tr
                  key={b.key}
                  className={`hover:bg-purple-50/50 ${
                    b.key === 'keketatan_prodi'
                      ? 'bg-pink-50 dark:bg-pink-950/30 font-bold'
                      : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    {b.key === 'keketatan_prodi' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block shrink-0" />
                    )}
                    <span>{b.nama}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-black text-slate-600 dark:text-purple-300">{b.bobotMaks}</td>
                  <td className="py-2.5 px-2 text-center font-mono font-black text-purple-700 dark:text-purple-300">
                    {b.poin}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2.5 rounded-full bg-slate-200 dark:bg-purple-950 overflow-hidden border border-[#0f172a]/20">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            b.key === 'keketatan_prodi'
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                              : 'bg-purple-600'
                          }`}
                          style={{ width: `${Math.min(100, b.persen)}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-black">{b.persen}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-800 dark:text-purple-100 font-bold">{b.keterangan}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`neo-badge px-2 py-0.5 text-[10px] font-black ${
                        b.status === 'Baik'
                          ? 'bg-emerald-200 text-[#0f172a]'
                          : b.status === 'Cukup'
                          ? 'bg-amber-200 text-[#0f172a]'
                          : 'bg-rose-200 text-[#0f172a]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="font-black border-t-2 border-[#0f172a] divide-y-2 divide-[#0f172a]/20">
              {/* Baris 1: Subtotal Pra-Keketatan (Maks 95 Poin) */}
              <tr className="bg-purple-100 dark:bg-purple-950/70 text-[#0f172a] dark:text-purple-100 text-xs">
                <td className="py-2.5 px-3 font-black text-purple-950 dark:text-white">
                  Subtotal Pra-Keketatan (9 Pilar Rapor &amp; Sekolah)
                </td>
                <td className="py-2.5 px-2 text-center font-mono font-black text-slate-700 dark:text-purple-300">
                  95
                </td>
                <td className="py-2.5 px-2 text-center font-mono font-black text-purple-700 dark:text-purple-300">
                  {peluang.peluang_tanpa_keketatan}
                </td>
                <td className="py-2.5 px-3">
                  <span className="font-mono text-xs font-black">
                    {Math.round((peluang.peluang_tanpa_keketatan / 95) * 100)}%
                  </span>
                </td>
                <td className="py-2.5 px-3 text-xs text-slate-700 dark:text-purple-300 font-bold">
                  Nilai sebelum ditambah poin keketatan prodi
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span className="neo-badge px-2 py-0.5 bg-white text-[#0f172a] text-[10px] font-black">Subtotal</span>
                </td>
              </tr>

              {/* Baris 2: TOTAL AKHIR (MAKSIMAL 100 POIN) */}
              <tr className="bg-purple-200 dark:bg-purple-900 text-sm">
                <td className="py-3 px-3 text-[#0f172a] dark:text-white font-black">
                  TOTAL KOMPONEN PENILAIAN SNBP
                </td>
                <td className="py-3 px-2 text-center font-mono font-black text-[#0f172a] dark:text-white">
                  100
                </td>
                <td className="py-3 px-2 text-center font-mono font-black text-purple-800 dark:text-purple-200 text-base">
                  {peluang.peluang_total}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 rounded-full bg-white dark:bg-purple-950 overflow-hidden border border-[#0f172a]/30">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round(peluang.peluang_total))}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs font-black text-[#0f172a] dark:text-white">
                      {Math.round(peluang.peluang_total)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-xs text-[#0f172a] dark:text-purple-100 font-black">
                  Akumulasi Final: 95 Pra-Keketatan + {peluang.skor_keketatan_final} Keketatan
                </td>
                <td className="py-3 px-2 text-center">
                  <span
                    className={`neo-badge px-3 py-1 text-xs font-black ${
                      peluang.peluang_total >= 76
                        ? 'bg-emerald-300 text-[#0f172a]'
                        : peluang.peluang_total >= 50
                        ? 'bg-amber-300 text-[#0f172a]'
                        : 'bg-rose-300 text-[#0f172a]'
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
        <div className="mt-5 neo-card-sm p-5 bg-purple-100 dark:bg-[#1E1540] space-y-3 shadow-[3px_3px_0px_#0f172a]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#0f172a]/20 pb-2">
            <div>
              <span className="text-[10px] font-black text-pink-700 dark:text-pink-300 uppercase tracking-wider block">
                Parameter Tambahan 5 Poin Keketatan
              </span>
              <h5 className="font-black text-sm text-[#0f172a] dark:text-white">
                Skala Keketatan Program Studi Favorit (Bobot Maks. 5 Poin)
              </h5>
            </div>
            {peluang.kategori_keketatan_final && (
              <span className="neo-badge px-3 py-1 text-xs font-black bg-pink-200 text-[#0f172a] self-start sm:self-auto">
                Prodi Favorit Anda: {peluang.kategori_keketatan_final} (+{peluang.skor_keketatan_final} Poin)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Kategori 1: Sangat Ketat */}
            <div className={`p-3.5 rounded-xl border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] transition-all ${
              peluang.kategori_keketatan_final === 'Sangat Ketat'
                ? 'bg-rose-200 text-[#0f172a]'
                : 'bg-white dark:bg-[#160E2E]'
            }`}>
              <div className="flex items-center justify-between font-black mb-1">
                <span className="text-rose-800 dark:text-rose-300">🔴 Sangat Ketat</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-white text-[#0f172a] border border-[#0f172a]">
                  2.0 - 2.5 Poin
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-purple-200 font-bold leading-snug">
                Keketatan <strong>&lt; 2.5%</strong>. Prodi super favorit (Kedokteran, TI UI/ITB/UGM). Persaingan sangat sengit.
              </p>
            </div>

            {/* Kategori 2: Ketat */}
            <div className={`p-3.5 rounded-xl border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] transition-all ${
              peluang.kategori_keketatan_final === 'Ketat'
                ? 'bg-orange-200 text-[#0f172a]'
                : 'bg-white dark:bg-[#160E2E]'
            }`}>
              <div className="flex items-center justify-between font-black mb-1">
                <span className="text-orange-800 dark:text-orange-300">🟠 Ketat</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-white text-[#0f172a] border border-[#0f172a]">
                  3.0 - 3.5 Poin
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-purple-200 font-bold leading-snug">
                Keketatan <strong>2.5% – 5.0%</strong>. Prodi favorit tinggi dengan selektivitas ketat.
              </p>
            </div>

            {/* Kategori 3: Sedang / Cukup Ketat */}
            <div className={`p-3.5 rounded-xl border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] transition-all ${
              peluang.kategori_keketatan_final === 'Sedang / Cukup Ketat'
                ? 'bg-amber-200 text-[#0f172a]'
                : 'bg-white dark:bg-[#160E2E]'
            }`}>
              <div className="flex items-center justify-between font-black mb-1">
                <span className="text-amber-800 dark:text-amber-300">🟡 Cukup Ketat</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-white text-[#0f172a] border border-[#0f172a]">
                  4.0 - 4.5 Poin
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-purple-200 font-bold leading-snug">
                Keketatan <strong>5.0% – 10.0%</strong>. Persaingan proporsional dengan peluang kompetisi terukur.
              </p>
            </div>

            {/* Kategori 4: Tidak Ketat */}
            <div className={`p-3.5 rounded-xl border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] transition-all ${
              peluang.kategori_keketatan_final === 'Tidak Ketat'
                ? 'bg-emerald-200 text-[#0f172a]'
                : 'bg-white dark:bg-[#160E2E]'
            }`}>
              <div className="flex items-center justify-between font-black mb-1">
                <span className="text-emerald-800 dark:text-emerald-300">🟢 Tidak Ketat</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-white text-[#0f172a] border border-[#0f172a]">
                  5.0 Poin (Maks)
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-purple-200 font-bold leading-snug">
                Keketatan <strong>&gt; 10.0%</strong>. Daya tampung longgar, peluang kelulusan dari faktor keketatan optimal.
              </p>
            </div>
          </div>
        </div>

        {/* Info Ringkasan 95 Poin Pra-Keketatan + 5 Poin Keketatan */}
        <div className="mt-5 neo-card-sm p-4 bg-purple-50 dark:bg-[#181133] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs shadow-[3px_3px_0px_#0f172a]">
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#160E2E] border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a]">
            <span className="text-[10px] text-slate-700 dark:text-purple-300 font-black block">
              Skor Pra-Keketatan
            </span>
            <div className="text-xl font-black text-purple-800 dark:text-purple-200 font-mono mt-0.5">
              {peluang.peluang_tanpa_keketatan} <span className="text-xs font-bold text-slate-500">/ 95 Poin</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-purple-200 font-bold mt-1">
              Rapor, mapel prodi, ranking kelas &amp; sekolah, prestasi, akreditasi, dan alumni.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#160E2E] border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a]">
            <span className="text-[10px] text-slate-700 dark:text-purple-300 font-black block">
              Skor Keketatan Prodi Favorit
            </span>
            <div className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono mt-0.5">
              +{peluang.skor_keketatan_final} <span className="text-xs font-bold text-slate-500">/ 5 Poin</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-purple-200 font-bold mt-1">
              Kategori <strong>{peluang.kategori_keketatan_final || 'Sedang / Cukup Ketat'}</strong> berdasarkan daya tampung &amp; peminat prodi pilihan.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-700 text-white border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a]">
            <span className="text-[10px] text-purple-200 font-black block">
              Peluang Lolos SNBP Final
            </span>
            <div className="text-2xl font-black font-mono mt-0.5 text-white">
              {peluang.peluang_total}% <span className="text-xs font-bold text-purple-200">/ 100%</span>
            </div>
            <p className="text-[11px] text-purple-200 font-bold mt-1">
              Total kumulatif akhir (95 Poin Pra-keketatan + {peluang.skor_keketatan_final} Poin Keketatan).
            </p>
          </div>
        </div>
      </div>

      {/* 5.11 Rekomendasi Nilai Semester Berikutnya */}
      {rekomendasiSemester.hasRekomendasi && (
        <div className="neo-card p-6 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#0f172a]/20 pb-3">
            <h4 className="font-black text-sm sm:text-base text-[#0f172a] dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Rekomendasi Target Semester {rekomendasiSemester.semBerikutnya} (Bobot: {rekomendasiSemester.bobotBerikutnya}%)</span>
            </h4>
            <span className="neo-badge px-3 py-1 bg-purple-200 text-[#0f172a] text-xs font-black">
              Target Rata-rata: {rekomendasiSemester.target_rata}
            </span>
          </div>

          <p className="text-xs text-slate-800 dark:text-purple-200 font-bold leading-relaxed">
            Berdasarkan semester terakhir yang terisi (Semester {rekomendasiSemester.semTerakhir}), berikut adalah fokus mapel unggulan dan target nilai yang direkomendasikan untuk mendongkrak peluang lolos SNBP Anda:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rekomendasiSemester.top2Mapel.map((item: any) => (
              <div
                key={item.mapel}
                className="neo-card-sm p-4 bg-purple-50 dark:bg-purple-950/40 space-y-2 shadow-[2px_2px_0px_#0f172a]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900 dark:text-white">{item.mapel}</span>
                  {item.isMapelProdi && (
                    <span className="neo-badge px-2 py-0.5 text-[9px] font-black bg-amber-300 text-[#0f172a]">
                      Mapel Prodi ⭐
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 dark:text-purple-300">Rata-rata Saat Ini: <strong>{item.rataM}</strong></span>
                  <span className="text-purple-800 dark:text-purple-200 font-black">
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
                className={`p-3 rounded-xl border-2 border-[#0f172a] text-xs ${
                  t.sem === `Sem ${rekomendasiSemester.semBerikutnya}`
                    ? 'bg-purple-200 text-[#0f172a] font-black shadow-[2px_2px_0px_#0f172a]'
                    : 'bg-white dark:bg-[#1E1540] text-slate-800 dark:text-purple-200 font-bold'
                }`}
              >
                <div className="font-black text-purple-800 dark:text-purple-300 mb-0.5">{t.sem}</div>
                <div>{t.tip}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5.12 3 Rekomendasi Alternatif PTN SNBP */}
      {rekomendasiAlternatif.length > 0 && (
        <div className="neo-card p-6 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#0f172a]/20 pb-3">
            <div>
              <h4 className="font-black text-sm sm:text-base text-[#0f172a] dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                <span>3 Rekomendasi PTN Alternatif (Sesuai Rata-rata Rapor)</span>
              </h4>
              <p className="text-xs text-slate-700 dark:text-purple-200 font-bold mt-0.5">
                Disaring dari seluruh database PTN berdasarkan NRM dalam rentang realistis ({peluang.rata_rapor - 15} s.d. {peluang.rata_rapor + 2}).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {rekomendasiAlternatif.map((alt: any, idx: number) => (
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
                  <div className="text-xs text-purple-800 dark:text-purple-300 font-black">{alt.ptn}</div>
                </div>

                <div className="pt-2 border-t-2 border-[#0f172a]/15 text-xs flex justify-between items-center font-mono">
                  <span>NRM: <strong className="font-black">{alt.nrm}</strong></span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-black">Peluang: {alt.estimasiPeluang}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STRATEGI YANG HARUS DILAKUKAN (ACTION PLAN SNBP) */}
      <div className="neo-card p-6 bg-white dark:bg-[#181133] shadow-[5px_5px_0px_#0f172a] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#0f172a]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] shrink-0">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Rencana Aksi Berdasarkan Data Riil</span>
              </div>
              <h3 className="text-lg font-black text-[#0f172a] dark:text-white">
                Strategi yang Harus Dilakukan Siswa (Action Plan SNBP 2027)
              </h3>
            </div>
          </div>
          <span className="neo-badge px-3 py-1 bg-purple-200 text-[#0f172a] text-xs font-black">
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
                className={`neo-card-sm p-4 transition-all space-y-3 shadow-[3px_3px_0px_#0f172a] ${
                  isKrusial
                    ? 'bg-amber-100 dark:bg-amber-950/40'
                    : isTinggi
                    ? 'bg-purple-100 dark:bg-purple-950/40'
                    : 'bg-indigo-100 dark:bg-indigo-950/40'
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
                        ? 'bg-purple-600 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    Prioritas {strat.prioritas}
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-800 dark:text-purple-100 font-bold">
                  {strat.poinAksi.map((poin: string, pIdx: number) => (
                    <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-purple-700 dark:text-purple-300 flex-shrink-0 mt-0.5" />
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
