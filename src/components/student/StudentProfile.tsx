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
      {/* Profil Header Card */}
      <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-purple-600/20">
          {siswa.nama_siswa.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            {siswa.nama_siswa}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-purple-300">
            <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
              NIS: {siswa.nis}
            </span>
            <span>•</span>
            <span>Username: @{siswa.username}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-bold text-[10px]">
              {siswa.pilihan_program}
            </span>
          </div>
        </div>
      </div>

      {/* Form Update Profil */}
      <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-6 space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2 border-b border-purple-50 dark:border-purple-950/40 pb-3">
          <User className="w-4 h-4 text-purple-600" />
          <span>Informasi Akademik & Sekolah</span>
        </h3>

        {profileMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              profileMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{profileMsg.message}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                Asal Sekolah
              </label>
              <input
                type="text"
                required
                value={asalSekolah}
                onChange={(e) => setAsalSekolah(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                Provinsi Sekolah (Wajib untuk Validasi SNBP)
              </label>
              <select
                value={provinsiSekolah}
                onChange={(e) => setProvinsiSekolah(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white"
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
              <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">Kelas</label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Contoh: 12 MIPA 1"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                Akreditasi Sekolah
              </label>
              <select
                value={akreditasi}
                onChange={(e) => setAkreditasi(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white"
              >
                <option value="A">A (Poin Maksimal)</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="Tidak Terakreditasi">Tidak Terakreditasi</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">Cabang</label>
              <select
                value={cabang}
                onChange={(e) => setCabang(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white"
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
              <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">No HP Siswa</label>
              <input
                type="tel"
                value={noHPSiswa}
                onChange={(e) => setNoHPSiswa(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">No HP Orang Tua</label>
              <input
                type="tel"
                value={noHPOrtu}
                onChange={(e) => setNoHPOrtu(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Form Ubah Password */}
      <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-6 space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2 border-b border-purple-50 dark:border-purple-950/40 pb-3">
          <Lock className="w-4 h-4 text-purple-600" />
          <span>Ganti Kata Sandi Akun</span>
        </h3>

        {passMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              passMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {passMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{passMsg.message}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
              Kata Sandi Saat Ini
            </label>
            <input
              type="password"
              required
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              placeholder="Masukkan password saat ini"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                Kata Sandi Baru (Min. 6 Karakter)
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Kata sandi baru"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-purple-200 mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPass}
              className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all"
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
