import React, { useState, useEffect } from 'react';
import { Save, Award, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Siswa, Prestasi } from '../../types';
import { getPrestasi, savePrestasi } from '../../services/api';
import { getPrestasiPoin } from '../../lib/calc';

interface SNBPPrestasiProps {
  siswa: Siswa;
  onRefreshData?: () => void;
}

type KategoriPrestasi = 'Kepengurusan Organisasi' | 'Olah Raga & Seni' | 'Olimpiade & Penelitian';

interface SlotState {
  tingkat: string;
  spesifikasi: string;
  jenis: string;
  status_akred: 'Terakreditasi' | 'Non Terakreditasi';
  poin: number;
}

export const SNBPPrestasi: React.FC<SNBPPrestasiProps> = ({ siswa, onRefreshData }) => {
  const categories: KategoriPrestasi[] = [
    'Olimpiade & Penelitian',
    'Olah Raga & Seni',
    'Kepengurusan Organisasi',
  ];

  // 3 categories x 3 slots
  const [slots, setSlots] = useState<Record<KategoriPrestasi, SlotState[]>>({
    'Olimpiade & Penelitian': [
      { tingkat: 'Tidak Ada', spesifikasi: 'Juara 1', jenis: 'Perorangan', status_akred: 'Terakreditasi', poin: 0 },
      { tingkat: 'Tidak Ada', spesifikasi: 'Juara 1', jenis: 'Perorangan', status_akred: 'Terakreditasi', poin: 0 },
      { tingkat: 'Tidak Ada', spesifikasi: 'Juara 1', jenis: 'Perorangan', status_akred: 'Terakreditasi', poin: 0 },
    ],
    'Olah Raga & Seni': [
      { tingkat: 'Tidak Ada', spesifikasi: 'Juara 1', jenis: 'Perorangan', status_akred: 'Terakreditasi', poin: 0 },
      { tingkat: 'Tidak Ada', spesifikasi: 'Juara 1', jenis: 'Perorangan', status_akred: 'Terakreditasi', poin: 0 },
      { tingkat: 'Tidak Ada', spesifikasi: 'Juara 1', jenis: 'Perorangan', status_akred: 'Terakreditasi', poin: 0 },
    ],
    'Kepengurusan Organisasi': [
      { tingkat: 'Tidak Ada', spesifikasi: 'Ketua', jenis: 'Tunggal', status_akred: 'Terakreditasi', poin: 0 },
      { tingkat: 'Tidak Ada', spesifikasi: 'Ketua', jenis: 'Tunggal', status_akred: 'Terakreditasi', poin: 0 },
      { tingkat: 'Tidak Ada', spesifikasi: 'Ketua', jenis: 'Tunggal', status_akred: 'Terakreditasi', poin: 0 },
    ],
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [siswa]);

  const loadData = async () => {
    const list = await getPrestasi(siswa.nis);
    if (list.length > 0) {
      setSlots((prev) => {
        const next = { ...prev };
        categories.forEach((kat) => {
          const matching = list.filter((p) => p.kategori === kat);
          matching.forEach((p, idx) => {
            if (idx < 3) {
              next[kat][idx] = {
                tingkat: p.tingkat || 'Tidak Ada',
                spesifikasi: p.spesifikasi,
                jenis: p.jenis,
                status_akred: p.status_akred,
                poin: getPrestasiPoin(kat, p.jenis, p.status_akred, p.tingkat, p.spesifikasi),
              };
            }
          });
        });
        return next;
      });
    }
  };

  const updateSlot = (
    kat: KategoriPrestasi,
    slotIndex: number,
    field: keyof SlotState,
    value: string
  ) => {
    setSlots((prev) => {
      const next = { ...prev };
      const current = { ...next[kat][slotIndex], [field]: value };
      current.poin = getPrestasiPoin(kat, current.jenis, current.status_akred, current.tingkat, current.spesifikasi);
      next[kat][slotIndex] = current;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const toSave: Prestasi[] = [];
      categories.forEach((kat) => {
        slots[kat].forEach((s, idx) => {
          if (s.tingkat !== 'Tidak Ada') {
            toSave.push({
              nis: siswa.nis,
              kategori: kat,
              slot: idx + 1,
              tingkat: s.tingkat,
              spesifikasi: s.spesifikasi,
              jenis: s.jenis,
              status_akred: s.status_akred,
              poin: s.poin,
              timestamp: new Date().toISOString(),
            });
          }
        });
      });

      await savePrestasi(siswa.nis, toSave);
      setFeedback({ type: 'success', message: `Data prestasi (${toSave.length} sertifikat) berhasil disimpan!` });
      if (onRefreshData) onRefreshData();
      setTimeout(() => setFeedback(null), 3800);
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menyimpan sertifikat prestasi.' });
    } finally {
      setSaving(false);
    }
  };

  // Hitung total sertifikat berpoin
  let totalValidSertif = 0;
  categories.forEach((k) => {
    slots[k].forEach((s) => {
      if (s.poin > 0) totalValidSertif++;
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#160E2E] p-5 rounded-2xl border border-purple-100 dark:border-purple-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Sertifikat & Prestasi SNBP</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-purple-300 mt-1">
            Maksimal 3 sertifikat terbaik dari 3 kategori. Aturan poin SNBP: &ge;3 prestasi valid = <strong>20 poin</strong>, 1–2 prestasi = <strong>10 poin</strong>.
          </p>
        </div>

        <div className="px-5 py-3 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-900 dark:text-purple-200 flex items-center gap-3">
          <div className="text-2xl font-black">{totalValidSertif}</div>
          <div className="text-[11px] font-semibold leading-tight">
            Sertifikat Berpoin Terverifikasi
            <span className="block text-[10px] text-purple-600 dark:text-purple-400">
              Poin SNBP: {totalValidSertif >= 3 ? '20 Poin (Maksimal)' : totalValidSertif >= 1 ? '10 Poin' : '0 Poin'}
            </span>
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

      {/* 3 Categories */}
      {categories.map((kat) => (
        <div
          key={kat}
          className="bg-white dark:bg-[#160E2E] rounded-2xl border border-purple-100 dark:border-purple-950/40 p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-purple-50 dark:border-purple-950/30 pb-3">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span>{kat}</span>
            </h3>
            <span className="text-[11px] text-gray-400">3 Slot Tersedia</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slots[kat].map((slot, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50/50 dark:bg-[#1E1540]/60 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 dark:text-purple-300">
                    Slot {idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      slot.poin > 0
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                    }`}
                  >
                    {slot.poin > 0 ? `${slot.poin.toFixed(2)} Poin` : '0 Poin'}
                  </span>
                </div>

                {/* Tingkat */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Tingkat</label>
                  <select
                    value={slot.tingkat}
                    onChange={(e) => updateSlot(kat, idx, 'tingkat', e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#160E2E] text-gray-900 dark:text-white"
                  >
                    <option value="Tidak Ada">- Tidak Ada (Kosong) -</option>
                    <option value="Internasional">Internasional</option>
                    <option value="Regional">Regional</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Kabupaten">Kabupaten / Kota</option>
                    {kat === 'Kepengurusan Organisasi' && <option value="Sekolah">Sekolah</option>}
                  </select>
                </div>

                {/* Spesifikasi */}
                {slot.tingkat !== 'Tidak Ada' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">
                        Spesifikasi
                      </label>
                      <select
                        value={slot.spesifikasi}
                        onChange={(e) => updateSlot(kat, idx, 'spesifikasi', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#160E2E] text-gray-900 dark:text-white"
                      >
                        {kat === 'Kepengurusan Organisasi' ? (
                          <>
                            <option value="Ketua">Ketua</option>
                            <option value="Wakil Ketua">Wakil Ketua</option>
                            <option value="Pengurus Primer">Pengurus Primer (Sekretaris/Bendahara)</option>
                            <option value="Pengurus Sekunder">Pengurus Sekunder / Koordinator</option>
                          </>
                        ) : (
                          <>
                            <option value="Juara 1">Juara 1 (Emas)</option>
                            <option value="Juara 2">Juara 2 (Perak)</option>
                            <option value="Juara 3">Juara 3 (Perunggu)</option>
                            <option value="Juara Harapan">Juara Harapan</option>
                            <option value="Honorable Mention">Honorable Mention</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Jenis</label>
                        <select
                          value={slot.jenis}
                          onChange={(e) => updateSlot(kat, idx, 'jenis', e.target.value)}
                          className="w-full mt-1 px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#160E2E] text-gray-900 dark:text-white"
                        >
                          {kat === 'Kepengurusan Organisasi' ? (
                            <>
                              <option value="Tunggal">Tunggal</option>
                              <option value="Kolektif">Kolektif</option>
                            </>
                          ) : (
                            <>
                              <option value="Perorangan">Perorangan</option>
                              <option value="Beregu">Beregu</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">
                          Akreditasi
                        </label>
                        <select
                          value={slot.status_akred}
                          onChange={(e) => updateSlot(kat, idx, 'status_akred', e.target.value as any)}
                          className="w-full mt-1 px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#160E2E] text-gray-900 dark:text-white"
                        >
                          <option value="Terakreditasi">Terakreditasi</option>
                          <option value="Non Terakreditasi">Non Terakreditasi</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Data Sertifikat'}</span>
        </button>
      </div>
    </div>
  );
};
