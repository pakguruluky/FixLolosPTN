import React, { useState, useEffect, useMemo } from 'react';
import { Save, TrendingUp, AlertCircle, CheckCircle2, Edit3, Plus, Calculator, Zap, Sparkles } from 'lucide-react';
import { Siswa, TOData } from '../../types';
import { getTOData, saveTOData } from '../../services/api';
import { BOBOT_SNBT, SUBTES_NAMES, calcSkorTO } from '../../lib/calc';

interface SNBTTryOutProps {
  siswa: Siswa;
  onRefreshData?: () => void;
}

const BULAN_TO = ['AGS', 'SEPT', 'OKT', 'NOV', 'DES', 'JAN', 'FEB', 'MAR', 'APR'];

export const SNBTTryOut: React.FC<SNBTTryOutProps> = ({ siswa, onRefreshData }) => {
  const [toList, setToList] = useState<TOData[]>([]);
  const [selectedTOKe, setSelectedTOKe] = useState<number>(1);
  const [selectedBulan, setSelectedBulan] = useState<string>('AGS');

  // Input states (0-800)
  const [pu, setPu] = useState<number | ''>('');
  const [pbm, setPbm] = useState<number | ''>('');
  const [ppu, setPpu] = useState<number | ''>('');
  const [pk, setPk] = useState<number | ''>('');
  const [lbi, setLbi] = useState<number | ''>('');
  const [lbe, setLbe] = useState<number | ''>('');
  const [pm, setPm] = useState<number | ''>('');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [siswa]);

  const loadData = async () => {
    const list = await getTOData(siswa.nis);
    setToList(list);
    if (list.length > 0) {
      // Default to the latest saved TO so the student sees their real scores immediately
      const latest = list[list.length - 1];
      setSelectedTOKe(latest.to_ke);
      setSelectedBulan(latest.bulan || BULAN_TO[latest.to_ke - 1] || 'AGS');
      setPu(latest.pu || '');
      setPbm(latest.pbm || '');
      setPpu(latest.ppu || '');
      setPk(latest.pk || '');
      setLbi(latest.lbi || '');
      setLbe(latest.lbe || '');
      setPm(latest.pm || '');
    }
  };

  const handleSelectTO = (k: number) => {
    setSelectedTOKe(k);
    setSelectedBulan(BULAN_TO[k - 1] || 'AGS');
    const exist = toList.find((t) => t.to_ke === k);
    if (exist) {
      setPu(exist.pu !== undefined ? exist.pu : '');
      setPbm(exist.pbm !== undefined ? exist.pbm : '');
      setPpu(exist.ppu !== undefined ? exist.ppu : '');
      setPk(exist.pk !== undefined ? exist.pk : '');
      setLbi(exist.lbi !== undefined ? exist.lbi : '');
      setLbe(exist.lbe !== undefined ? exist.lbe : '');
      setPm(exist.pm !== undefined ? exist.pm : '');
    } else {
      setPu('');
      setPbm('');
      setPpu('');
      setPk('');
      setLbi('');
      setLbe('');
      setPm('');
    }
  };

  const handleSelectTOToEdit = (to: TOData) => {
    setSelectedTOKe(to.to_ke);
    setSelectedBulan(to.bulan);
    setPu(to.pu !== undefined ? to.pu : '');
    setPbm(to.pbm !== undefined ? to.pbm : '');
    setPpu(to.ppu !== undefined ? to.ppu : '');
    setPk(to.pk !== undefined ? to.pk : '');
    setLbi(to.lbi !== undefined ? existValue(to.lbi) : '');
    setLbe(to.lbe !== undefined ? existValue(to.lbe) : '');
    setPm(to.pm !== undefined ? existValue(to.pm) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const existValue = (val: any) => (val > 0 ? val : '');

  // REAL-TIME Live calculation preview (recalculated on every state change)
  const liveCalc = useMemo(() => {
    return calcSkorTO(
      Number(pu) || 0,
      Number(pbm) || 0,
      Number(ppu) || 0,
      Number(pk) || 0,
      Number(lbi) || 0,
      Number(lbe) || 0,
      Number(pm) || 0
    );
  }, [pu, pbm, ppu, pk, lbi, lbe, pm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    // Validate 0-800
    const vals = [
      { name: 'PU', val: Number(pu) },
      { name: 'PBM', val: Number(pbm) },
      { name: 'PPU', val: Number(ppu) },
      { name: 'PK', val: Number(pk) },
      { name: 'LBI', val: Number(lbi) },
      { name: 'LBE', val: Number(lbe) },
      { name: 'PM', val: Number(pm) },
    ];

    for (const v of vals) {
      if (v.val < 0 || v.val > 800) {
        setFeedback({ type: 'error', message: `Skor ${v.name} harus di antara 0 s.d. 800.` });
        setSaving(false);
        return;
      }
    }

    try {
      const payload: TOData = {
        nis: siswa.nis,
        to_ke: selectedTOKe,
        bulan: selectedBulan,
        pu: Number(pu) || 0,
        pbm: Number(pbm) || 0,
        ppu: Number(ppu) || 0,
        pk: Number(pk) || 0,
        lbi: Number(lbi) || 0,
        lbe: Number(lbe) || 0,
        pm: Number(pm) || 0,
        total: liveCalc.total,
        skor_tps: liveCalc.skor_tps,
        skor_literasi: liveCalc.skor_literasi,
        skor_tertimbang: liveCalc.skor_tertimbang,
        timestamp: new Date().toISOString(),
      };

      await saveTOData(payload);
      setFeedback({
        type: 'success',
        message: `Skor Try Out ke-${selectedTOKe} (${selectedBulan}) berhasil disimpan! Skor Tertimbang: ${liveCalc.skor_tertimbang.toFixed(2)}`,
      });
      const updatedList = await getTOData(siswa.nis);
      setToList(updatedList);
      if (onRefreshData) onRefreshData();
      setTimeout(() => setFeedback(null), 3800);
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menyimpan skor Try Out.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card with Real-Time Live Preview Banner */}
      <div className="bg-white dark:bg-[#160E2E] p-5 sm:p-6 rounded-3xl border border-purple-100 dark:border-purple-950/40 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-200 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-red-600 fill-red-600 animate-pulse" />
            <span>Kalkulator Rasionalisasi UTBK-SNBT (Bobot 60 : 40)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-600" />
            <span>Input Nilai Try Out UTBK</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-purple-300 mt-1 max-w-xl">
            Ketik perolehan nilai Try Out 1 s.d. 9 (skala 0–800). Skor tertimbang dihitung secara real-time pada setiap ketikan berdasarkan bobot resmi TPS 60% &amp; Literasi/PM 40%.
          </p>
        </div>

        {/* PRATINJAU SKOR TERTIMBANG UPDATE REAL-TIME */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-700 text-white shadow-xl shadow-red-600/25 min-w-[280px]">
          <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-2 mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-red-100">
              <Calculator className="w-4 h-4" />
              <span>Pratinjau Skor Tertimbang</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-white/20 text-white backdrop-blur-sm animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Live Update</span>
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-3xl sm:text-4xl font-black font-mono leading-none tracking-tight">
              {liveCalc.skor_tertimbang > 0 ? liveCalc.skor_tertimbang.toFixed(2) : '0.00'}
            </div>
            <div className="text-xs font-bold text-red-200">
              / 800
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-white/15 text-[10px]">
            <div className="p-1.5 rounded-lg bg-black/20">
              <span className="text-red-200 block">TPS (60%):</span>
              <span className="font-mono font-bold text-xs">{liveCalc.skor_tps.toFixed(1)}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-black/20">
              <span className="text-red-200 block">Literasi (40%):</span>
              <span className="font-mono font-bold text-xs">{liveCalc.skor_literasi.toFixed(1)}</span>
            </div>
          </div>

          <div className="text-[10px] text-red-200/90 mt-2 text-right font-medium">
            Terisi: <strong>{liveCalc.subtesTerisiCount} dari 7</strong> subtes UTBK
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Input Form Card */}
      <form onSubmit={handleSave} className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-6 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 border-b border-purple-50 dark:border-purple-950/40 pb-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1">
              Pilih Try Out Ke-
            </label>
            <select
              value={selectedTOKe}
              onChange={(e) => handleSelectTO(parseInt(e.target.value))}
              className="px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white font-bold"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <option key={num} value={num}>
                  Try Out {num} {toList.some((t) => t.to_ke === num) ? '✅ (Tersimpan)' : '(Baru)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1">
              Bulan Pelaksanaan
            </label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white font-bold"
            >
              {BULAN_TO.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="self-end ml-auto flex items-center gap-2">
            <span className="text-[11px] text-gray-500 hidden sm:inline">
              Mengedit Try Out ke-{selectedTOKe} ({selectedBulan})
            </span>
          </div>
        </div>

        {/* GRUP 1: TPS 60% (Ungu) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-xs text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span>Tes Potensi Skolastik (TPS) — Total Bobot 60%</span>
            </h3>
            <span className="text-[10px] text-gray-400">PU, PBM, PPU, PK (@15% bobot)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Penalaran Umum (PU)',
                val: pu,
                set: setPu,
                placeholder: '0 - 800',
              },
              {
                label: 'Pemahaman Bacaan & Menulis (PBM)',
                val: pbm,
                set: setPbm,
                placeholder: '0 - 800',
              },
              {
                label: 'Pengetahuan & Pemahaman Umum (PPU)',
                val: ppu,
                set: setPpu,
                placeholder: '0 - 800',
              },
              {
                label: 'Pengetahuan Kuantitatif (PK)',
                val: pk,
                set: setPk,
                placeholder: '0 - 800',
              },
            ].map((sub, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                <label className="block text-xs font-bold text-gray-800 dark:text-purple-200 mb-1.5 truncate">
                  {sub.label}
                </label>
                <input
                  type="number"
                  min="0"
                  max="800"
                  step="1"
                  value={sub.val}
                  onChange={(e) => sub.set(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder={sub.placeholder}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-purple-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* GRUP 2: LITERASI & PM 40% (Merah) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-xs text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Literasi &amp; Penalaran Matematika — Total Bobot 40%</span>
            </h3>
            <span className="text-[10px] text-gray-400">LBI (13.33%), LBE (13.33%), PM (13.34%)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Literasi Bahasa Indonesia (LBI)',
                val: lbi,
                set: setLbi,
                placeholder: '0 - 800',
              },
              {
                label: 'Literasi Bahasa Inggris (LBE)',
                val: lbe,
                set: setLbe,
                placeholder: '0 - 800',
              },
              {
                label: 'Penalaran Matematika (PM)',
                val: pm,
                set: setPm,
                placeholder: '0 - 800',
              },
            ].map((sub, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-red-50/40 dark:bg-red-950/20 border border-red-100 dark:border-red-950/40">
                <label className="block text-xs font-bold text-gray-800 dark:text-red-200 mb-1.5 truncate">
                  {sub.label}
                </label>
                <input
                  type="number"
                  min="0"
                  max="800"
                  step="1"
                  value={sub.val}
                  onChange={(e) => sub.set(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder={sub.placeholder}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-red-950/60 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-red-600"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-700 hover:from-red-700 hover:to-purple-800 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : `Simpan Skor Try Out Ke-${selectedTOKe}`}</span>
          </button>
        </div>
      </form>

      {/* History Riwayat Try Out */}
      <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-purple-50 dark:border-purple-950/40 pb-3">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>Riwayat Seluruh Try Out ({toList.length} dari 9 Tersimpan)</span>
          </h3>
          <span className="text-[10px] text-gray-400">Klik 'Edit' untuk memuat skor ke form</span>
        </div>

        {toList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50 dark:bg-purple-950/50 text-gray-700 dark:text-purple-200 font-bold">
                <tr>
                  <th className="py-2.5 px-3">TO</th>
                  <th className="py-2.5 px-2">Bulan</th>
                  <th className="py-2.5 px-2 text-center">PU</th>
                  <th className="py-2.5 px-2 text-center">PBM</th>
                  <th className="py-2.5 px-2 text-center">PPU</th>
                  <th className="py-2.5 px-2 text-center">PK</th>
                  <th className="py-2.5 px-2 text-center">LBI</th>
                  <th className="py-2.5 px-2 text-center">LBE</th>
                  <th className="py-2.5 px-2 text-center">PM</th>
                  <th className="py-2.5 px-3 text-center">TPS (60%)</th>
                  <th className="py-2.5 px-3 text-center">Lit (40%)</th>
                  <th className="py-2.5 px-3 text-center">Skor Tertimbang</th>
                  <th className="py-2.5 px-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 dark:divide-purple-950/30 font-mono">
                {toList.map((t) => (
                  <tr key={t.to_ke} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20">
                    <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">TO {t.to_ke}</td>
                    <td className="py-2.5 px-2 font-sans font-semibold text-gray-600 dark:text-purple-300">
                      {t.bulan}
                    </td>
                    <td className="py-2.5 px-2 text-center">{t.pu || '-'}</td>
                    <td className="py-2.5 px-2 text-center">{t.pbm || '-'}</td>
                    <td className="py-2.5 px-2 text-center">{t.ppu || '-'}</td>
                    <td className="py-2.5 px-2 text-center">{t.pk || '-'}</td>
                    <td className="py-2.5 px-2 text-center">{t.lbi || '-'}</td>
                    <td className="py-2.5 px-2 text-center">{t.lbe || '-'}</td>
                    <td className="py-2.5 px-2 text-center">{t.pm || '-'}</td>
                    <td className="py-2.5 px-3 text-center text-purple-700 dark:text-purple-300 font-bold">
                      {t.skor_tps}
                    </td>
                    <td className="py-2.5 px-3 text-center text-red-600 font-bold">{t.skor_literasi}</td>
                    <td className="py-2.5 px-3 text-center font-black text-sm text-red-600 dark:text-red-400">
                      {t.skor_tertimbang}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => handleSelectTOToEdit(t)}
                        className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-sans font-bold text-[10px] hover:bg-purple-200"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            Belum ada nilai Try Out yang disimpan. Mulai masukkan nilai TO 1 di atas!
          </div>
        )}
      </div>
    </div>
  );
};
