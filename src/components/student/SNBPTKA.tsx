import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Award, Info } from 'lucide-react';
import { Siswa, TKAData } from '../../types';
import { getTKA, saveTKA } from '../../services/api';
import {
  TKA_MAPEL_PILIHAN,
  RATA_NASIONAL_TKA,
  convertIRTto100,
  getKategoriTKA,
} from '../../lib/calc';

interface SNBPTKAProps {
  siswa: Siswa;
  onRefreshData?: () => void;
}

export const SNBPTKA: React.FC<SNBPTKAProps> = ({ siswa, onRefreshData }) => {
  const [tkaIndo, setTkaIndo] = useState<number | ''>('');
  const [tkaIng, setTkaIng] = useState<number | ''>('');
  const [tkaMat, setTkaMat] = useState<number | ''>('');

  const [mapelPilihan1, setMapelPilihan1] = useState<string>('Fisika');
  const [nilaiTka1, setNilaiTka1] = useState<number | ''>('');

  const [mapelPilihan2, setMapelPilihan2] = useState<string>('Matematika Lanjut');
  const [nilaiTka2, setNilaiTka2] = useState<number | ''>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [siswa]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTKA(siswa.nis);
      if (data) {
        setTkaIndo(data.tka_indo || '');
        setTkaIng(data.tka_ing || '');
        setTkaMat(data.tka_mat || '');
        setMapelPilihan1(data.mapel_pilihan1 || 'Fisika');
        setNilaiTka1(data.nilai_tka1 || '');
        setMapelPilihan2(data.mapel_pilihan2 || 'Matematika Lanjut');
        setNilaiTka2(data.nilai_tka2 || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setFeedback(null);

    // Validasi UI: tolak simpan bila ada nilai > 0 di luar 200–800
    const vals = [
      { name: 'Bahasa Indonesia', val: Number(tkaIndo) },
      { name: 'Bahasa Inggris', val: Number(tkaIng) },
      { name: 'Matematika', val: Number(tkaMat) },
      { name: mapelPilihan1, val: Number(nilaiTka1) },
      { name: mapelPilihan2, val: Number(nilaiTka2) },
    ];

    for (const item of vals) {
      if (item.val > 0 && (item.val < 200 || item.val > 800)) {
        setFeedback({
          type: 'error',
          message: `Nilai TKA untuk ${item.name} harus berada dalam rentang IRT 200 s.d. 800 (atau kosongkan jika tidak mengikuti).`,
        });
        return;
      }
    }

    setSaving(true);
    try {
      const payload: TKAData = {
        nis: siswa.nis,
        tka_indo: Number(tkaIndo) || 0,
        tka_ing: Number(tkaIng) || 0,
        tka_mat: Number(tkaMat) || 0,
        mapel_pilihan1: mapelPilihan1,
        nilai_tka1: Number(nilaiTka1) || 0,
        mapel_pilihan2: mapelPilihan2,
        nilai_tka2: Number(nilaiTka2) || 0,
        timestamp: new Date().toISOString(),
      };

      await saveTKA(payload);
      setFeedback({ type: 'success', message: 'Nilai TKA berhasil disimpan!' });
      if (onRefreshData) onRefreshData();
      setTimeout(() => setFeedback(null), 3800);
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menyimpan data TKA.' });
    } finally {
      setSaving(false);
    }
  };

  const renderInputCard = (
    title: string,
    val: number | '',
    onChange: (v: number | '') => void,
    mapelKey: string,
    isPilihan = false,
    pilihanSelector?: React.ReactNode
  ) => {
    const num = Number(val) || 0;
    const skala100 = convertIRTto100(num);
    const kat = getKategoriTKA(num);
    const rataNas = RATA_NASIONAL_TKA[mapelKey] || 55.0;
    const diffNas = num > 0 ? (skala100 - rataNas).toFixed(1) : null;

    return (
      <div className="neo-card-sm p-4 bg-white dark:bg-[#181133] shadow-[3px_3px_0px_#0f172a] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-[#0f172a] dark:text-white">
              {isPilihan ? 'Mapel Pilihan' : title}
            </span>
            <span className="neo-badge px-2 py-0.5 bg-amber-300 text-[#0f172a] text-[9px] font-black">
              IRT 200–800
            </span>
          </div>

          {pilihanSelector}

          <div className="mt-2.5">
            <input
              type="number"
              min="200"
              max="800"
              value={val}
              onChange={(e) => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="0 (kosongkan bila tidak ikut)"
              className="w-full px-3 py-2 text-sm neo-input font-mono font-bold"
            />
          </div>
        </div>

        {/* Live conversion under input */}
        <div className="mt-3 pt-3 border-t-2 border-[#0f172a]/15 text-xs font-bold space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-purple-300">Konversi Skala 100:</span>
            <span className="font-mono font-black text-purple-700 dark:text-purple-300 text-sm">
              {num > 0 ? skala100.toFixed(2) : '-'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-purple-300">Kategori:</span>
            <span className={`font-black ${kat.color}`}>{kat.label}</span>
          </div>

          {diffNas !== null && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500">vs Rata Nasional ({rataNas}):</span>
              <span
                className={`font-black ${
                  parseFloat(diffNas) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {parseFloat(diffNas) >= 0 ? `+${diffNas}` : diffNas}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card Neo-Brutalism */}
      <div className="neo-card p-5 sm:p-6 bg-white dark:bg-[#181133] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 neo-badge px-3 py-1 bg-amber-300 text-[#0f172a] text-xs font-black mb-2">
            <Award className="w-3.5 h-3.5 text-[#0f172a]" />
            <span>TES KEMAMPUAN AKADEMIK (TKA)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white tracking-tight">
            Input Nilai Tes Kemampuan Akademik (TKA)
          </h2>
          <p className="text-xs font-bold text-gray-700 dark:text-purple-300 mt-1">
            Nilai diinput dalam skala <strong>IRT (200 – 800)</strong>. TKA digunakan untuk memvalidasi kewajaran nilai rapor dan menambah bobot peluang SNBP Anda.
          </p>
        </div>

        <div className="neo-card-sm px-4 py-3 bg-cyan-300 text-[#0f172a] text-xs font-black shadow-[2.5px_2.5px_0px_#0f172a] self-start md:self-auto flex items-center gap-2">
          <span>⚡ Standar Resmi IRT 2027</span>
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

      {/* 3 Mapel Wajib Grid */}
      <div className="neo-card p-5 bg-purple-100 dark:bg-[#181133] space-y-3">
        <h3 className="text-xs font-black text-[#0f172a] dark:text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
          <span>📌 3 Mapel Wajib</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInputCard('Bahasa Indonesia', tkaIndo, setTkaIndo, 'Bahasa Indonesia')}
          {renderInputCard('Bahasa Inggris', tkaIng, setTkaIng, 'Bahasa Inggris')}
          {renderInputCard('Matematika', tkaMat, setTkaMat, 'Matematika')}
        </div>
      </div>

      {/* 2 Mapel Pilihan Grid */}
      <div className="neo-card p-5 bg-amber-100 dark:bg-[#181133] space-y-3">
        <h3 className="text-xs font-black text-[#0f172a] dark:text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
          <span>🎯 2 Mapel Pilihan (Sesuai Prodi Incaran)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputCard(
            'Pilihan 1',
            nilaiTka1,
            setNilaiTka1,
            mapelPilihan1,
            true,
            <select
              value={mapelPilihan1}
              onChange={(e) => setMapelPilihan1(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs neo-select"
            >
              {TKA_MAPEL_PILIHAN.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}

          {renderInputCard(
            'Pilihan 2',
            nilaiTka2,
            setNilaiTka2,
            mapelPilihan2,
            true,
            <select
              value={mapelPilihan2}
              onChange={(e) => setMapelPilihan2(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs neo-select"
            >
              {TKA_MAPEL_PILIHAN.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-6 py-3 neo-btn bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-[3px_3px_0px_#0f172a] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : '💾 Simpan Nilai TKA'}</span>
        </button>
      </div>

      {/* Reference Table of Categories Neo-Brutalism */}
      <div className="neo-card p-0 overflow-hidden bg-white dark:bg-[#181133]">
        <div className="p-4 bg-purple-200 dark:bg-purple-950/60 border-b-2.5 border-[#0f172a]">
          <h4 className="text-xs font-black text-[#0f172a] dark:text-purple-200 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-purple-700" />
            <span>Tabel Kategori Penguasaan TKA Berdasarkan Standar IRT</span>
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bold">
            <thead className="bg-purple-600 text-white font-black border-b-2 border-[#0f172a]">
              <tr>
                <th className="py-2.5 px-3 border-r-2 border-[#0f172a]">Kategori</th>
                <th className="py-2.5 px-3 border-r-2 border-[#0f172a]">Rentang IRT</th>
                <th className="py-2.5 px-3 border-r-2 border-[#0f172a]">Rentang Skala 100</th>
                <th className="py-2.5 px-3">Deskripsi Penguasaan</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#0f172a]/15">
              <tr>
                <td className="py-2.5 px-3 font-black text-rose-700 border-r-2 border-[#0f172a]/15">Kurang</td>
                <td className="py-2.5 px-3 font-mono border-r-2 border-[#0f172a]/15">&lt; 500</td>
                <td className="py-2.5 px-3 font-mono border-r-2 border-[#0f172a]/15">0.00 – 49.83</td>
                <td className="py-2.5 px-3 text-gray-700 dark:text-purple-300">Perlu penguatan konsep dasar materi dan latihan intensif.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-black text-amber-700 border-r-2 border-[#0f172a]/15">Memadai</td>
                <td className="py-2.5 px-3 font-mono border-r-2 border-[#0f172a]/15">500 – 624</td>
                <td className="py-2.5 px-3 font-mono border-r-2 border-[#0f172a]/15">50.00 – 70.67</td>
                <td className="py-2.5 px-3 text-gray-700 dark:text-purple-300">Mencapai standar kompetensi minimal yang diharapkan.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-black text-emerald-700 border-r-2 border-[#0f172a]/15">Baik</td>
                <td className="py-2.5 px-3 font-mono border-r-2 border-[#0f172a]/15">625 – 724</td>
                <td className="py-2.5 px-3 font-mono border-r-2 border-[#0f172a]/15">70.83 – 87.33</td>
                <td className="py-2.5 px-3 text-gray-700 dark:text-purple-300">Penguasaan materi kuat, analitis, dan sangat kompetitif.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-black text-purple-700 border-r-2 border-[#0f172a]/15">Istimewa</td>
                <td className="py-2.5 px-3 font-mono border-r-2 border-[#0f172a]/15">≥ 725</td>
                <td className="py-2.5 px-3 font-mono border-r-2 border-[#0f172a]/15">87.50 – 100.00</td>
                <td className="py-2.5 px-3 text-gray-700 dark:text-purple-300">Penguasaan materi mendalam tingkat tinggi dan luar biasa.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
