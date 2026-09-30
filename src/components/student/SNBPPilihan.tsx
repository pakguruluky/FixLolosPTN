import React, { useState, useEffect } from 'react';
import {
  Save,
  Compass,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  School,
  Trash2,
  Zap,
  Lock,
} from 'lucide-react';
import { Siswa, PilihanPTNSNBP, Tambahan } from '../../types';
import {
  getTambahan,
  saveTambahan,
  getPilihanPTN,
  savePilihanPTN,
} from '../../services/api';
import {
  validatePilihanProvinsi,
  inferPTNTier,
  inferProdiTier,
  calcPredictedNRMSNBP,
  getMapelPendukungProdi,
} from '../../lib/calc';
import { PROVINSI_LIST, PTN_MASTER_LIST, PRODI_TIER_OPTIONS } from '../../data/mockPTN';

interface SNBPPilihanProps {
  siswa: Siswa;
  onRefreshData?: () => void;
}

interface SlotState {
  ptn: string;
  prodi: string;
  prov: string;
  nrm?: number;
  keketatan?: string;
  isCustom?: boolean;
  ptnTier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Vokasi';
  prodiTier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';
  jenjang?: 'S1' | 'D4' | 'D3';
}

export const SNBPPilihan: React.FC<SNBPPilihanProps> = ({ siswa, onRefreshData }) => {
  // Data Tambahan Sekolah
  const [rankingKelas, setRankingKelas] = useState<number | ''>('');
  const [rankingSekolah, setRankingSekolah] = useState<number | ''>('');
  const [alumniJurusan, setAlumniJurusan] = useState<number | ''>('');
  const [alumniPTN, setAlumniPTN] = useState<number | ''>('');

  // 2 Pilihan PTN (Input Mandiri)
  const [ptn1, setPtn1] = useState('');
  const [prov1, setProv1] = useState(siswa.provinsi_sekolah || 'DKI Jakarta');
  const [prodi1, setProdi1] = useState('');
  const [jenjang1, setJenjang1] = useState<'S1' | 'D4' | 'D3'>('S1');
  const [ptnTier1, setPtnTier1] = useState<'Tier 1' | 'Tier 2' | 'Tier 3' | 'Vokasi'>('Tier 1');
  const [prodiTier1, setProdiTier1] = useState<'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4'>('Tier 1');

  const [ptn2, setPtn2] = useState('');
  const [prov2, setProv2] = useState(siswa.provinsi_sekolah || 'DKI Jakarta');
  const [prodi2, setProdi2] = useState('');
  const [jenjang2, setJenjang2] = useState<'S1' | 'D4' | 'D3'>('S1');
  const [ptnTier2, setPtnTier2] = useState<'Tier 1' | 'Tier 2' | 'Tier 3' | 'Vokasi'>('Tier 2');
  const [prodiTier2, setProdiTier2] = useState<'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4'>('Tier 2');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warn'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [siswa]);

  const loadData = async () => {
    const t = await getTambahan(siswa.nis);
    if (t) {
      setRankingKelas(t.ranking_kelas || '');
      setRankingSekolah(t.ranking_sekolah || '');
      setAlumniJurusan(t.alumni_jurusan || '');
      setAlumniPTN(t.alumni_ptn || '');
    }

    const pils = await getPilihanPTN(siswa.nis);
    if (pils.length > 0) {
      const p1 = pils.find((p) => p.pilihan_ke === 1);
      const p2 = pils.find((p) => p.pilihan_ke === 2);

      if (p1) {
        setPtn1(p1.ptn || '');
        setProdi1(p1.prodi || '');
        setProv1(p1.provinsi_ptn || siswa.provinsi_sekolah || 'DKI Jakarta');
        setJenjang1(p1.jenjang || 'S1');
        if (p1.ptnTier) setPtnTier1(p1.ptnTier);
        else if (p1.ptn) setPtnTier1(inferPTNTier(p1.ptn));
        if (p1.prodiTier) setProdiTier1(p1.prodiTier);
        else if (p1.prodi) setProdiTier1(inferProdiTier(p1.prodi));
      }
      if (p2) {
        setPtn2(p2.ptn || '');
        setProdi2(p2.prodi || '');
        setProv2(p2.provinsi_ptn || siswa.provinsi_sekolah || 'DKI Jakarta');
        setJenjang2(p2.jenjang || 'S1');
        if (p2.ptnTier) setPtnTier2(p2.ptnTier);
        else if (p2.ptn) setPtnTier2(inferPTNTier(p2.ptn));
        if (p2.prodiTier) setProdiTier2(p2.prodiTier);
        else if (p2.prodi) setProdiTier2(inferProdiTier(p2.prodi));
      }
    }
  };

  // Auto-fill PTN 1 Tier & Provinsi when user types PTN
  const handlePtn1Change = (val: string) => {
    setPtn1(val);
    if (val.trim()) {
      const detected = inferPTNTier(val.trim());
      setPtnTier1(detected);
      const foundInMaster = PTN_MASTER_LIST.find(
        (m) =>
          m.nama.toLowerCase().includes(val.toLowerCase()) ||
          m.singkatan.toLowerCase() === val.trim().toLowerCase()
      );
      if (foundInMaster) {
        setProv1(foundInMaster.provinsi);
      }
    }
  };

  // Auto-fill Prodi 1 Tier when user types Prodi
  const handleProdi1Change = (val: string) => {
    setProdi1(val);
    if (val.trim()) {
      const detected = inferProdiTier(val.trim());
      setProdiTier1(detected);
    }
  };

  // Auto-fill PTN 2 Tier & Provinsi when user types PTN
  const handlePtn2Change = (val: string) => {
    setPtn2(val);
    if (val.trim()) {
      const detected = inferPTNTier(val.trim());
      setPtnTier2(detected);
      const foundInMaster = PTN_MASTER_LIST.find(
        (m) =>
          m.nama.toLowerCase().includes(val.toLowerCase()) ||
          m.singkatan.toLowerCase() === val.trim().toLowerCase()
      );
      if (foundInMaster) {
        setProv2(foundInMaster.provinsi);
      }
    }
  };

  // Auto-fill Prodi 2 Tier when user types Prodi
  const handleProdi2Change = (val: string) => {
    setProdi2(val);
    if (val.trim()) {
      const detected = inferProdiTier(val.trim());
      setProdiTier2(detected);
    }
  };

  // Live NRM and Mapel predictions
  const pred1 = calcPredictedNRMSNBP(ptnTier1, prodiTier1, jenjang1);
  const mapels1 = getMapelPendukungProdi(prodi1);

  const pred2 = calcPredictedNRMSNBP(ptnTier2, prodiTier2, jenjang2);
  const mapels2 = getMapelPendukungProdi(prodi2);

  const handleClearSlot1 = () => {
    setPtn1('');
    setProdi1('');
    setPtnTier1('Tier 1');
    setProdiTier1('Tier 1');
  };

  const handleClearSlot2 = () => {
    setPtn2('');
    setProdi2('');
    setPtnTier2('Tier 2');
    setProdiTier2('Tier 2');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setFeedback(null);

    const pilsToSave: PilihanPTNSNBP[] = [];

    if (ptn1.trim() && prodi1.trim()) {
      pilsToSave.push({
        nis: siswa.nis,
        pilihan_ke: 1,
        ptn: ptn1.trim(),
        prodi: prodi1.trim(),
        provinsi_ptn: prov1,
        timestamp: new Date().toISOString(),
        isCustom: true,
        ptnTier: ptnTier1,
        prodiTier: prodiTier1,
        jenjang: jenjang1,
        nrmTarget: pred1.nrm,
        keketatanTarget: pred1.keketatan,
        tier: ptnTier1,
      });
    }

    if (ptn2.trim() && prodi2.trim()) {
      // Cegah duplikat identik
      if (
        ptn1.trim().toLowerCase() === ptn2.trim().toLowerCase() &&
        prodi1.trim().toLowerCase() === prodi2.trim().toLowerCase()
      ) {
        setFeedback({
          type: 'warn',
          message: 'Pilihan 1 dan Pilihan 2 tidak boleh sama persis. Pilih program studi atau PTN yang berbeda.',
        });
        setSaving(false);
        return;
      }

      pilsToSave.push({
        nis: siswa.nis,
        pilihan_ke: 2,
        ptn: ptn2.trim(),
        prodi: prodi2.trim(),
        provinsi_ptn: prov2,
        timestamp: new Date().toISOString(),
        isCustom: true,
        ptnTier: ptnTier2,
        prodiTier: prodiTier2,
        jenjang: jenjang2,
        nrmTarget: pred2.nrm,
        keketatanTarget: pred2.keketatan,
        tier: ptnTier2,
      });
    }

    // Aturan Provinsi SNBP: Jika memilih 2 PTN, minimal 1 PTN harus seprovinsi dengan sekolah asal
    if (pilsToSave.length === 2) {
      const provCheck = validatePilihanProvinsi(pilsToSave, siswa.provinsi_sekolah);
      if (!provCheck.valid) {
        setFeedback({
          type: 'error',
          message: provCheck.pesan || 'Aturan provinsi SNBP: Jika memilih 2 PTN, minimal 1 PTN harus seprovinsi dengan sekolah Anda.',
        });
        setSaving(false);
        return;
      }
    }

    try {
      const tambahanPayload: Tambahan = {
        nis: siswa.nis,
        ranking_kelas: Number(rankingKelas) || 0,
        ranking_sekolah: Number(rankingSekolah) || 0,
        alumni_jurusan: Number(alumniJurusan) || 0,
        alumni_ptn: Number(alumniPTN) || 0,
        timestamp: new Date().toISOString(),
      };
      await saveTambahan(tambahanPayload);
      await savePilihanPTN(siswa.nis, pilsToSave);

      setFeedback({
        type: 'success',
        message: `Pilihan PTN SNBP (${pilsToSave.length} pilihan) & data sekolah berhasil disimpan! Nilai NRM dan peluang telah diperbarui.`,
      });
      if (onRefreshData) onRefreshData();
      setTimeout(() => setFeedback(null), 3800);
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menyimpan pilihan PTN.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-[#7C3AED] to-indigo-700 p-6 text-white shadow-xl">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Target Kampus Impian SNBP 2027 • Input Mandiri Cerdas</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Pilihan PTN &amp; Rekam Jejak Sekolah
          </h2>
          <p className="text-xs text-purple-100 max-w-2xl leading-relaxed">
            Ketik langsung Nama PTN dan Program Studi pilihan Anda. <span className="font-extrabold text-amber-300">Tier PTN dan Tier Prodi terisi secara otomatis</span>, dan nilai NRM acuan serta estimasi keketatan diprediksikan langsung secara real-time!
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-black/25 backdrop-blur-sm border border-white/20 font-bold">
              📍 Provinsi Sekolah: <span className="text-amber-300 font-extrabold">{siswa.provinsi_sekolah || 'DKI Jakarta'}</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-black/25 backdrop-blur-sm border border-white/20 font-medium text-[11px]">
              Aturan SNBP: Maks. 2 pilihan (Bila memilih 2 PTN, min. 1 PTN wajib seprovinsi dengan sekolah).
            </span>
          </div>
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

      {/* Datalist for PTN Autocomplete Suggestions */}
      <datalist id="ptn-suggestions">
        {PTN_MASTER_LIST.map((p) => (
          <option key={p.singkatan} value={p.nama}>
            {p.singkatan} ({p.provinsi})
          </option>
        ))}
      </datalist>

      {/* 2 PILIHAN PTN CARDS (INPUT MANDIRI DENGAN AUTO-TIER) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PILIHAN 1 */}
        <div className="bg-white dark:bg-[#160E2E] rounded-3xl border-2 border-purple-200 dark:border-purple-900/60 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-950/40">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                  1
                </span>
                <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                  Pilihan 1 (Prioritas Utama)
                </span>
              </div>
              {(ptn1 || prodi1) && (
                <button
                  type="button"
                  onClick={handleClearSlot1}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors"
                  title="Kosongkan Pilihan 1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            {/* Form Input Mandiri Slot 1 */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1">
                  Nama Perguruan Tinggi Negeri (PTN)
                </label>
                <input
                  type="text"
                  list="ptn-suggestions"
                  value={ptn1}
                  onChange={(e) => handlePtn1Change(e.target.value)}
                  placeholder="Contoh: Universitas Indonesia, ITB, UGM, Unair..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white font-bold focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1">
                    Provinsi Kampus
                  </label>
                  <select
                    value={prov1}
                    onChange={(e) => setProv1(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white font-medium"
                  >
                    {PROVINSI_LIST.map((pr) => (
                      <option key={pr} value={pr}>
                        {pr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1">
                    Jenjang
                  </label>
                  <select
                    value={jenjang1}
                    onChange={(e) => setJenjang1(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white font-semibold"
                  >
                    <option value="S1">S1 (Sarjana Akademik)</option>
                    <option value="D4">D4 (Sarjana Terapan)</option>
                    <option value="D3">D3 (Diploma Tiga)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1">
                  Nama Program Studi
                </label>
                <input
                  type="text"
                  value={prodi1}
                  onChange={(e) => handleProdi1Change(e.target.value)}
                  placeholder="Contoh: Pendidikan Dokter, Teknik Informatika, Ilmu Hukum..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white font-bold focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Auto-detected Tier Controls (Locked & Automatic) */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-purple-600" />
                      <span>Tier PTN (Otomatis)</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 font-bold">
                      Terkunci
                    </span>
                  </div>
                  <select
                    value={ptnTier1}
                    disabled
                    aria-readonly="true"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-purple-200 dark:border-purple-800 bg-gray-100 dark:bg-[#130B29] font-bold text-purple-900 dark:text-purple-200 cursor-not-allowed opacity-90 shadow-inner"
                  >
                    <option value="Tier 1">Tier 1 (Top Elite Nasional)</option>
                    <option value="Tier 2">Tier 2 (Unggulan Regional)</option>
                    <option value="Tier 3">Tier 3 (Potensial &amp; Mandiri)</option>
                    <option value="Vokasi">Vokasi / Politeknik Negeri</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-purple-600" />
                      <span>Tier Prodi (Otomatis)</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 font-bold">
                      Terkunci
                    </span>
                  </div>
                  <select
                    value={prodiTier1}
                    disabled
                    aria-readonly="true"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-purple-200 dark:border-purple-800 bg-gray-100 dark:bg-[#130B29] font-bold text-purple-900 dark:text-purple-200 cursor-not-allowed opacity-90 shadow-inner"
                  >
                    {PRODI_TIER_OPTIONS.map((opt) => (
                      <option key={opt.tier} value={opt.tier}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Live Preview Card Slot 1 */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-[#1E1540] dark:to-[#160E2E] border-2 border-purple-300 dark:border-purple-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Prediksi NRM Berdasarkan Tier Prodi &amp; PTN</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                  {ptnTier1} • {prodiTier1}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#160E2E] border border-purple-100 dark:border-purple-900/60">
                  <span className="text-[10px] text-gray-500 block">Prediksi NRM Acuan</span>
                  <span className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono">
                    {pred1.nrm.toFixed(1)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#160E2E] border border-purple-100 dark:border-purple-900/60">
                  <span className="text-[10px] text-gray-500 block">Estimasi Keketatan</span>
                  <span className="text-xl font-black text-rose-600 font-mono">
                    {pred1.keketatan}
                  </span>
                </div>
              </div>

              {/* Mapel Pendukung Kepmendikdasmen 102/M/2025 */}
              <div className="p-2.5 rounded-xl bg-purple-100/60 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px]">
                <div className="text-[10px] font-bold text-purple-800 dark:text-purple-200 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-purple-600" />
                  <span>Mapel Pendukung (Kepmendikdasmen 102/M/2025):</span>
                </div>
                <div className="font-extrabold text-purple-900 dark:text-purple-100 mt-0.5">
                  {mapels1[0] && mapels1[1]
                    ? `${mapels1[0]} & ${mapels1[1]}`
                    : mapels1[0] || 'Ketik nama prodi untuk mendeteksi'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PILIHAN 2 */}
        <div className="bg-white dark:bg-[#160E2E] rounded-3xl border-2 border-purple-200 dark:border-purple-900/60 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-950/40">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                  2
                </span>
                <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                  Pilihan 2 (Cadangan / Alternatif)
                </span>
              </div>
              {(ptn2 || prodi2) && (
                <button
                  type="button"
                  onClick={handleClearSlot2}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors"
                  title="Kosongkan Pilihan 2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            {/* Form Input Mandiri Slot 2 */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1">
                  Nama Perguruan Tinggi Negeri (PTN)
                </label>
                <input
                  type="text"
                  list="ptn-suggestions"
                  value={ptn2}
                  onChange={(e) => handlePtn2Change(e.target.value)}
                  placeholder="Contoh: Universitas Padjadjaran, Undip, UNS, UB..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white font-bold focus:bg-white focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1">
                    Provinsi Kampus
                  </label>
                  <select
                    value={prov2}
                    onChange={(e) => setProv2(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white font-medium"
                  >
                    {PROVINSI_LIST.map((pr) => (
                      <option key={pr} value={pr}>
                        {pr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1">
                    Jenjang
                  </label>
                  <select
                    value={jenjang2}
                    onChange={(e) => setJenjang2(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white font-semibold"
                  >
                    <option value="S1">S1 (Sarjana Akademik)</option>
                    <option value="D4">D4 (Sarjana Terapan)</option>
                    <option value="D3">D3 (Diploma Tiga)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1">
                  Nama Program Studi
                </label>
                <input
                  type="text"
                  value={prodi2}
                  onChange={(e) => handleProdi2Change(e.target.value)}
                  placeholder="Contoh: Akuntansi, Manajemen, Psikologi, Ilmu Komunikasi..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white font-bold focus:bg-white focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Auto-detected Tier Controls (Locked & Automatic) */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-indigo-50/70 dark:bg-purple-950/40 border border-indigo-100 dark:border-purple-900/50 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-purple-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-indigo-600" />
                      <span>Tier PTN (Otomatis)</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-200 dark:bg-purple-900 text-indigo-900 dark:text-purple-200 font-bold">
                      Terkunci
                    </span>
                  </div>
                  <select
                    value={ptnTier2}
                    disabled
                    aria-readonly="true"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-indigo-200 dark:border-purple-800 bg-gray-100 dark:bg-[#130B29] font-bold text-indigo-900 dark:text-purple-200 cursor-not-allowed opacity-90 shadow-inner"
                  >
                    <option value="Tier 1">Tier 1 (Top Elite Nasional)</option>
                    <option value="Tier 2">Tier 2 (Unggulan Regional)</option>
                    <option value="Tier 3">Tier 3 (Potensial &amp; Mandiri)</option>
                    <option value="Vokasi">Vokasi / Politeknik Negeri</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-purple-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-indigo-600" />
                      <span>Tier Prodi (Otomatis)</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-200 dark:bg-purple-900 text-indigo-900 dark:text-purple-200 font-bold">
                      Terkunci
                    </span>
                  </div>
                  <select
                    value={prodiTier2}
                    disabled
                    aria-readonly="true"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-indigo-200 dark:border-purple-800 bg-gray-100 dark:bg-[#130B29] font-bold text-indigo-900 dark:text-purple-200 cursor-not-allowed opacity-90 shadow-inner"
                  >
                    {PRODI_TIER_OPTIONS.map((opt) => (
                      <option key={opt.tier} value={opt.tier}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Live Preview Card Slot 2 */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#1E1540] dark:to-[#160E2E] border-2 border-indigo-300 dark:border-purple-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-purple-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Prediksi NRM Berdasarkan Tier Prodi &amp; PTN</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                  {ptnTier2} • {prodiTier2}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#160E2E] border border-indigo-100 dark:border-purple-900/60">
                  <span className="text-[10px] text-gray-500 block">Prediksi NRM Acuan</span>
                  <span className="text-xl font-black text-indigo-700 dark:text-purple-300 font-mono">
                    {pred2.nrm.toFixed(1)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#160E2E] border border-indigo-100 dark:border-purple-900/60">
                  <span className="text-[10px] text-gray-500 block">Estimasi Keketatan</span>
                  <span className="text-xl font-black text-rose-600 font-mono">
                    {pred2.keketatan}
                  </span>
                </div>
              </div>

              {/* Mapel Pendukung Kepmendikdasmen 102/M/2025 */}
              <div className="p-2.5 rounded-xl bg-indigo-100/60 dark:bg-purple-950/60 border border-indigo-200 dark:border-purple-800 text-[11px]">
                <div className="text-[10px] font-bold text-indigo-800 dark:text-purple-200 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-indigo-600" />
                  <span>Mapel Pendukung (Kepmendikdasmen 102/M/2025):</span>
                </div>
                <div className="font-extrabold text-indigo-900 dark:text-purple-100 mt-0.5">
                  {mapels2[0] && mapels2[1]
                    ? `${mapels2[0]} & ${mapels2[1]}`
                    : mapels2[0] || 'Ketik nama prodi untuk mendeteksi'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DATA SEKOLAH & REKAM JEJAK ALUMNI */}
      <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-purple-50 dark:border-purple-950/40 pb-3">
          <School className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
              Data Tambahan Sekolah &amp; Rekam Jejak Alumni
            </h3>
            <p className="text-[11px] text-gray-500">
              Mempengaruhi bobot penilaian pilar rekam jejak sekolah (Maks. 35 Poin dalam kalkulasi SNBP).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <label className="block text-xs font-bold text-gray-800 dark:text-purple-200 mb-1">
              Ranking Kelas Paralel
            </label>
            <input
              type="number"
              min="0"
              max="200"
              value={rankingKelas}
              onChange={(e) => setRankingKelas(e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="Contoh: 1, 3, 10"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">1-10: 5 poin | 11-20: 3 poin</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <label className="block text-xs font-bold text-gray-800 dark:text-purple-200 mb-1">
              Ranking Sekolah di Kota/Provinsi
            </label>
            <input
              type="number"
              min="0"
              max="1000"
              value={rankingSekolah}
              onChange={(e) => setRankingSekolah(e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="Contoh: 5, 25"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">1-10: 10 poin | &gt;10: 5 poin</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <label className="block text-xs font-bold text-gray-800 dark:text-purple-200 mb-1">
              Alumni Diterima di Jurusan Pilihan
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={alumniJurusan}
              onChange={(e) => setAlumniJurusan(e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="Jumlah alumni tahun lalu"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">&gt;3: 10 poin | 1-3: 5 poin</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <label className="block text-xs font-bold text-gray-800 dark:text-purple-200 mb-1">
              Alumni Diterima di PTN Pilihan
            </label>
            <input
              type="number"
              min="0"
              max="500"
              value={alumniPTN}
              onChange={(e) => setAlumniPTN(e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="Jumlah alumni di kampus ini"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">&gt;=30: 10 poin | 1-29: 5 poin</span>
          </div>
        </div>
      </div>

      {/* Floating Save Action Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan Pilihan...' : 'Simpan Pilihan PTN & Rekam Jejak Sekolah'}</span>
        </button>
      </div>
    </div>
  );
};
