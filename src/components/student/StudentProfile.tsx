import React, { useState, useEffect } from 'react';
import { User, Lock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Siswa, AkreditasiSekolah } from '../../types';
import { updateDataSiswa, changePassword, getProvinsiList, getCabangList } from '../../services/api';

interface StudentProfileProps {
  siswa: Siswa;
  onProfileUpdated: (updated: Siswa) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ siswa, onProfileUpdated }) => {
  // Profile editable fields
  const [kelas, setKelas] = useState(siswa.kelas || '');
  const [asalSekolah, setAsalSekolah] = useState(siswa.asal_sekolah || '');
  const [provinsiSekolah, setProvinsiSekolah] = useState(siswa.provinsi_sekolah || 'DKI Jakarta');
  const [cabang, setCabang] = useState(siswa.cabang || 'PETUKANGAN');
  const [akreditasi, setAkreditasi] = useState<AkreditasiSekolah>(siswa.akreditasi || 'A');
  const [noHPSiswa, setNoHPSiswa] = useState(siswa.no_hp_siswa || '');
  const [noHPOrtu, setNoHPOrtu] = useState(siswa.no_hp_ortu || '');

  // Password fields
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [provinsiList, setProvinsiList] = useState<string[]>([]);
  const [cabangList, setCabangList] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    getProvinsiList().then(setProvinsiList);
    getCabangList().then((list) => setCabangList(list.map((c) => c.nama_cabang)));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const update = {
        kelas: kelas.trim(),
        asal_sekolah: asalSekolah.trim(),
        provinsi_sekolah: provinsiSekolah,
        cabang,
        akreditasi,
        no_hp_siswa: noHPSiswa.trim(),
        no_hp_ortu: noHPOrtu.trim(),
      };
      await updateDataSiswa(siswa.nis, update);
      onProfileUpdated({ ...siswa, ...update });
      setProfileMsg({ type: 'success', message: 'Profil siswa berhasil diperbarui!' });
      setTimeout(() => setProfileMsg(null), 3800);
    } catch {
      setProfileMsg({ type: 'error', message: 'Gagal memperbarui profil.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPass(true);
    setPassMsg(null);

    if (newPass.length < 6) {
      setPassMsg({ type: 'error', message: 'Password baru minimal 6 karakter.' });
      setSavingPass(false);
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', message: 'Konfirmasi password baru tidak cocok.' });
      setSavingPass(false);
      return;
    }

    try {
      const res = await changePassword(siswa.nis, oldPass, newPass);
      if (res.success) {
        setPassMsg({ type: 'success', message: 'Kata sandi berhasil diubah!' });
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
        setTimeout(() => setPassMsg(null), 3800);
      } else {
        setPassMsg({ type: 'error', message: res.message || 'Gagal mengubah kata sandi.' });
      }
    } catch {
      setPassMsg({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profil Header Card Neo-Brutalism */}
      <div className="neo-card p-6 bg-white dark:bg-[#181133] flex items-center gap-5 shadow-[4px_4px_0px_#0f172a]">
        <div className="w-16 h-16 rounded-2xl bg-amber-300 border-3 border-[#0f172a] shadow-[2.5px_2.5px_0px_#0f172a] text-[#0f172a] font-black text-2xl flex items-center justify-center">
          {siswa.nama_siswa ? siswa.nama_siswa.charAt(0) : '👧🏻'}
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white">
            {siswa.nama_siswa}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
            <span className="font-mono font-black text-purple-700 dark:text-purple-300">
              NIS: {siswa.nis}
            </span>
            <span className="text-[#0f172a] dark:text-purple-300">•</span>
            <span className="font-bold text-slate-700 dark:text-purple-200">Username: @{siswa.username}</span>
            <span className="text-[#0f172a] dark:text-purple-300">•</span>
            <span className="neo-badge px-2 py-0.5 bg-purple-200 text-[#0f172a] font-black text-[10px]">
              {siswa.pilihan_program}
            </span>
          </div>
        </div>
      </div>

      {/* Form Update Profil Neo-Brutalism */}
      <div className="neo-card p-6 bg-purple-50/60 dark:bg-[#181133] space-y-4 shadow-[4px_4px_0px_#0f172a]">
        <h3 className="font-black text-sm text-[#0f172a] dark:text-white flex items-center gap-2 border-b-2 border-[#0f172a]/20 pb-3">
          <User className="w-4 h-4 text-purple-600" />
          <span>Informasi Akademik &amp; Sekolah</span>
        </h3>

        {profileMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-black border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] flex items-center gap-2 ${
              profileMsg.type === 'success'
                ? 'bg-emerald-200 text-[#0f172a]'
                : 'bg-rose-200 text-[#0f172a]'
            }`}
          >
            {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-800" /> : <AlertCircle className="w-4 h-4 text-rose-800" />}
            <span>{profileMsg.message}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black text-[#0f172a] dark:text-purple-200 mb-1">
                Asal Sekolah
              </label>
              <input
                type="text"
                required
                value={asalSekolah}
                onChange={(e) => setAsalSekolah(e.target.value)}
                className="w-full px-3 py-2 neo-input bg-white dark:bg-[#160E2E] text-[#0f172a] dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-black text-[#0f172a] dark:text-purple-200 mb-1">
                Provinsi Sekolah (Wajib untuk Validasi SNBP)
              </label>
              <select
                value={provinsiSekolah}
                onChange={(e) => setProvinsiSekolah(e.target.value)}
                className="w-full px-3 py-2 neo-select bg-white dark:bg-[#160E2E] text-[#0f172a] dark:text-white font-bold"
              >
                {provinsiList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-black text-[#0f172a] dark:text-purple-200 mb-1">Kelas</label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Contoh: 12 MIPA 1"
                className="w-full px-3 py-2 neo-input bg-white dark:bg-[#160E2E] text-[#0f172a] dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-black text-[#0f172a] dark:text-purple-200 mb-1">
                Akreditasi Sekolah
              </label>
              <select
                value={akreditasi}
                onChange={(e) => setAkreditasi(e.target.value as any)}
                className="w-full px-3 py-2 neo-select bg-white dark:bg-[#160E2E] text-[#0f172a] dark:text-white font-bold"
              >
                <option value="A">A (Poin Maksimal)</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="Tidak Terakreditasi">Tidak Terakreditasi</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-[#0f172a] dark:text-purple-200 mb-1">Cabang</label>
              <select
                value={cabang}
                onChange={(e) => setCabang(e.target.value)}
                className="w-full px-3 py-2 neo-select bg-white dark:bg-[#160E2E] text-[#0f172a] dark:text-white font-bold"
              >
                {cabangList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black text-[#0f172a] dark:text-purple-200 mb-1">No HP Siswa</label>
              <input
                type="tel"
                value={noHPSiswa}
                onChange={(e) => setNoHPSiswa(e.target.value)}
                className="w-full px-3 py-2 neo-input bg-white dark:bg-[#160E2E] text-[#0f172a] dark:text-white font-bold font-mono"
              />
            </div>
            <div>
              <label className="block font-black text-[#0f172a] dark:text-purple-200 mb-1">No HP Orang Tua</label>
              <input
                type="tel"
                value={noHPOrtu}
                onChange={(e) => setNoHPOrtu(e.target.value)}
                className="w-full px-3 py-2 neo-input bg-white dark:bg-[#160E2E] text-[#0f172a] dark:text-white font-bold font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="neo-btn px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-[3px_3px_0px_#0f172a] flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Form Ubah Password Neo-Brutalism */}
      <div className="neo-card p-6 bg-white dark:bg-[#181133] space-y-4 shadow-[4px_4px_0px_#0f172a]">
        <h3 className="font-black text-sm text-[#0f172a] dark:text-white flex items-center gap-2 border-b-2 border-[#0f172a]/20 pb-3">
          <Lock className="w-4 h-4 text-purple-600" />
          <span>Ganti Kata Sandi Akun</span>
        </h3>

        {passMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-black border-2 border-[#0f172a] shadow-[2px_2px_0px_#0f172a] flex items-center gap-2 ${
              passMsg.type === 'success'
                ? 'bg-emerald-200 text-[#0f172a]'
                : 'bg-rose-200 text-[#0f172a]'
            }`}
          >
            {passMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-800" /> : <AlertCircle className="w-4 h-4 text-rose-800" />}
            <span>{passMsg.message}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-black text-[#0f172a] dark:text-purple-200 mb-1">
              Kata Sandi Saat Ini
            </label>
            <input
              type="password"
              required
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              placeholder="Masukkan password saat ini"
              className="w-full px-3 py-2 neo-input bg-white dark:bg-[#160E2E] text-[#0f172a] dark:text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black text-[#0f172a] dark:text-purple-200 mb-1">
                Kata Sandi Baru (Min. 6 Karakter)
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Kata sandi baru"
                className="w-full px-3 py-2 neo-input bg-white dark:bg-[#160E2E] text-[#0f172a] dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="block font-black text-[#0f172a] dark:text-purple-200 mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full px-3 py-2 neo-input bg-white dark:bg-[#160E2E] text-[#0f172a] dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPass}
              className="neo-btn px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-[3px_3px_0px_#0f172a] flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>{savingPass ? 'Memproses...' : 'Ubah Kata Sandi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
