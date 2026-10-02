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
      {/* Header Neo-Brutalism */}
      <div className="neo-card p-5 sm:p-6 bg-white dark:bg-[#181133] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 neo-badge px-3 py-1 bg-amber-300 text-[#0f172a] text-xs font-black mb-2">
            <Award className="w-3.5 h-3.5 text-[#0f172a]" />
            <span>PORTOPOLIO & PRESTASI SNBP</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white tracking-tight">
            Sertifikat &amp; Prestasi Kejuaraan
          </h2>
          <p className="text-xs font-bold text-gray-700 dark:text-purple-300 mt-1">
            Maksimal 3 sertifikat terbaik dari 3 kategori. Aturan poin SNBP: &ge;3 prestasi valid = <strong>20 poin</strong>, 1–2 prestasi = <strong>10 poin</strong>.
          </p>
        </div>

        <div className="neo-card-sm px-5 py-3.5 bg-purple-600 text-white flex items-center gap-3.5 shadow-[3px_3px_0px_#0f172a] self-start md:self-auto">
          <div className="text-3xl font-black font-mono">{totalValidSertif}</div>
          <div className="text-xs font-black leading-tight">
            Sertifikat Terverifikasi
            <span className="block text-[10px] text-amber-300 mt-0.5">
              Poin SNBP: {totalValidSertif >= 3 ? '20 Poin (Maksimal)' : totalValidSertif >= 1 ? '10 Poin' : '0 Poin'}
            </span>
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

      {/* 3 Categories Neo-Brutalism */}
      {categories.map((kat) => (
        <div
          key={kat}
          className="neo-card p-5 bg-purple-100 dark:bg-[#181133] space-y-4"
        >
          <div className="flex items-center justify-between border-b-2 border-[#0f172a]/20 pb-3">
            <h3 className="font-black text-sm text-[#0f172a] dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600 border border-[#0f172a]" />
              <span>{kat}</span>
            </h3>
            <span className="neo-badge px-2.5 py-0.5 bg-amber-300 text-[#0f172a] text-[10px] font-black">
              3 Slot Tersedia
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slots[kat].map((slot, idx) => (
              <div
                key={idx}
                className="neo-card-sm p-4 bg-white dark:bg-[#1E1540] space-y-2.5 shadow-[2.5px_2.5px_0px_#0f172a]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0f172a] dark:text-purple-200">
                    Slot #{idx + 1}
                  </span>
                  <span
                    className={`neo-badge px-2 py-0.5 text-[9px] font-black ${
                      slot.poin > 0
                        ? 'bg-emerald-300 text-[#0f172a]'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {slot.poin > 0 ? `${slot.poin.toFixed(2)} Poin` : '0 Poin'}
                  </span>
                </div>

                {/* Tingkat */}
                <div>
                  <label className="block text-[10px] font-black text-gray-600 dark:text-purple-300 uppercase">Tingkat Prestasi</label>
                  <select
                    value={slot.tingkat}
                    onChange={(e) => updateSlot(kat, idx, 'tingkat', e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs neo-select"
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
                      <label className="block text-[10px] font-black text-gray-600 dark:text-purple-300 uppercase">
                        Spesifikasi Juara / Jabatan
                      </label>
                      <select
                        value={slot.spesifikasi}
                        onChange={(e) => updateSlot(kat, idx, 'spesifikasi', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs neo-select"
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
                        <label className="block text-[10px] font-black text-gray-600 dark:text-purple-300 uppercase">Jenis</label>
                        <select
                          value={slot.jenis}
                          onChange={(e) => updateSlot(kat, idx, 'jenis', e.target.value)}
                          className="w-full mt-1 px-2 py-1.5 text-xs neo-select"
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
                        <label className="block text-[10px] font-black text-gray-600 dark:text-purple-300 uppercase">
                          Akreditasi
                        </label>
                        <select
                          value={slot.status_akred}
                          onChange={(e) => updateSlot(kat, idx, 'status_akred', e.target.value as any)}
                          className="w-full mt-1 px-2 py-1.5 text-xs neo-select"
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
          className="w-full sm:w-auto px-6 py-3 neo-btn bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-[3px_3px_0px_#0f172a] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : '💾 Simpan Data Sertifikat'}</span>
        </button>
      </div>
    </div>
  );
};
