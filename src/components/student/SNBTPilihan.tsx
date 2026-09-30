import React, { useState, useEffect } from 'react';
import {
  Save,
  Compass,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Zap,
  Lock,
} from 'lucide-react';
import { Siswa, PilihanPTNSNBT, TOData } from '../../types';
import { getPilihanSNBT, savePilihanSNBT, getTOData } from '../../services/api';
import {
  inferPTNTier,
  inferProdiTier,
  calcPredictedNAMSNBT,
  calcSkalaPrediksiSNBT,
  calcStatistikSNBT,
} from '../../lib/calc';
import { PTN_MASTER_LIST, PRODI_TIER_OPTIONS } from '../../data/mockPTN';

interface SNBTPilihanProps {
  siswa: Siswa;
  onRefreshData?: () => void;
}

export const SNBTPilihan: React.FC<SNBTPilihanProps> = ({ siswa, onRefreshData }) => {
  // 4 Slot SNBT
  const [pilihanSlots, setPilihanSlots] = useState<(PilihanPTNSNBT | null)[]>([null, null, null, null]);
  const [avgTert, setAvgTert] = useState<number>(0);

  // Active editing slot modal or inline drawer
  const [editingSlotIdx, setEditingSlotIdx] = useState<number | null>(null);

  // Form input mandiri states for the active editing slot
  const [customPtn, setCustomPtn] = useState('');
  const [customProdi, setCustomProdi] = useState('');
  const [customJenjang, setCustomJenjang] = useState<'S1' | 'D4' | 'D3'>('S1');
  const [customPtnTier, setCustomPtnTier] = useState<'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' | 'Vokasi'>('Tier 2');
  const [customProdiTier, setCustomProdiTier] = useState<'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4'>('Tier 2');
  const [customNamTarget, setCustomNamTarget] = useState<number>(640);
  const [isNamOverridden, setIsNamOverridden] = useState(false);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warn'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [siswa]);

  const loadData = async () => {
    const list = await getPilihanSNBT(siswa.nis);
    const slots: (PilihanPTNSNBT | null)[] = [null, null, null, null];
    list.forEach((p) => {
      if (p.pilihan_ke >= 1 && p.pilihan_ke <= 4) {
        slots[p.pilihan_ke - 1] = p;
      }
    });
    setPilihanSlots(slots);

    const toData = await getTOData(siswa.nis);
    if (toData.length > 0) {
      const stats = calcStatistikSNBT(toData);
      setAvgTert(stats.avgTert);
    }
  };

  // Open slot editor
  const handleOpenEditSlot = (slotIndex: number) => {
    setEditingSlotIdx(slotIndex);
    const existing = pilihanSlots[slotIndex];
    if (existing) {
      setCustomPtn(existing.ptn_nama || existing.singk_ptn);
      setCustomProdi(existing.prodi);
      setCustomJenjang(existing.jenjang || 'S1');
      setCustomPtnTier((existing.ptnTier || existing.tier || 'Tier 2') as any);
      setCustomProdiTier((existing.prodiTier || 'Tier 2') as any);
      setCustomNamTarget(existing.namTarget || 640);
      setIsNamOverridden(true);
    } else {
      setCustomPtn('');
      setCustomProdi('');
      setCustomJenjang('S1');
      const defaultTier = slotIndex === 0 ? 'Tier 1' : 'Tier 2';
      setCustomPtnTier(defaultTier);
      setCustomProdiTier(defaultTier);
      const pred = calcPredictedNAMSNBT(defaultTier, defaultTier, 'S1');
      setCustomNamTarget(pred.namTarget);
      setIsNamOverridden(false);
    }
  };

  // Auto-detect PTN tier when custom PTN changes
  const handleCustomPtnChange = (val: string) => {
    setCustomPtn(val);
    if (val.trim()) {
      const detected = inferPTNTier(val.trim());
      setCustomPtnTier(detected as any);
      if (!isNamOverridden) {
        const pred = calcPredictedNAMSNBT(detected, customProdiTier, customJenjang);
        setCustomNamTarget(pred.namTarget);
      }
    }
  };

  // Auto-detect Prodi tier when custom Prodi changes
  const handleCustomProdiChange = (val: string) => {
    setCustomProdi(val);
    if (val.trim()) {
      const detected = inferProdiTier(val.trim());
      setCustomProdiTier(detected);
      if (!isNamOverridden) {
        const pred = calcPredictedNAMSNBT(customPtnTier, detected, customJenjang);
        setCustomNamTarget(pred.namTarget);
      }
    }
  };

  // When tiers or jenjang are changed by user in dropdown, update NAM target if not manually overridden
  const handleTierChange = (
    newPtnTier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' | 'Vokasi',
    newProdiTier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4',
    newJenjang: 'S1' | 'D4' | 'D3'
  ) => {
    setCustomPtnTier(newPtnTier);
    setCustomProdiTier(newProdiTier);
    setCustomJenjang(newJenjang);
    const pred = calcPredictedNAMSNBT(newPtnTier, newProdiTier, newJenjang);
    setCustomNamTarget(pred.namTarget);
    setIsNamOverridden(false);
  };

  const handleApplySlot = (slotIndex: number) => {
    if (!customPtn.trim() || !customProdi.trim()) {
      setFeedback({
        type: 'warn',
        message: 'Mohon isi Nama PTN dan Program Studi pilihan.',
      });
      return;
    }

    // Cegah duplikat prodi & ptn
    const isDup = pilihanSlots.some(
      (slot, i) =>
        i !== slotIndex &&
        slot &&
        slot.singk_ptn.toLowerCase() === customPtn.trim().toLowerCase() &&
        slot.prodi.toLowerCase() === customProdi.trim().toLowerCase()
    );

    if (isDup) {
      setFeedback({
        type: 'warn',
        message: 'Kombinasi PTN dan program studi ini sudah dipilih pada slot lain.',
      });
      return;
    }

    const target = customNamTarget > 0 ? customNamTarget : 640.0;

    setPilihanSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        nis: siswa.nis,
        pilihan_ke: slotIndex + 1,
        singk_ptn: customPtn.trim(),
        ptn_nama: customPtn.trim(),
        prodi: customProdi.trim(),
        namTarget: target,
        ptnTier: customPtnTier,
        prodiTier: customProdiTier,
        jenjang: customJenjang,
        tier: customPtnTier,
        isCustom: true,
      };
      return next;
    });

    setEditingSlotIdx(null);
    setFeedback({
      type: 'success',
      message: `Pilihan ${slotIndex + 1} (${customProdi.trim()}) berhasil diisi secara mandiri!`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRemoveSlot = (slotIndex: number) => {
    setPilihanSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    if (editingSlotIdx === slotIndex) {
      setEditingSlotIdx(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const validToSave = pilihanSlots.filter((p): p is PilihanPTNSNBT => p !== null);
      await savePilihanSNBT(siswa.nis, validToSave);
      setFeedback({
        type: 'success',
        message: `Berhasil menyimpan ${validToSave.length} pilihan program studi UTBK-SNBT!`,
      });
      if (onRefreshData) onRefreshData();
      setTimeout(() => setFeedback(null), 3800);
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menyimpan pilihan SNBT.' });
    } finally {
      setSaving(false);
    }
  };

  const slotLabels = [
    'Pilihan 1 (Prioritas Tertinggi)',
    'Pilihan 2 (Peluang Utama)',
    'Pilihan 3 (Alternatif Cadangan)',
    'Pilihan 4 (Penjamin Kelulusan)',
  ];

  const livePredNAM = calcPredictedNAMSNBT(customPtnTier, customProdiTier, customJenjang);

  return (
    <div className="space-y-6">
      {/* Header Banner - Teenage Vibrant Style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-purple-800 p-6 text-white shadow-xl shadow-red-600/20">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Target Pilihan UTBK-SNBT 2027 • Input Mandiri Cerdas</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Pilihan Program Studi UTBK-SNBT
          </h2>
          <p className="text-xs text-red-100 max-w-2xl leading-relaxed">
            Tentukan hingga 4 pilihan kampus impian secara mandiri. <span className="font-extrabold text-amber-300">Tier PTN dan Tier Prodi terisi otomatis</span>, dan target Nilai Ambang Masuk (NAM) langsung dihitung untuk mengukur peluang lolos berdasarkan rata-rata skor Try Out Anda ({avgTert > 0 ? `${avgTert.toFixed(2)}` : 'Belum isi TO'}).
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all shadow-md ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-2 border-emerald-400'
              : feedback.type === 'warn'
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-2 border-amber-400'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-2 border-rose-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span className="flex-1">{feedback.message}</span>
        </div>
      )}

      {/* Datalist for PTN Suggestions */}
      <datalist id="ptn-snbt-suggestions">
        {PTN_MASTER_LIST.map((p) => (
          <option key={p.singkatan} value={p.nama}>
            {p.singkatan} ({p.provinsi})
          </option>
        ))}
      </datalist>

      {/* 4 Pilihan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pilihanSlots.map((slot, idx) => {
          const isSlotEditing = editingSlotIdx === idx;
          const nam = slot?.namTarget || 640;
          const predScale = slot ? calcSkalaPrediksiSNBT(avgTert, nam, slot.tier) : null;

          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#160E2E] rounded-3xl border-2 border-red-100 dark:border-red-950/50 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                {/* Slot Top Header */}
                <div className="flex items-center justify-between pb-3 border-b border-red-50 dark:border-red-950/30">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shadow-sm ${
                        idx === 0
                          ? 'bg-red-600 text-white'
                          : idx === 1
                          ? 'bg-rose-600 text-white'
                          : idx === 2
                          ? 'bg-purple-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-xs text-gray-900 dark:text-white">
                      {slotLabels[idx]}
                    </span>
                  </div>

                  {slot && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditSlot(idx)}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                      >
                        Ubah
                      </button>
                      <button
                        onClick={() => handleRemoveSlot(idx)}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors"
                        title="Hapus slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>

                {slot && !isSlotEditing ? (
                  /* Filled Slot View */
                  <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-red-50/70 via-white to-amber-50/40 dark:from-[#24132B] dark:to-[#160E2E] border-2 border-red-200 dark:border-red-900/60 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white mb-1.5">
                          ✏️ Input Mandiri
                        </span>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                          {slot.prodi}
                        </h3>
                        <p className="text-xs font-extrabold text-red-600 dark:text-red-400 mt-0.5">
                          {slot.ptn_nama || slot.singk_ptn}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                          {slot.ptnTier || slot.tier || 'Tier 2'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-red-100 dark:border-red-950/40 text-xs">
                      <div className="p-2 rounded-xl bg-white/80 dark:bg-[#160E2E] border border-red-100 dark:border-red-950/50">
                        <span className="text-[10px] text-gray-500 block">Target NAM Masuk</span>
                        <span className="font-black text-red-600 dark:text-red-400 font-mono text-sm">
                          {nam.toFixed(1)}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-white/80 dark:bg-[#160E2E] border border-red-100 dark:border-red-950/50">
                        <span className="text-[10px] text-gray-500 block">Jenjang Program</span>
                        <span className="font-extrabold text-gray-800 dark:text-purple-200">
                          {slot.jenjang || 'S1'}
                        </span>
                      </div>
                    </div>

                    {/* Skala Prediksi Skor Live */}
                    {predScale && avgTert > 0 && (
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E1540] border border-red-200 dark:border-purple-900 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-red-500" />
                            Skala Prediksi Lolos:
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${predScale.badgeColor}`}>
                            {predScale.label} ({predScale.chancePct}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${predScale.gradientColor} transition-all duration-500`}
                            style={{ width: `${predScale.chancePct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>Gap: {predScale.gap >= 0 ? `+${predScale.gap}` : `${predScale.gap}`} poin</span>
                          <span className="truncate max-w-[200px] text-gray-500 italic">{predScale.advice}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : isSlotEditing ? (
                  /* Form Input Mandiri Cerdas Dalam Slot */
                  <div className="mt-4 p-4 rounded-2xl bg-red-50/50 dark:bg-[#1E1540]/60 border-2 border-red-300 dark:border-purple-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-red-700 dark:text-purple-300 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Input Mandiri Pilihan {idx + 1}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingSlotIdx(null)}
                        className="text-[11px] font-bold text-gray-500 hover:text-gray-700"
                      >
                        Batal
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                        Nama PTN
                      </label>
                      <input
                        type="text"
                        list="ptn-snbt-suggestions"
                        value={customPtn}
                        onChange={(e) => handleCustomPtnChange(e.target.value)}
                        placeholder="Contoh: UI, ITB, UGM, Unair, ITS..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#160E2E] text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                        Nama Program Studi
                      </label>
                      <input
                        type="text"
                        value={customProdi}
                        onChange={(e) => handleCustomProdiChange(e.target.value)}
                        placeholder="Contoh: Teknik Informatika, Kedokteran, Ilmu Hukum..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#160E2E] text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                          Jenjang
                        </label>
                        <select
                          value={customJenjang}
                          onChange={(e) =>
                            handleTierChange(customPtnTier, customProdiTier, e.target.value as any)
                          }
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#160E2E] font-semibold"
                        >
                          <option value="S1">S1 (Sarjana)</option>
                          <option value="D4">D4 (Terapan)</option>
                          <option value="D3">D3 (Diploma)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-gray-700 dark:text-purple-200 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-red-500" />
                            <span>Tier PTN (Otomatis)</span>
                          </label>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold">
                            Terkunci
                          </span>
                        </div>
                        <select
                          value={customPtnTier}
                          disabled
                          aria-readonly="true"
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-purple-900 bg-gray-100 dark:bg-[#130B29] font-bold cursor-not-allowed opacity-90 shadow-inner"
                        >
                          <option value="Tier 1">Tier 1</option>
                          <option value="Tier 2">Tier 2</option>
                          <option value="Tier 3">Tier 3</option>
                          <option value="Tier 4">Tier 4</option>
                          <option value="Vokasi">Vokasi</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-gray-700 dark:text-purple-200 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-red-500" />
                            <span>Tier Prodi (Otomatis)</span>
                          </label>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold">
                            Terkunci
                          </span>
                        </div>
                        <select
                          value={customProdiTier}
                          disabled
                          aria-readonly="true"
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-purple-900 bg-gray-100 dark:bg-[#130B29] font-bold cursor-not-allowed opacity-90 shadow-inner"
                        >
                          {PRODI_TIER_OPTIONS.map((opt) => (
                            <option key={opt.tier} value={opt.tier}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-gray-700 dark:text-purple-200 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-red-500" />
                            <span>Target NAM (Otomatis)</span>
                          </label>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold">
                            Auto
                          </span>
                        </div>
                        <input
                          type="number"
                          step="0.5"
                          value={livePredNAM.namTarget}
                          disabled
                          readOnly
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-purple-900 bg-gray-100 dark:bg-[#130B29] font-mono font-bold text-red-600 cursor-not-allowed opacity-90 shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white/80 dark:bg-[#160E2E] border border-red-200 dark:border-purple-900 text-[11px] flex justify-between items-center">
                      <span>Estimasi Target Ambang Masuk:</span>
                      <strong className="text-red-600 font-mono font-black">{livePredNAM.namTarget}</strong>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingSlotIdx(null)}
                        className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:hover:bg-purple-900 rounded-xl"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplySlot(idx)}
                        className="px-4 py-1.5 text-xs font-bold bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700"
                      >
                        Pasang di Pilihan {idx + 1}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Empty Slot View / Button to Add */
                  <div className="mt-4 p-8 rounded-2xl border-2 border-dashed border-gray-200 dark:border-purple-900/60 text-center space-y-3">
                    <p className="text-xs text-gray-400">Slot Pilihan {idx + 1} masih kosong.</p>
                    <button
                      type="button"
                      onClick={() => handleOpenEditSlot(idx)}
                      className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 transition-all inline-flex items-center gap-1.5"
                    >
                      <span>+ Input Mandiri Pilihan {idx + 1}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Save Action Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-700 hover:from-red-700 hover:to-purple-800 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan Pilihan SNBT...' : 'Simpan Seluruh Pilihan SNBT'}</span>
        </button>
      </div>
    </div>
  );
};
