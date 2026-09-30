import React from 'react';
import { ArrowLeft, Printer, Download, Sparkles, Award, Compass, TrendingUp, CheckCircle } from 'lucide-react';
import { Siswa, AppSettings } from '../types';
import { BarChartSVG, RatioBar6040, RadarChartSVG } from './charts/SVGCharts';
import { SUBTES_NAMES } from '../lib/calc';

interface LaporanCetakProps {
  type: 'snbp' | 'snbt';
  siswa: Siswa;
  settings: AppSettings;
  data: any; // full analisa data
  onBack: () => void;
}

export const LaporanCetak: React.FC<LaporanCetakProps> = ({
  type,
  siswa,
  settings,
  data,
  onBack,
}) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const renderFooter = (page: number) => (
    <div className="mt-auto pt-4 border-t border-gray-300 flex justify-between items-center text-[10px] text-gray-500 font-mono">
      <span>
        Halaman {page}/3 • AnalisaKu 2027 by {settings.NAMA_LEMBAGA}
      </span>
      <span>Dicetak: {currentDate}</span>
      <span>@Copyright Pak Guru AI 2026</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 print:p-0 print:bg-white text-gray-900">
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-white shadow-md flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Aplikasi</span>
        </button>

        <div className="text-xs font-bold text-gray-800">
          Pratinjau Cetak Laporan Resmi A4 ({type.toUpperCase()})
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      {/* A4 PRINT CONTAINER (3 PAGES EXACT) */}
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 print:max-w-none">
        {/* ======================================================== */}
        {/* JALUR SNBP 3 HALAMAN */}
        {/* ======================================================== */}
        {type === 'snbp' && data && (
          <>
            {/* HALAMAN 1 SNBP */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-200 print:border-none print:shadow-none print:rounded-none min-h-[1050px] flex flex-col justify-between print:page-break-after-always">
              <div>
                {/* Header Kop */}
                <div className="flex justify-between items-start border-b-2 border-purple-800 pb-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-black text-purple-900 tracking-tight">
                      LAPORAN RASIONALISASI SNBP 2027
                    </h1>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">
                      Evaluasi Nilai Rapor Terbobot, TKA IRT, dan Rekam Jejak Sekolah
                    </p>
                    <p className="text-[11px] text-purple-700 font-bold mt-1">
                      {settings.NAMA_LEMBAGA} • Cabang {siswa.cabang}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-purple-800 font-mono">
                      {data.peluang.peluang_total}%
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 uppercase">
                      Peluang {data.peluang.label_total}
                    </span>
                  </div>
                </div>

                {/* Identitas Siswa Grid */}
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 grid grid-cols-3 gap-3 text-xs mb-6">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Nama Siswa:</span>
                    <strong>{siswa.nama_siswa}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Nomor Induk Siswa (NIS):</span>
                    <strong className="font-mono">{siswa.nis}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Kelas & Asal Sekolah:</span>
                    <strong>{siswa.kelas} • {siswa.asal_sekolah}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Provinsi Sekolah:</span>
                    <strong>{siswa.provinsi_sekolah}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Akreditasi Sekolah:</span>
                    <strong>Akreditasi {siswa.akreditasi}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Nama Orang Tua:</span>
                    <strong>{siswa.nama_ortu}</strong>
                  </div>
                </div>

                {/* Kartu Pilihan Prodi SNBP */}
                <h3 className="font-black text-sm text-gray-900 mb-2 uppercase tracking-wide">
                  Program Studi Pilihan SNBP
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {data.peluang.pilihanAnalisa.map((pil: any) => (
                    <div
                      key={pil.pilihan_ke}
                      className="p-3.5 rounded-xl border border-purple-200 bg-white space-y-1 text-xs"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-purple-800">
                          Pilihan {pil.pilihan_ke} {pil.pilihan_ke === 1 ? '(Utama)' : '(Cadangan)'}
                        </span>
                        <span className={`font-bold ${pil.color_peluang}`}>
                          {pil.label_peluang} ({pil.peluang_prodi}%)
                        </span>
                      </div>
                      <div className="font-bold text-sm text-gray-900">{pil.prodi}</div>
                      <div className="text-gray-600 font-semibold">{pil.ptn} ({pil.provinsi_ptn})</div>
                      <div className="text-[10px] text-gray-500 pt-1 flex justify-between">
                        <span>NRM: {pil.nrm || 'N/A'}</span>
                        <span>Mapel: {pil.mapelPendukung.filter(Boolean).join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tabel Komponen Penilaian */}
                <h3 className="font-black text-sm text-gray-900 mb-2 uppercase tracking-wide">
                  Capaian Poin Komponen Seleksi
                </h3>
                <table className="w-full text-left text-xs border border-gray-200 mb-6">
                  <thead className="bg-purple-800 text-white font-bold text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Komponen Penilaian</th>
                      <th className="py-2 px-2 text-center">Bobot Maks</th>
                      <th className="py-2 px-2 text-center">Poin</th>
                      <th className="py-2 px-3">Keterangan</th>
                      <th className="py-2 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.peluang.breakdown.map((b: any) => (
                      <tr key={b.key}>
                        <td className="py-1.5 px-3 font-semibold">{b.nama}</td>
                        <td className="py-1.5 px-2 text-center font-mono text-gray-500">{b.bobotMaks}</td>
                        <td className="py-1.5 px-2 text-center font-mono font-bold text-purple-800">{b.poin}</td>
                        <td className="py-1.5 px-3 text-[11px] text-gray-600">{b.keterangan}</td>
                        <td className="py-1.5 px-2 text-center font-bold text-[10px]">{b.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Blok Nilai Akhir SNBP (di akhir H1 sesuai Bagian 8) */}
                <div className="p-4 rounded-xl bg-purple-900 text-white flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-purple-200 uppercase">
                      Nilai Akhir SNBP (Prakiraan Skor Komprehensif 0–100)
                    </div>
                    <div className="text-xl font-black mt-0.5">
                      Status: {data.nilaiAkhir.label}
                    </div>
                    <div className="text-[11px] text-purple-200 mt-1">
                      Rapor 50%: {data.nilaiAkhir.skorRapor50} | Prestasi 30%: {data.nilaiAkhir.skorPrestasi30} | Rekam Jejak 20%: {data.nilaiAkhir.skorTambahan20}
                    </div>
                  </div>
                  <div className="text-3xl font-black font-mono bg-white text-purple-900 px-4 py-2 rounded-xl">
                    {data.nilaiAkhir.nilaiAkhir}
                  </div>
                </div>
              </div>

              {renderFooter(1)}
            </div>

            {/* HALAMAN 2 SNBP */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-200 print:border-none print:shadow-none print:rounded-none min-h-[1050px] flex flex-col justify-between print:page-break-after-always">
              <div>
                <div className="border-b border-purple-200 pb-3 mb-5">
                  <h2 className="text-lg font-black text-purple-900">
                    REKAPITULASI NILAI RAPOR 5 SEMESTER & VALIDASI TKA
                  </h2>
                  <p className="text-xs text-gray-500">
                    Siswa: <strong>{siswa.nama_siswa}</strong> (NIS: {siswa.nis})
                  </p>
                </div>

                {/* Tabel Rapor Terbobot */}
                <h3 className="font-bold text-xs text-gray-800 uppercase mb-2">
                  Tabel Nilai Rapor Lengkap
                </h3>
                <table className="w-full text-left text-[11px] border border-gray-200 mb-6">
                  <thead className="bg-gray-100 font-bold text-gray-700">
                    <tr>
                      <th className="py-1.5 px-2">#</th>
                      <th className="py-1.5 px-3">Mata Pelajaran</th>
                      <th className="py-1.5 px-2 text-center">Sem 1</th>
                      <th className="py-1.5 px-2 text-center">Sem 2</th>
                      <th className="py-1.5 px-2 text-center">Sem 3</th>
                      <th className="py-1.5 px-2 text-center">Sem 4</th>
                      <th className="py-1.5 px-2 text-center font-bold text-purple-800">Sem 5 (50%)</th>
                      <th className="py-1.5 px-3 text-center font-bold text-purple-900 bg-purple-50">Terbobot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-mono">
                    {data.nilaiRapor.map((r: any, idx: number) => {
                      const tb = (r.sem1 * 0.1 + r.sem2 * 0.1 + r.sem3 * 0.15 + r.sem4 * 0.15 + r.sem5 * 0.5).toFixed(2);
                      return (
                        <tr key={idx}>
                          <td className="py-1 px-2 text-gray-400 font-sans">{idx + 1}</td>
                          <td className="py-1 px-3 font-semibold font-sans text-gray-800">{r.mapel}</td>
                          <td className="py-1 px-2 text-center">{r.sem1 || '-'}</td>
                          <td className="py-1 px-2 text-center">{r.sem2 || '-'}</td>
                          <td className="py-1 px-2 text-center">{r.sem3 || '-'}</td>
                          <td className="py-1 px-2 text-center">{r.sem4 || '-'}</td>
                          <td className="py-1 px-2 text-center font-bold text-purple-700">{r.sem5 || '-'}</td>
                          <td className="py-1 px-3 text-center font-bold text-purple-900 bg-purple-50">{tb}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Validasi TKA vs Rapor */}
                <h3 className="font-bold text-xs text-gray-800 uppercase mb-2">
                  Hasil Validasi Tes Kemampuan Akademik (TKA) vs Rapor
                </h3>
                {data.tka ? (
                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2 mb-6 text-xs">
                    <div className="grid grid-cols-3 gap-3 font-mono">
                      <div>
                        <span className="text-gray-500 block text-[10px] font-sans">Bhs. Indonesia:</span>
                        <strong>IRT {data.tka.tka_indo}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] font-sans">Bhs. Inggris:</span>
                        <strong>IRT {data.tka.tka_ing}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] font-sans">Matematika:</span>
                        <strong>IRT {data.tka.tka_mat}</strong>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-600 pt-1 border-t border-purple-100">
                      Rata-rata TKA Skala 100: <strong>{data.peluang.rata_rapor}</strong> • Total GAP Keselarasan:{' '}
                      <strong>{data.peluang.total_gap} poin</strong> (Validasi memperkuat keaslian capaian akademik).
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic mb-6">Siswa belum mengikuti simulasi TKA.</p>
                )}

                {/* Rekomendasi Nilai Semester Berikutnya */}
                {data.rekomendasiSemester.hasRekomendasi && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-xs space-y-1.5">
                    <div className="font-bold text-amber-900">
                      Rekomendasi Target Semester {data.rekomendasiSemester.semBerikutnya} (Bobot {data.rekomendasiSemester.bobotBerikutnya}%):
                    </div>
                    <div className="text-gray-700">
                      Target Rata-rata: <strong>{data.rekomendasiSemester.target_rata}</strong>. Utamakan peningkatan pada mapel pendukung prodi pilihan.
                    </div>
                  </div>
                )}
              </div>

              {renderFooter(2)}
            </div>

            {/* HALAMAN 3 SNBP */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-200 print:border-none print:shadow-none print:rounded-none min-h-[1050px] flex flex-col justify-between">
              <div>
                <div className="border-b border-purple-200 pb-3 mb-5">
                  <h2 className="text-lg font-black text-purple-900">
                    STATUS PROGRAM STUDI & 3 ALTERNATIF REKOMENDASI PTN
                  </h2>
                  <p className="text-xs text-gray-500">
                    Panduan Strategis Penjurusan SNBP 2027
                  </p>
                </div>

                {/* Detail Pilihan */}
                <div className="space-y-4 mb-6">
                  {data.peluang.pilihanAnalisa.map((pil: any) => (
                    <div key={pil.pilihan_ke} className="p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <strong className="text-purple-900 text-sm">
                          Pilihan {pil.pilihan_ke}: {pil.prodi} — {pil.ptn}
                        </strong>
                        <span className={`font-bold ${pil.color_peluang}`}>
                          Peluang: {pil.peluang_prodi}%
                        </span>
                      </div>
                      {pil.ptnDetail && (
                        <div className="text-[11px] text-gray-600 space-y-1">
                          <div><strong>Keketatan:</strong> {pil.ptnDetail.keketatan} ({pil.ptnDetail.tingkatKetetatan}) • <strong>Strata:</strong> {pil.ptnDetail.strata}</div>
                          <div><strong>Prospek Karir:</strong> {pil.ptnDetail.prospekKerja}</div>
                          <div><strong>Mata Kuliah Pokok:</strong> {pil.ptnDetail.mataKuliah}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Rekomendasi 3 Alternatif PTN SNBP (di akhir H3) */}
                <h3 className="font-bold text-xs text-gray-800 uppercase mb-2">
                  3 Rekomendasi Program Studi Alternatif (Cadangan Realistis)
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {data.rekomendasiAlternatif.map((alt: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl border border-purple-100 bg-purple-50/50 text-xs space-y-1">
                      <div className="font-bold text-gray-900">{alt.prodi}</div>
                      <div className="text-purple-700 font-semibold">{alt.ptn}</div>
                      <div className="text-[10px] text-gray-500 font-mono flex justify-between pt-1">
                        <span>NRM: {alt.nrm}</span>
                        <span className="text-emerald-700 font-bold">Peluang: {alt.estimasiPeluang}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kesimpulan & Tanda Tangan */}
                <div className="border-t border-gray-200 pt-4 text-xs space-y-2">
                  <h4 className="font-bold text-gray-800">Kesimpulan Tim Ahli Konseling:</h4>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    Siswa menunjukkan profil akademik yang kompetitif. Pertahankan konsistensi nilai semester 5 serta pastikan sertifikat prestasi yang dilampirkan telah dilegalisasi oleh pihak penyelenggara resmi.
                  </p>

                  <div className="pt-6 flex justify-between items-end text-center">
                    <div>
                      <div className="text-[10px] text-gray-500">Mengetahui Orang Tua/Wali</div>
                      <div className="mt-14 border-b border-gray-400 w-36 mx-auto"></div>
                      <div className="text-xs font-bold mt-1">{siswa.nama_ortu || '(...........................)'}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-gray-500">Konselor Bimbingan Belajar</div>
                      <div className="mt-14 border-b border-gray-400 w-36 mx-auto"></div>
                      <div className="text-xs font-bold mt-1">Tim Akademik {settings.NAMA_LEMBAGA}</div>
                    </div>
                  </div>
                </div>
              </div>

              {renderFooter(3)}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* JALUR SNBT 3 HALAMAN (TEMA MERAH) */}
        {/* ======================================================== */}
        {type === 'snbt' && data && (
          <>
            {/* HALAMAN 1 SNBT */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-200 print:border-none print:shadow-none print:rounded-none min-h-[1050px] flex flex-col justify-between print:page-break-after-always">
              <div>
                <div className="flex justify-between items-start border-b-2 border-red-700 pb-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-black text-red-900 tracking-tight">
                      LAPORAN HASIL TRY OUT & EVALUASI UTBK-SNBT 2027
                    </h1>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">
                      Formula Resmi 60 : 40 (TPS 60% & Literasi/PM 40%)
                    </p>
                    <p className="text-[11px] text-red-700 font-bold mt-1">
                      {settings.NAMA_LEMBAGA} • Cabang {siswa.cabang}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-red-700 font-mono">
                      {data.stats.avgTert}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-900">
                      Tren {data.stats.trendLabel}
                    </span>
                  </div>
                </div>

                {/* Identitas Siswa */}
                <div className="p-4 rounded-xl bg-red-50/60 border border-red-100 grid grid-cols-3 gap-3 text-xs mb-6">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Nama Siswa:</span>
                    <strong>{siswa.nama_siswa}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">NIS:</span>
                    <strong className="font-mono">{siswa.nis}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Asal Sekolah:</span>
                    <strong>{siswa.asal_sekolah}</strong>
                  </div>
                </div>

                {/* Rasio Bar 60:40 */}
                <div className="mb-6">
                  <RatioBar6040
                    tpsScore={data.stats.avgTPS}
                    literasiScore={data.stats.avgLit}
                    tertimbang={data.stats.avgTert}
                  />
                </div>

                {/* Tabel Histori 9 Try Out */}
                <h3 className="font-black text-xs text-gray-900 mb-2 uppercase">
                  Rekapitulasi 9 Try Out
                </h3>
                <table className="w-full text-left text-[11px] border border-gray-200 mb-6">
                  <thead className="bg-red-800 text-white font-bold">
                    <tr>
                      <th className="py-1.5 px-2">TO</th>
                      <th className="py-1.5 px-1">Bln</th>
                      <th className="py-1.5 px-2 text-center">PU</th>
                      <th className="py-1.5 px-2 text-center">PBM</th>
                      <th className="py-1.5 px-2 text-center">PPU</th>
                      <th className="py-1.5 px-2 text-center">PK</th>
                      <th className="py-1.5 px-2 text-center">LBI</th>
                      <th className="py-1.5 px-2 text-center">LBE</th>
                      <th className="py-1.5 px-2 text-center">PM</th>
                      <th className="py-1.5 px-2 text-center bg-red-900">TPS (60%)</th>
                      <th className="py-1.5 px-2 text-center bg-red-900">Lit (40%)</th>
                      <th className="py-1.5 px-3 text-center bg-purple-900">Tertimbang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-mono">
                    {data.toList.map((t: any) => (
                      <tr key={t.to_ke}>
                        <td className="py-1 px-2 font-bold font-sans">TO {t.to_ke}</td>
                        <td className="py-1 px-1 font-sans text-gray-500">{t.bulan}</td>
                        <td className="py-1 px-2 text-center">{t.pu}</td>
                        <td className="py-1 px-2 text-center">{t.pbm}</td>
                        <td className="py-1 px-2 text-center">{t.ppu}</td>
                        <td className="py-1 px-2 text-center">{t.pk}</td>
                        <td className="py-1 px-2 text-center">{t.lbi}</td>
                        <td className="py-1 px-2 text-center">{t.lbe}</td>
                        <td className="py-1 px-2 text-center">{t.pm}</td>
                        <td className="py-1 px-2 text-center font-bold text-purple-700 bg-purple-50">{t.skor_tps}</td>
                        <td className="py-1 px-2 text-center font-bold text-red-600 bg-red-50">{t.skor_literasi}</td>
                        <td className="py-1 px-3 text-center font-black text-gray-900 bg-gray-100">{t.skor_tertimbang}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {renderFooter(1)}
            </div>

            {/* HALAMAN 2 SNBT */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-200 print:border-none print:shadow-none print:rounded-none min-h-[1050px] flex flex-col justify-between print:page-break-after-always">
              <div>
                <div className="border-b border-red-200 pb-3 mb-5">
                  <h2 className="text-lg font-black text-red-900">
                    ANALISIS RADAR SUBTES & KETERCAPAIAN TARGET NAM
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Radar */}
                  <RadarChartSVG
                    title="Pemetaan Kekuatan 7 Subtes"
                    labels={['PU', 'PBM', 'PPU', 'PK', 'LBI', 'LBE', 'PM']}
                    values={[
                      data.stats.avgSubtes.pu,
                      data.stats.avgSubtes.pbm,
                      data.stats.avgSubtes.ppu,
                      data.stats.avgSubtes.pk,
                      data.stats.avgSubtes.lbi,
                      data.stats.avgSubtes.lbe,
                      data.stats.avgSubtes.pm,
                    ]}
                    maxVal={800}
                    size={280}
                  />

                  {/* Tabel Rata-rata per subtes */}
                  <div>
                    <h3 className="font-bold text-xs text-gray-800 uppercase mb-2">
                      Rata-rata Skor per Subtes
                    </h3>
                    <table className="w-full text-left text-xs border border-gray-200">
                      <thead className="bg-gray-100 font-bold text-gray-700">
                        <tr>
                          <th className="py-1.5 px-3">Subtes</th>
                          <th className="py-1.5 px-2 text-center">Rata-rata</th>
                          <th className="py-1.5 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(Object.keys(SUBTES_NAMES) as (keyof typeof SUBTES_NAMES)[]).map((k) => (
                          <tr key={k}>
                            <td className="py-1.5 px-3 font-semibold">{SUBTES_NAMES[k].nama}</td>
                            <td className="py-1.5 px-2 text-center font-mono font-bold">
                              {data.stats.avgSubtes[k]}
                            </td>
                            <td className="py-1.5 px-2 text-center text-[10px] font-bold">
                              {data.stats.avgSubtes[k] >= 600 ? 'Kuat' : data.stats.avgSubtes[k] >= 500 ? 'Cukup' : 'Lemah'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Ketercapaian vs Target NAM */}
                <h3 className="font-bold text-xs text-gray-800 uppercase mb-2">
                  Komparasi Ketercapaian Target Nilai Akhir Masuk (NAM)
                </h3>
                <table className="w-full text-left text-xs border border-gray-200 mb-6">
                  <thead className="bg-red-800 text-white font-bold">
                    <tr>
                      <th className="py-2 px-3">Pilihan</th>
                      <th className="py-2 px-4">Program Studi</th>
                      <th className="py-2 px-3">PTN</th>
                      <th className="py-2 px-2 text-center">Target NAM</th>
                      <th className="py-2 px-2 text-center">Skor Anda</th>
                      <th className="py-2 px-2 text-center">GAP</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-mono text-xs">
                    {data.pilihanDetail.map((p: any) => (
                      <tr key={p.pilihan_ke}>
                        <td className="py-1.5 px-3 font-bold font-sans">Pil {p.pilihan_ke}</td>
                        <td className="py-1.5 px-4 font-bold font-sans">
                          {p.prodi}{' '}
                          {p.ptnTier && (
                            <span className="text-[10px] text-gray-500 font-normal">
                              ({p.ptnTier})
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 font-sans text-gray-600">{p.singk_ptn}</td>
                        <td className="py-1.5 px-2 text-center font-bold">{p.namTarget}</td>
                        <td className="py-1.5 px-2 text-center font-bold text-purple-800">{data.stats.avgTert}</td>
                        <td className="py-1.5 px-2 text-center font-bold">{p.ketercapaian.gap}</td>
                        <td className="py-1.5 px-3 text-center font-sans font-bold text-[11px]">{p.ketercapaian.statusLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {renderFooter(2)}
            </div>

            {/* HALAMAN 3 SNBT */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-200 print:border-none print:shadow-none print:rounded-none min-h-[1050px] flex flex-col justify-between">
              <div>
                <div className="border-b border-red-200 pb-3 mb-5">
                  <h2 className="text-lg font-black text-red-900">
                    KOMPONEN PRIORITAS & 3 REKOMENDASI ALTERNATIF SNBT
                  </h2>
                </div>

                {/* Komponen Prioritas Jurusan */}
                <h3 className="font-bold text-xs text-gray-800 uppercase mb-2">
                  Subtes Dominan & Pendukung Sesuai Pilihan Jurusan
                </h3>
                <div className="space-y-3 mb-6">
                  {data.pilihanDetail.map((p: any) => (
                    <div key={p.pilihan_ke} className="p-3.5 rounded-xl border border-gray-200 text-xs space-y-1">
                      <div className="font-bold text-gray-900">
                        Pilihan {p.pilihan_ke}: {p.prodi} ({p.singk_ptn})
                      </div>
                      <div className="flex gap-3 text-[11px]">
                        <span>⭐ Dominan: <strong>{p.prioritas.dominan.toUpperCase()}</strong> ({data.stats.avgSubtes[p.prioritas.dominan]})</span>
                        <span>🔧 Pendukung: <strong>{p.prioritas.pendukung.join(', ').toUpperCase()}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3 Rekomendasi Alternatif SNBT */}
                <h3 className="font-bold text-xs text-gray-800 uppercase mb-2">
                  3 Rekomendasi Alternatif Realistis Berdasarkan Rata-rata Tertimbang
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {data.alternatif.map((alt: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl border border-red-100 bg-red-50/50 text-xs space-y-1">
                      <div className="font-bold text-gray-900">{alt.prodi}</div>
                      <div className="text-red-700 font-semibold">{alt.ptn}</div>
                      <div className="text-[10px] text-gray-500 font-mono flex justify-between pt-1">
                        <span>Target: {alt.skor}</span>
                        <span className="text-emerald-700 font-bold">{alt.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 7 Strategi Peningkatan Singkat */}
                <div className="border-t border-gray-200 pt-4 text-xs space-y-2">
                  <h4 className="font-bold text-gray-800">Strategi Peningkatan Intensif:</h4>
                  <ul className="list-disc pl-4 text-[10px] text-gray-600 space-y-1 leading-relaxed">
                    <li>Prioritaskan TPS 60% — setiap kenaikan +10 poin TPS menyumbang +6 skor tertimbang.</li>
                    <li>Latihan intensif minimal 2 jam/hari untuk subtes di bawah 500 poin.</li>
                    <li>Pertahankan subtes dominan jurusan pada skor minimal 600 poin.</li>
                  </ul>

                  <div className="pt-6 flex justify-between items-end text-center">
                    <div>
                      <div className="text-[10px] text-gray-500">Mengetahui Orang Tua/Wali</div>
                      <div className="mt-14 border-b border-gray-400 w-36 mx-auto"></div>
                      <div className="text-xs font-bold mt-1">{siswa.nama_ortu || '(...........................)'}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-gray-500">Konselor Bimbingan Belajar</div>
                      <div className="mt-14 border-b border-gray-400 w-36 mx-auto"></div>
                      <div className="text-xs font-bold mt-1">Tim Akademik {settings.NAMA_LEMBAGA}</div>
                    </div>
                  </div>
                </div>
              </div>

              {renderFooter(3)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
