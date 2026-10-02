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
      {/* Top Header Card Neo-Brutalism */}
      <div className="neo-card p-5 sm:p-6 bg-white dark:bg-[#181133] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 neo-badge px-3 py-1 bg-purple-200 text-[#0f172a] text-xs font-black mb-2">
            <BookOpen className="w-3.5 h-3.5 text-purple-700" />
            <span>NILAI RAPOR SEMESTER 1 - 5</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white tracking-tight flex items-center gap-2">
            <span>Input Nilai Rapor Siswa</span>
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </h2>
          <p className="text-xs font-bold text-gray-700 dark:text-purple-300 mt-1">
            Bobot resmi SNBP: Sem 1 (10%), Sem 2 (10%), Sem 3 (15%), Sem 4 (15%),{' '}
            <strong className="text-purple-700 dark:text-purple-300 font-black underline decoration-amber-400 decoration-2">
              Sem 5 (50%)
            </strong>
            .
          </p>
        </div>

        {/* Live Rata-rata Widget Neo-Brutalism */}
        <div className="neo-card-sm px-5 py-3.5 bg-purple-600 text-white flex items-center gap-3.5 shadow-[3px_3px_0px_#0f172a] self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-300 border-2 border-[#0f172a] flex items-center justify-center text-[#0f172a] font-black text-xl shadow-[1.5px_1.5px_0px_#0f172a]">
            📊
          </div>
          <div>
            <div className="text-[10px] uppercase font-black tracking-wider text-purple-200">Rata-rata Terbobot</div>
            <div className="text-2xl sm:text-3xl font-black font-mono leading-none tracking-tight">{avgTerbobot}</div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border-3 border-[#0f172a] shadow-[3px_3px_0px_#0f172a] text-xs font-black flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-200 text-[#0f172a]'
              : 'bg-rose-200 text-[#0f172a]'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-800" /> : <AlertCircle className="w-4 h-4 text-rose-800" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Selectors Kurikulum & Jurusan Neo-Brutalism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 neo-card p-5 bg-purple-100 dark:bg-[#181133]">
        <div>
          <label className="block text-xs font-black text-[#0f172a] dark:text-purple-200 mb-2">
            Pilih Kurikulum Sekolah
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['MERDEKA', 'K13'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKurikulumChange(k)}
                className={`py-2.5 px-3 text-xs font-black rounded-xl border-2.5 border-[#0f172a] transition-all ${
                  kurikulum === k
                    ? 'bg-purple-600 text-white shadow-[2.5px_2.5px_0px_#0f172a] -translate-y-0.5'
                    : 'bg-white dark:bg-[#1E1540] text-gray-700 dark:text-purple-300 hover:bg-purple-50 shadow-[1px_1px_0px_#0f172a]'
                }`}
              >
                {k === 'MERDEKA' ? 'Kurikulum Merdeka' : 'Kurikulum 2013 (K13)'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-[#0f172a] dark:text-purple-200 mb-2">
            Jurusan / Rumpun Peminatan
          </label>
          <select
            value={jurusan}
            onChange={(e) => handleJurusanChange(e.target.value)}
            className="w-full px-3 py-2.5 text-xs neo-select"
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
                <option value="Bahasa & Budaya">🗣️ Bahasa &amp; Budaya</option>
                <option value="Campuran">✨ Campuran (Kombinasi Mapel)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Kartu Analitik 2 Nilai Tertinggi Tiap Semester & Akumulatif Neo-Brutalism */}
      <div className="neo-card p-5 sm:p-6 bg-amber-100 dark:bg-[#181133] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#0f172a]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-300 border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] text-[#0f172a] flex items-center justify-center font-black text-xl shrink-0">
              🏆
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0f172a] dark:text-white flex items-center gap-2">
                <span>2 Nilai Tertinggi Tiap Semester &amp; Akumulatif Terbobot</span>
                <span className="neo-badge px-2 py-0.5 bg-purple-600 text-white text-[9px] font-black">
                  Akumulatif Otomatis
                </span>
              </h3>
              <p className="text-[11px] font-bold text-gray-700 dark:text-purple-300">
                Peringkat 1 (🥇) dan Peringkat 2 (🥈) mata pelajaran dengan capaian nilai tertinggi di tiap semester.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#0f172a] dark:text-purple-300 font-black block">
              Rata-rata 2 Tertinggi Akumulatif
            </span>
            <span className="text-xl font-black font-mono text-purple-700 dark:text-purple-300">
              {top2Data.akumulatif.avgTop2 > 0 ? top2Data.akumulatif.avgTop2.toFixed(2) : '-'}
            </span>
          </div>
        </div>

        {/* 6 Grid Kartu Semester Neo-Brutalism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {top2Data.allSemesters.map((item) => {
            const isAkum = item.semesterKey === 'akumulatif';
            const isSem5 = item.semesterKey === 'sem5';

            return (
              <div
                key={item.semesterKey}
                className={`p-3.5 rounded-2xl border-2.5 border-[#0f172a] transition-all ${
                  isAkum
                    ? 'bg-purple-600 text-white shadow-[3px_3px_0px_#0f172a]'
                    : isSem5
                    ? 'bg-amber-300 text-[#0f172a] shadow-[3px_3px_0px_#0f172a]'
                    : 'bg-white dark:bg-[#1E1540] text-[#0f172a] dark:text-white shadow-[2px_2px_0px_#0f172a]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider ${
                      isAkum ? 'text-amber-300' : 'text-[#0f172a] dark:text-purple-200'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full border border-[#0f172a] font-black ${
                      isAkum
                        ? 'bg-white text-[#0f172a]'
                        : isSem5
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-[#0f172a]'
                    }`}
                  >
                    {item.bobotLabel}
                  </span>
                </div>

                {item.hasScores ? (
                  <div className="space-y-2 text-xs">
                    {/* Top 1 */}
                    <div
                      className={`p-2 rounded-xl flex items-center justify-between gap-1.5 border-1.5 border-[#0f172a] ${
                        isAkum
                          ? 'bg-purple-700/80 text-white'
                          : 'bg-amber-100 text-[#0f172a]'
                      }`}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm">🥇</span>
                        <span
                          className="font-black truncate text-[11px]"
                          title={item.top1?.mapel}
                        >
                          {item.top1?.mapel}
                        </span>
                      </div>
                      <span className="font-mono font-black text-amber-600 dark:text-amber-300 flex-shrink-0">
                        {item.top1?.nilai.toFixed(1)}
                      </span>
                    </div>

                    {/* Top 2 */}
                    <div
                      className={`p-2 rounded-xl flex items-center justify-between gap-1.5 border-1.5 border-[#0f172a] ${
                        isAkum
                          ? 'bg-purple-700/80 text-white'
                          : 'bg-slate-100 text-[#0f172a]'
                      }`}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm">🥈</span>
                        <span
                          className="font-black truncate text-[11px]"
                          title={item.top2?.mapel || '-'}
                        >
                          {item.top2?.mapel || '-'}
                        </span>
                      </div>
                      <span className="font-mono font-black text-slate-700 dark:text-slate-300 flex-shrink-0">
                        {item.top2 ? item.top2.nilai.toFixed(1) : '-'}
                      </span>
                    </div>

                    {/* Rata-rata 2 Tertinggi */}
                    <div className="pt-1 flex items-center justify-between text-[10px] font-black">
                      <span className={isAkum ? 'text-purple-200' : 'text-gray-600 dark:text-purple-300'}>Rata 2 Teratas:</span>
                      <strong className="font-mono text-xs">{item.avgTop2.toFixed(2)}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-[10px] text-gray-500 font-bold italic">
                    Belum ada nilai
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Input Neo-Brutalism */}
      <div className="neo-card p-0 overflow-hidden bg-white dark:bg-[#181133]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-purple-600 text-white font-black border-b-3 border-[#0f172a]">
              <tr>
                <th className="py-3.5 px-4 w-8 border-r-2 border-[#0f172a]">#</th>
                <th className="py-3.5 px-4 min-w-[200px] border-r-2 border-[#0f172a]">Mata Pelajaran</th>
                <th className="py-3.5 px-2 text-center min-w-[70px] border-r-2 border-[#0f172a]">
                  Sem 1<span className="block text-[9px] font-bold text-purple-200">(10%)</span>
                </th>
                <th className="py-3.5 px-2 text-center min-w-[70px] border-r-2 border-[#0f172a]">
                  Sem 2<span className="block text-[9px] font-bold text-purple-200">(10%)</span>
                </th>
                <th className="py-3.5 px-2 text-center min-w-[70px] border-r-2 border-[#0f172a]">
                  Sem 3<span className="block text-[9px] font-bold text-purple-200">(15%)</span>
                </th>
                <th className="py-3.5 px-2 text-center min-w-[70px] border-r-2 border-[#0f172a]">
                  Sem 4<span className="block text-[9px] font-bold text-purple-200">(15%)</span>
                </th>
                <th className="py-3.5 px-2 text-center min-w-[75px] bg-amber-400 text-[#0f172a] border-r-2 border-[#0f172a]">
                  Sem 5<span className="block text-[9px] font-black text-rose-700">⭐ (50%)</span>
                </th>
                <th className="py-3.5 px-3 text-center min-w-[85px]">Terbobot</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#0f172a]/15">
              {nilaiMapels.map((m, idx) => {
                const tb = terbobotList[idx].terbobot;
                return (
                  <tr key={m.mapel} className="hover:bg-purple-100/50 dark:hover:bg-purple-950/30 transition-colors">
                    <td className="py-2.5 px-4 text-gray-500 font-mono font-bold text-[11px] border-r-2 border-[#0f172a]/15">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-black text-[#0f172a] dark:text-purple-200 border-r-2 border-[#0f172a]/15">
                      {m.mapel}
                    </td>
                    {(['sem1', 'sem2', 'sem3', 'sem4'] as const).map((sem) => (
                      <td key={sem} className="py-2 px-2 text-center border-r-2 border-[#0f172a]/15">
                        <div className="flex flex-col items-center justify-center">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={m[sem] || ''}
                            onChange={(e) => handleScoreChange(idx, sem, e.target.value)}
                            placeholder="0"
                            className="w-14 text-center py-1 rounded-lg border-2 border-[#0f172a] bg-white dark:bg-[#1E1540] text-[#0f172a] dark:text-white font-mono font-bold shadow-[1.5px_1.5px_0px_#0f172a] focus:bg-amber-100 focus:outline-none"
                          />
                          {getBadgeForMapelSem(m.mapel, sem)}
                        </div>
                      </td>
                    ))}
                    {/* Sem 5 Highlighted */}
                    <td className="py-2 px-2 text-center bg-amber-100/60 dark:bg-amber-950/20 border-r-2 border-[#0f172a]/15">
                      <div className="flex flex-col items-center justify-center">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={m.sem5 || ''}
                          onChange={(e) => handleScoreChange(idx, 'sem5', e.target.value)}
                          placeholder="0"
                          className="w-14 text-center py-1 rounded-lg border-2.5 border-[#0f172a] bg-amber-200 dark:bg-[#1E1540] text-[#0f172a] dark:text-white font-black font-mono shadow-[2px_2px_0px_#0f172a] focus:bg-white focus:outline-none"
                        />
                        {getBadgeForMapelSem(m.mapel, 'sem5')}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-black font-mono text-purple-700 dark:text-purple-300">
                      <div className="text-sm">{tb > 0 ? tb.toFixed(2) : '-'}</div>
                      {getBadgeForMapelAkum(m.mapel)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-[#120B27] border-t-3 border-[#0f172a] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-bold text-gray-700 dark:text-purple-300">
            💡 Hanya mapel yang memiliki minimal satu nilai semester &gt; 0 yang akan disimpan dan dihitung otomatis.
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 neo-btn bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-[3px_3px_0px_#0f172a] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : '💾 Simpan Nilai Rapor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
