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
      <div className="p-4 rounded-2xl bg-white dark:bg-[#160E2E] border border-purple-100 dark:border-purple-950/40 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-800 dark:text-white">
              {isPilihan ? 'Mapel Pilihan' : title}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
              IRT 200–800
            </span>
          </div>

          {pilihanSelector}

          <div className="mt-2">
            <input
              type="number"
              min="200"
              max="800"
              value={val}
              onChange={(e) => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="0 (kosongkan bila tidak ikut)"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        {/* Live conversion under input */}
        <div className="mt-3 pt-3 border-t border-purple-50 dark:border-purple-950/30 text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Konversi Skala 100:</span>
            <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
              {num > 0 ? skala100.toFixed(2) : '-'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Kategori:</span>
            <span className={`font-bold ${kat.color}`}>{kat.label}</span>
          </div>

          {diffNas !== null && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">vs Rata Nasional ({rataNas}):</span>
              <span
                className={`font-semibold ${
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
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#160E2E] p-5 rounded-2xl border border-purple-100 dark:border-purple-950/40">
        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          <span>Input Nilai Tes Kemampuan Akademik (TKA)</span>
        </h2>
        <p className="text-xs text-gray-500 dark:text-purple-300 mt-1">
          Nilai diinput dalam skala <strong>IRT (200 – 800)</strong>. TKA digunakan untuk memvalidasi kewajaran nilai rapor dan menambah bobot peluang SNBP Anda.
        </p>
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

      {/* 3 Mapel Wajib Grid */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 dark:text-purple-200 mb-2 uppercase tracking-wider">
          3 Mapel Wajib
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInputCard('Bahasa Indonesia', tkaIndo, setTkaIndo, 'Bahasa Indonesia')}
          {renderInputCard('Bahasa Inggris', tkaIng, setTkaIng, 'Bahasa Inggris')}
          {renderInputCard('Matematika', tkaMat, setTkaMat, 'Matematika')}
        </div>
      </div>

      {/* 2 Mapel Pilihan Grid */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 dark:text-purple-200 mb-2 uppercase tracking-wider">
          2 Mapel Pilihan (Sesuai Prodi Incarnan)
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
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white font-semibold"
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
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white font-semibold"
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
          className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Nilai TKA'}</span>
        </button>
      </div>

      {/* Reference Table of Categories */}
      <div className="bg-white dark:bg-[#160E2E] p-5 rounded-2xl border border-purple-100 dark:border-purple-950/40">
        <h4 className="text-xs font-bold text-gray-800 dark:text-purple-200 mb-3 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-purple-600" />
          <span>Tabel Kategori Penguasaan TKA Berdasarkan Standar IRT</span>
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-purple-50 dark:bg-purple-950/50 text-gray-700 dark:text-purple-200">
              <tr>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Rentang IRT</th>
                <th className="py-2.5 px-3">Rentang Skala 100</th>
                <th className="py-2.5 px-3">Deskripsi Penguasaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 dark:divide-purple-950/30">
              <tr>
                <td className="py-2 px-3 font-bold text-rose-600">Kurang</td>
                <td className="py-2 px-3 font-mono">&lt; 500</td>
                <td className="py-2 px-3 font-mono">0.00 – 49.83</td>
                <td className="py-2 px-3 text-gray-500">Perlu penguatan konsep dasar materi dan latihan intensif.</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-amber-600">Memadai</td>
                <td className="py-2 px-3 font-mono">500 – 624</td>
                <td className="py-2 px-3 font-mono">50.00 – 70.67</td>
                <td className="py-2 px-3 text-gray-500">Mencapai standar kompetensi minimal yang diharapkan.</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-emerald-600">Baik</td>
                <td className="py-2 px-3 font-mono">625 – 724</td>
                <td className="py-2 px-3 font-mono">70.83 – 87.33</td>
                <td className="py-2 px-3 text-gray-500">Penguasaan materi kuat, analitis, dan sangat kompetitif.</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-purple-600">Istimewa</td>
                <td className="py-2 px-3 font-mono">≥ 725</td>
                <td className="py-2 px-3 font-mono">87.50 – 100.00</td>
                <td className="py-2 px-3 text-gray-500">Penguasaan materi mendalam tingkat tinggi dan luar biasa.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
