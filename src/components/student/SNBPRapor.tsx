import React, { useState, useEffect, useMemo } from 'react';
import {
  Save,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Calculator,
  Award,
  TrendingUp,
  Sparkles,
  Star,
} from 'lucide-react';
import { Siswa, NilaiRapor } from '../../types';
import { getNilaiRapor, saveNilaiRapor } from '../../services/api';
import {
  BOBOT_SEMESTER,
  MAPEL_UMUM_K13,
  MAPEL_UMUM_MERDEKA,
  MAPEL_PEMINATAN_K13,
  MAPEL_PEMINATAN_MERDEKA,
  calcNilaiMapelTerbobot,
  calcRataRapor,
  calcTop2NilaiPerSemester,
} from '../../lib/calc';

interface SNBPRaporProps {
  siswa: Siswa;
  onRefreshData?: () => void;
}

export const SNBPRapor: React.FC<SNBPRaporProps> = ({ siswa, onRefreshData }) => {
  const [kurikulum, setKurikulum] = useState<'K13' | 'MERDEKA'>('MERDEKA');
  const [jurusan, setJurusan] = useState<string>('Saintek');
  const [nilaiMapels, setNilaiMapels] = useState<
    { mapel: string; sem1: number; sem2: number; sem3: number; sem4: number; sem5: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [siswa]);

  const loadData = async () => {
    setLoading(true);
    try {
      const existing = await getNilaiRapor(siswa.nis);
      if (existing.length > 0) {
        setKurikulum(existing[0].kurikulum || 'MERDEKA');
        setJurusan(existing[0].jurusan_peminatan || 'Saintek');
        buildFormMapels(existing[0].kurikulum || 'MERDEKA', existing[0].jurusan_peminatan || 'Saintek', existing);
      } else {
        buildFormMapels('MERDEKA', 'Saintek', []);
      }
    } finally {
      setLoading(false);
    }
  };

  const buildFormMapels = (kuri: 'K13' | 'MERDEKA', jur: string, existing: NilaiRapor[]) => {
    let mapelNames: string[] = [];

    if (kuri === 'K13') {
      mapelNames = [...MAPEL_UMUM_K13, ...(MAPEL_PEMINATAN_K13[jur] || [])];
    } else {
      const peminatanGroups = MAPEL_PEMINATAN_MERDEKA[jur] || [];
      const peminatanMapels: string[] = [];
      peminatanGroups.forEach((g) => peminatanMapels.push(...g.mapel));
      mapelNames = [...MAPEL_UMUM_MERDEKA, ...peminatanMapels];
    }

    // Merge existing
    const rows = mapelNames.map((m) => {
      const match = existing.find((e) => e.mapel.toLowerCase() === m.toLowerCase());
      return {
        mapel: m,
        sem1: match ? match.sem1 : 0,
        sem2: match ? match.sem2 : 0,
        sem3: match ? match.sem3 : 0,
        sem4: match ? match.sem4 : 0,
        sem5: match ? match.sem5 : 0,
      };
    });

    setNilaiMapels(rows);
  };

  const handleKurikulumChange = (k: 'K13' | 'MERDEKA') => {
    setKurikulum(k);
    const defaultJur = k === 'K13' ? 'IPA' : 'Saintek';
    setJurusan(defaultJur);
    buildFormMapels(k, defaultJur, nilaiMapels as any);
  };

  const handleJurusanChange = (j: string) => {
    setJurusan(j);
    buildFormMapels(kurikulum, j, nilaiMapels as any);
  };

  const handleScoreChange = (
    index: number,
    field: 'sem1' | 'sem2' | 'sem3' | 'sem4' | 'sem5',
    val: string
  ) => {
    const num = Math.min(100, Math.max(0, parseFloat(val) || 0));
    setNilaiMapels((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: num };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await saveNilaiRapor(siswa.nis, kurikulum, jurusan, nilaiMapels);
      setFeedback({ type: 'success', message: 'Nilai rapor berhasil disimpan!' });
      if (onRefreshData) onRefreshData();
      setTimeout(() => setFeedback(null), 3800);
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menyimpan nilai rapor.' });
    } finally {
      setSaving(false);
    }
  };

  // Preview hitungan live
  const terbobotList = nilaiMapels.map((m) => ({
    mapel: m.mapel,
    terbobot: calcNilaiMapelTerbobot(m.sem1, m.sem2, m.sem3, m.sem4, m.sem5),
  }));
  const validTerbobot = terbobotList.filter((x) => x.terbobot > 0);
  const avgTerbobot =
    validTerbobot.length > 0
      ? (validTerbobot.reduce((a, b) => a + b.terbobot, 0) / validTerbobot.length).toFixed(2)
      : '0.00';

  // 2 Nilai Tertinggi per Semester & Akumulatif
  const top2Data = useMemo(() => calcTop2NilaiPerSemester(nilaiMapels), [nilaiMapels]);

  const getBadgeForMapelSem = (mapelName: string, semKey: 'sem1' | 'sem2' | 'sem3' | 'sem4' | 'sem5') => {
    const semInfo = top2Data[semKey];
    if (!semInfo.hasScores) return null;
    if (semInfo.top1?.mapel.toLowerCase() === mapelName.toLowerCase() && semInfo.top1.nilai > 0) {
      return (
        <span className="text-[10px] font-black ml-1 text-amber-500" title="Peringkat 1 Semester Ini">
          🥇
        </span>
      );
    }
    if (semInfo.top2?.mapel.toLowerCase() === mapelName.toLowerCase() && semInfo.top2.nilai > 0) {
      return (
        <span className="text-[10px] font-black ml-1 text-slate-400" title="Peringkat 2 Semester Ini">
          🥈
        </span>
      );
    }
    return null;
  };

  const getBadgeForMapelAkum = (mapelName: string) => {
    const akumInfo = top2Data.akumulatif;
    if (!akumInfo.hasScores) return null;
    if (akumInfo.top1?.mapel.toLowerCase() === mapelName.toLowerCase() && akumInfo.top1.nilai > 0) {
      return (
        <span className="block mt-0.5 text-[9px] font-extrabold text-amber-600 dark:text-amber-400">
          🥇 Top 1 Akum
        </span>
      );
    }
    if (akumInfo.top2?.mapel.toLowerCase() === mapelName.toLowerCase() && akumInfo.top2.nilai > 0) {
      return (
        <span className="block mt-0.5 text-[9px] font-extrabold text-slate-500 dark:text-slate-300">
          🥈 Top 2 Akum
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#160E2E] p-5 rounded-2xl border border-purple-100 dark:border-purple-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span>Input Nilai Rapor Siswa</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-purple-300 mt-1">
            Bobot resmi SNBP: Sem 1 (10%), Sem 2 (10%), Sem 3 (15%), Sem 4 (15%),{' '}
            <strong className="text-purple-700 dark:text-purple-300 font-extrabold">Sem 5 (50%)</strong>.
          </p>
        </div>

        {/* Live Rata-rata Widget */}
        <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-700 to-[#7C3AED] text-white flex items-center gap-3 shadow-md shadow-purple-600/20">
          <Calculator className="w-6 h-6 opacity-80" />
          <div>
            <div className="text-[10px] uppercase font-bold text-purple-200">Rata-rata Terbobot</div>
            <div className="text-2xl font-black font-mono leading-none">{avgTerbobot}</div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Selectors Kurikulum & Jurusan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-[#160E2E] p-5 rounded-2xl border border-purple-100 dark:border-purple-950/40">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1.5">
            Pilih Kurikulum
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['MERDEKA', 'K13'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKurikulumChange(k)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  kurikulum === k
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'border-gray-200 dark:border-purple-900 text-gray-500'
                }`}
              >
                {k === 'MERDEKA' ? 'Kurikulum Merdeka' : 'Kurikulum 2013 (K13)'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1.5">
            Jurusan / Peminatan
          </label>
          <select
            value={jurusan}
            onChange={(e) => handleJurusanChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            {kurikulum === 'K13' ? (
              <>
                <option value="IPA">IPA (Sains)</option>
                <option value="IPS">IPS (Sosial)</option>
                <option value="Bahasa">Bahasa</option>
                <option value="Umum">Umum</option>
              </>
            ) : (
              <>
                <option value="Saintek">⚗️ Saintek</option>
                <option value="Soshum">🌍 Soshum / Humaniora</option>
                <option value="Bahasa & Budaya">🗣️ Bahasa & Budaya</option>
                <option value="Campuran">✨ Campuran (Kombinasi Mapel)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Kartu Analitik 2 Nilai Tertinggi Tiap Semester & Akumulatif */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-[#1E1540] dark:to-[#160E2E] rounded-3xl p-5 border-2 border-purple-200 dark:border-purple-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-100 dark:border-purple-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center shadow-md">
              <Award className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                <span>2 Nilai Tertinggi Tiap Semester &amp; Akumulatif Terbobot</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold">
                  Akumulatif Otomatis
                </span>
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-purple-300">
                Peringkat 1 (🥇) dan Peringkat 2 (🥈) mata pelajaran dengan capaian nilai tertinggi di tiap semester serta kumulatif resmi.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold block">
              Rata-rata 2 Tertinggi Akumulatif
            </span>
            <span className="text-lg font-black font-mono text-purple-900 dark:text-white">
              {top2Data.akumulatif.avgTop2 > 0 ? top2Data.akumulatif.avgTop2.toFixed(2) : '-'}
            </span>
          </div>
        </div>

        {/* 6 Grid Kartu Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {top2Data.allSemesters.map((item) => {
            const isAkum = item.semesterKey === 'akumulatif';
            const isSem5 = item.semesterKey === 'sem5';

            return (
              <div
                key={item.semesterKey}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isAkum
                    ? 'bg-gradient-to-b from-purple-700 to-indigo-800 text-white border-purple-500 shadow-md shadow-purple-900/20'
                    : isSem5
                    ? 'bg-purple-100/70 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700'
                    : 'bg-white/80 dark:bg-[#160E2E]/80 border-purple-100 dark:border-purple-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider ${
                      isAkum ? 'text-amber-300' : 'text-purple-900 dark:text-purple-200'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      isAkum
                        ? 'bg-white/20 text-white'
                        : isSem5
                        ? 'bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200'
                        : 'bg-gray-100 dark:bg-purple-900/40 text-gray-600 dark:text-purple-300'
                    }`}
                  >
                    {item.bobotLabel}
                  </span>
                </div>

                {item.hasScores ? (
                  <div className="space-y-2 text-xs">
                    {/* Top 1 */}
                    <div
                      className={`p-2 rounded-xl flex items-center justify-between gap-1.5 ${
                        isAkum
                          ? 'bg-white/10 text-white border border-white/10'
                          : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm">🥇</span>
                        <span
                          className={`font-bold truncate text-[11px] ${
                            isAkum ? 'text-white' : 'text-gray-900 dark:text-purple-100'
                          }`}
                          title={item.top1?.mapel}
                        >
                          {item.top1?.mapel}
                        </span>
                      </div>
                      <span className="font-mono font-black text-amber-500 dark:text-amber-300 flex-shrink-0">
                        {item.top1?.nilai.toFixed(1)}
                      </span>
                    </div>

                    {/* Top 2 */}
                    <div
                      className={`p-2 rounded-xl flex items-center justify-between gap-1.5 ${
                        isAkum
                          ? 'bg-white/10 text-white border border-white/10'
                          : 'bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm">🥈</span>
                        <span
                          className={`font-bold truncate text-[11px] ${
                            isAkum ? 'text-white' : 'text-gray-900 dark:text-purple-100'
                          }`}
                          title={item.top2?.mapel || '-'}
                        >
                          {item.top2?.mapel || '-'}
                        </span>
                      </div>
                      <span className="font-mono font-black text-slate-500 dark:text-slate-300 flex-shrink-0">
                        {item.top2 ? item.top2.nilai.toFixed(1) : '-'}
                      </span>
                    </div>

                    {/* Rata-rata 2 Tertinggi */}
                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className={isAkum ? 'text-purple-200' : 'text-gray-500'}>Rata 2 Teratas:</span>
                      <strong className="font-mono font-black text-xs">{item.avgTop2.toFixed(2)}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-[10px] text-gray-400 italic">
                    Belum ada nilai terisi
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Input */}
      <div className="bg-white dark:bg-[#160E2E] rounded-2xl border border-purple-100 dark:border-purple-950/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-purple-700 text-white font-bold">
              <tr>
                <th className="py-3 px-4 w-8">#</th>
                <th className="py-3 px-4 min-w-[200px]">Mata Pelajaran</th>
                <th className="py-3 px-2 text-center min-w-[70px]">
                  Sem 1<span className="block text-[9px] font-normal text-purple-200">(10%)</span>
                </th>
                <th className="py-3 px-2 text-center min-w-[70px]">
                  Sem 2<span className="block text-[9px] font-normal text-purple-200">(10%)</span>
                </th>
                <th className="py-3 px-2 text-center min-w-[70px]">
                  Sem 3<span className="block text-[9px] font-normal text-purple-200">(15%)</span>
                </th>
                <th className="py-3 px-2 text-center min-w-[70px]">
                  Sem 4<span className="block text-[9px] font-normal text-purple-200">(15%)</span>
                </th>
                <th className="py-3 px-2 text-center min-w-[75px] bg-purple-800">
                  Sem 5<span className="block text-[9px] font-bold text-amber-300">⭐ (50%)</span>
                </th>
                <th className="py-3 px-3 text-center min-w-[85px]">Terbobot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 dark:divide-purple-950/40">
              {nilaiMapels.map((m, idx) => {
                const tb = terbobotList[idx].terbobot;
                return (
                  <tr key={m.mapel} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20">
                    <td className="py-2.5 px-4 text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-gray-800 dark:text-purple-200">
                      {m.mapel}
                    </td>
                    {(['sem1', 'sem2', 'sem3', 'sem4'] as const).map((sem) => (
                      <td key={sem} className="py-2 px-2 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={m[sem] || ''}
                            onChange={(e) => handleScoreChange(idx, sem, e.target.value)}
                            placeholder="0"
                            className="w-14 text-center py-1 rounded-lg border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white font-mono focus:bg-white focus:ring-1 focus:ring-purple-600"
                          />
                          {getBadgeForMapelSem(m.mapel, sem)}
                        </div>
                      </td>
                    ))}
                    {/* Sem 5 Highlighted */}
                    <td className="py-2 px-2 text-center bg-purple-50/50 dark:bg-purple-950/30">
                      <div className="flex flex-col items-center justify-center">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={m.sem5 || ''}
                          onChange={(e) => handleScoreChange(idx, 'sem5', e.target.value)}
                          placeholder="0"
                          className="w-14 text-center py-1 rounded-lg border-2 border-purple-400 dark:border-purple-600 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white font-bold font-mono focus:ring-2 focus:ring-purple-600"
                        />
                        {getBadgeForMapelSem(m.mapel, 'sem5')}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-purple-700 dark:text-purple-300">
                      <div>{tb > 0 ? tb.toFixed(2) : '-'}</div>
                      {getBadgeForMapelAkum(m.mapel)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50/60 dark:bg-[#130B29]/60 border-t border-purple-100 dark:border-purple-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-500">
            Hanya mapel yang memiliki minimal satu nilai semester &gt; 0 yang akan disimpan dan dihitung.
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Nilai Rapor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
