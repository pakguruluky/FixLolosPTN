import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  KeyRound,
  User,
  Users,
  Lock,
  Phone,
  Building2,
  MapPin,
  Flame,
} from 'lucide-react';
import { Siswa, AppSettings, ProgramType } from '../types';
import {
  loginSiswa,
  loginOrtu,
  loginAdmin,
  daftarSiswa,
  getProvinsiList,
  getCabangList,
} from '../services/api';

interface AuthModalProps {
  initialTab?: 'siswa' | 'ortu' | 'daftar' | 'admin';
  settings: AppSettings;
  onClose: () => void;
  onLoginSuccess: (user: { role: 'SISWA' | 'ORTU' | 'ADMIN'; siswa?: Siswa }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialTab = 'siswa',
  settings,
  onClose,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'siswa' | 'ortu' | 'daftar' | 'admin'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [provinsiList, setProvinsiList] = useState<string[]>([]);
  const [cabangList, setCabangList] = useState<string[]>([]);

  // Form states - Siswa
  const [siswaId, setSiswaId] = useState('');
  const [siswaPass, setSiswaPass] = useState('');

  // Form states - Ortu
  const [ortuNis, setOrtuNis] = useState('');
  const [ortuPass, setOrtuPass] = useState('');

  // Form states - Admin
  const [adminPass, setAdminPass] = useState('');

  // Form states - Register Stepper (1..3)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [regNamaSiswa, setRegNamaSiswa] = useState('');
  const [regNamaOrtu, setRegNamaOrtu] = useState('');
  const [regHPSiswa, setRegHPSiswa] = useState('');
  const [regHPOrtu, setRegHPOrtu] = useState('');
  const [regSekolah, setRegSekolah] = useState('');
  const [regProvinsi, setRegProvinsi] = useState('DKI Jakarta');
  const [regKelas, setRegKelas] = useState('12');
  const [regCabang, setRegCabang] = useState('PETUKANGAN');

  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [regToken, setRegToken] = useState('');

  const [regProgramSNBP, setRegProgramSNBP] = useState(true);
  const [regProgramSNBT, setRegProgramSNBT] = useState(true);

  // Success register modal info
  const [regSuccessInfo, setRegSuccessInfo] = useState<{
    nis: string;
    isDirectActive: boolean;
  } | null>(null);

  useEffect(() => {
    getProvinsiList().then(setProvinsiList);
    getCabangList().then((list) => setCabangList(list.map((c) => c.nama_cabang)));
  }, []);

  // Password strength checker (4 bars)
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    let label = 'Lemah';
    let color = 'bg-rose-500';
    if (score === 2) {
      label = 'Lumayan';
      color = 'bg-amber-500';
    } else if (score === 3) {
      label = 'Kuat';
      color = 'bg-emerald-500';
    } else if (score === 4) {
      label = 'Super Kuat';
      color = 'bg-purple-600';
    }
    return { score, label, color };
  };

  const passStrength = calculatePasswordStrength(regPassword);

  // Handlers
  const handleLoginSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!siswaId.trim() || !siswaPass.trim()) {
      setErrorMessage('NIS/Username dan Password wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginSiswa(siswaId, siswaPass);
      if (res.success && res.siswa) {
        onLoginSuccess({ role: 'SISWA', siswa: res.siswa });
      } else {
        setErrorMessage(res.message || 'Login gagal.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOrtu = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!ortuNis.trim() || !ortuPass.trim()) {
      setErrorMessage('NIS Siswa dan Password Orang Tua wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginOrtu(ortuNis, ortuPass);
      if (res.success && res.siswa) {
        onLoginSuccess({ role: 'ORTU', siswa: res.siswa });
      } else {
        setErrorMessage(res.message || 'Login orang tua gagal.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!adminPass.trim()) {
      setErrorMessage('Password administrator wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginAdmin(adminPass);
      if (res.success) {
        onLoginSuccess({ role: 'ADMIN' });
      } else {
        setErrorMessage(res.message || 'Password admin salah.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    setErrorMessage('');
    if (!regProgramSNBP && !regProgramSNBT) {
      setErrorMessage('Pilih minimal satu program (SNBP atau SNBT).');
      return;
    }

    let program: ProgramType = 'SNBP+SNBT';
    if (regProgramSNBP && !regProgramSNBT) program = 'SNBP';
    if (!regProgramSNBP && regProgramSNBT) program = 'SNBT';

    setLoading(true);
    try {
      const res = await daftarSiswa({
        nama_siswa: regNamaSiswa,
        nama_ortu: regNamaOrtu,
        no_hp_siswa: regHPSiswa,
        no_hp_ortu: regHPOrtu,
        asal_sekolah: regSekolah,
        provinsi_sekolah: regProvinsi,
        kelas: regKelas,
        cabang: regCabang,
        username: regUsername,
        password: regPassword,
        token_daftar: regToken.trim() || undefined,
        pilihan_program: program,
      });

      if (res.success && res.nis) {
        setRegSuccessInfo({
          nis: res.nis,
          isDirectActive: !!res.isDirectActive,
        });
      } else {
        setErrorMessage(res.message || 'Pendaftaran gagal.');
      }
    } catch (e) {
      setErrorMessage(`Terjadi galat: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-900/60 shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-700 via-[#7C3AED] to-purple-800 text-white relative">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs text-purple-200 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Beranda</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
                <span>Yuk, Gaspol Persiapan PTN-mu!</span>
                <Flame className="w-5 h-5 text-amber-300" />
              </h2>
              <p className="text-xs text-purple-200 mt-1">Platform Rasionalisasi SNBP & SNBT 2027</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl">
              🎓
            </div>
          </div>

          {/* Friendly Greeting Badges */}
          <div className="flex flex-wrap gap-2 mt-4 text-[10px] font-bold">
            <span className="px-2.5 py-1 rounded-full bg-white/15 text-white backdrop-blur-sm">
              🔥 Halo, Pejuang PTN!
            </span>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/40 text-purple-100">
              SNBP Rapor
            </span>
            <span className="px-2.5 py-1 rounded-full bg-red-500/40 text-red-100">
              SNBT 60:40
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/40 text-amber-100">
              Analisa Real-Time
            </span>
          </div>
        </div>

        {/* 4 Tabs */}
        <div className="grid grid-cols-4 bg-purple-50/80 dark:bg-[#120B27] border-b border-purple-100 dark:border-purple-950/40 text-xs font-bold">
          {[
            { id: 'siswa', label: '👨‍🎓 Siswa' },
            { id: 'ortu', label: '👨‍👩‍👧 Ortu' },
            { id: 'daftar', label: '📝 Daftar' },
            { id: 'admin', label: '🔐 Admin' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setErrorMessage('');
              }}
              className={`py-3 text-center transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#160E2E] text-purple-700 dark:text-purple-300 border-b-2 border-[#7C3AED] shadow-sm'
                  : 'text-gray-500 dark:text-purple-300/60 hover:text-purple-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: SISWA */}
          {activeTab === 'siswa' && (
            <form onSubmit={handleLoginSiswa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1.5">
                  NIS atau Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={siswaId}
                    onChange={(e) => setSiswaId(e.target.value)}
                    placeholder="Masukkan NIS atau Username"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-purple-200">
                    Kata Sandi
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={siswaPass}
                    onChange={(e) => setSiswaPass(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/30 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Memverifikasi...' : 'Masuk sebagai Siswa'}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-gray-500 dark:text-purple-300">Belum punya akun? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('daftar');
                    setErrorMessage('');
                  }}
                  className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline"
                >
                  Daftar Sekarang
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ORANG TUA */}
          {activeTab === 'ortu' && (
            <form onSubmit={handleLoginOrtu} className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 text-xs">
                Portal pantau orang tua. Gunakan NIS anak dan kata sandi yang telah didaftarkan (4 digit terakhir nomor HP orang tua).
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1.5">
                  NIS Anak
                </label>
                <input
                  type="text"
                  required
                  value={ortuNis}
                  onChange={(e) => setOrtuNis(e.target.value)}
                  placeholder="Masukkan NIS Anak"
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1.5">
                  Password Orang Tua (4 Digit Terakhir No HP)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={ortuPass}
                    onChange={(e) => setOrtuPass(e.target.value)}
                    placeholder="Masukkan password orang tua"
                    className="w-full px-3 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold text-sm shadow-md hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Memeriksa...' : 'Buka Portal Orang Tua'}
              </button>
            </form>
          )}

          {/* TAB 3: DAFTAR (STEPPER 1..3) */}
          {activeTab === 'daftar' && (
            <div>
              {regSuccessInfo ? (
                <div className="text-center p-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                    Pendaftaran Berhasil!
                  </h3>
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-left space-y-2 border border-purple-100 dark:border-purple-900">
                    <div className="text-xs text-gray-500 dark:text-purple-300">
                      Nomor Induk Siswa (NIS) Anda:
                    </div>
                    <div className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono tracking-wider">
                      {regSuccessInfo.nis}
                    </div>
                    <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                      ⚠️ Harap catat dan simpan NIS ini dengan aman! NIS digunakan untuk login siswa dan orang tua.
                    </div>
                  </div>

                  {regSuccessInfo.isDirectActive ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      Akun Anda langsung aktif (Paket Trial 1 Hari melalui token). Silakan login sekarang!
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      Akun Anda sedang menunggu verifikasi oleh Administrator bimbingan belajar/sekolah. Anda akan dapat masuk setelah disetujui.
                    </p>
                  )}

                  <button
                    onClick={() => {
                      setRegSuccessInfo(null);
                      setActiveTab('siswa');
                      setSiswaId(regSuccessInfo.nis);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#7C3AED] text-white font-bold text-sm shadow-md"
                  >
                    Lanjut ke Halaman Login
                  </button>
                </div>
              ) : (
                <div>
                  {/* Stepper Header */}
                  <div className="flex items-center justify-between mb-5 px-2">
                    {[
                      { s: 1, label: 'Data Diri' },
                      { s: 2, label: 'Akun' },
                      { s: 3, label: 'Program' },
                    ].map((st) => (
                      <div key={st.s} className="flex items-center gap-1.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            step === st.s
                              ? 'bg-purple-700 text-white'
                              : step > st.s
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-200 dark:bg-purple-900 text-gray-600 dark:text-purple-300'
                          }`}
                        >
                          {step > st.s ? '✓' : st.s}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-700 dark:text-purple-200 hidden sm:inline">
                          {st.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* STEP 1: DATA DIRI */}
                  {step === 1 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                          Nama Siswa *
                        </label>
                        <input
                          type="text"
                          required
                          value={regNamaSiswa}
                          onChange={(e) => setRegNamaSiswa(e.target.value)}
                          placeholder="Nama lengkap siswa"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                          Nama Orang Tua *
                        </label>
                        <input
                          type="text"
                          required
                          value={regNamaOrtu}
                          onChange={(e) => setRegNamaOrtu(e.target.value)}
                          placeholder="Nama orang tua / wali"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                            No HP Siswa *
                          </label>
                          <input
                            type="tel"
                            required
                            value={regHPSiswa}
                            onChange={(e) => setRegHPSiswa(e.target.value)}
                            placeholder="08123456789"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                            No HP Orang Tua *
                          </label>
                          <input
                            type="tel"
                            required
                            value={regHPOrtu}
                            onChange={(e) => setRegHPOrtu(e.target.value)}
                            placeholder="08198765432"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                          Asal Sekolah *
                        </label>
                        <input
                          type="text"
                          required
                          value={regSekolah}
                          onChange={(e) => setRegSekolah(e.target.value)}
                          placeholder="Contoh: SMAN 28 Jakarta"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                            Provinsi Sekolah *
                          </label>
                          <select
                            value={regProvinsi}
                            onChange={(e) => setRegProvinsi(e.target.value)}
                            className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white"
                          >
                            {provinsiList.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                            Kelas (Opsional)
                          </label>
                          <input
                            type="text"
                            value={regKelas}
                            onChange={(e) => setRegKelas(e.target.value)}
                            placeholder="12 MIPA 1"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                          Cabang Belajar
                        </label>
                        <select
                          value={regCabang}
                          onChange={(e) => setRegCabang(e.target.value)}
                          className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white"
                        >
                          {cabangList.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!regNamaSiswa || !regNamaOrtu || !regHPSiswa || !regHPOrtu || !regSekolah) {
                            setErrorMessage('Harap isi semua kolom wajib pada Langkah 1.');
                            return;
                          }
                          setErrorMessage('');
                          setStep(2);
                        }}
                        className="w-full mt-3 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs"
                      >
                        Lanjut ke Pengaturan Akun &rarr;
                      </button>
                    </div>
                  )}

                  {/* STEP 2: AKUN */}
                  {step === 2 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                          Username (Huruf kecil, tanpa spasi, unik) *
                        </label>
                        <input
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          placeholder="contoh: hilmansyarif"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                          Password (Min. 6 Karakter) *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Password rahasia"
                            className="w-full px-3 pr-10 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-400"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Indikator Kekuatan Password (4 Batang) */}
                        <div className="mt-2">
                          <div className="flex gap-1.5 h-1.5 w-full">
                            {[1, 2, 3, 4].map((bar) => (
                              <div
                                key={bar}
                                className={`flex-1 rounded-full ${
                                  passStrength.score >= bar ? passStrength.color : 'bg-gray-200 dark:bg-purple-950'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                            <span>Kekuatan: {passStrength.label}</span>
                            <span>Min. 6 Karakter</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200 mb-1">
                          Konfirmasi Password *
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPass}
                          onChange={(e) => setRegConfirmPass(e.target.value)}
                          placeholder="Ulangi password"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-purple-200">
                            Token Pendaftaran {settings.TOKEN_REQUIRED === 'YA' ? '*' : '(Opsional)'}
                          </label>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400">
                            Format: XXXX-XXXX-XXXX
                          </span>
                        </div>
                        <input
                          type="text"
                          value={regToken}
                          onChange={(e) => setRegToken(e.target.value.toUpperCase())}
                          placeholder="Contoh: A7B2-9F4K-M3P8"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white font-mono"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                          Jika memiliki token dari bimbel, akun langsung aktif otomatis selama 24 jam.
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="w-1/3 py-2 rounded-xl border border-gray-300 dark:border-purple-800 text-xs font-bold"
                        >
                          &larr; Kembali
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!regUsername || regUsername.length < 3) {
                              setErrorMessage('Username minimal 3 karakter tanpa spasi.');
                              return;
                            }
                            if (regPassword.length < 6) {
                              setErrorMessage('Password minimal 6 karakter.');
                              return;
                            }
                            if (regPassword !== regConfirmPass) {
                              setErrorMessage('Konfirmasi password tidak cocok.');
                              return;
                            }
                            if (settings.TOKEN_REQUIRED === 'YA' && !regToken.trim()) {
                              setErrorMessage('Token pendaftaran wajib diisi.');
                              return;
                            }
                            setErrorMessage('');
                            setStep(3);
                          }}
                          className="w-2/3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs"
                        >
                          Lanjut ke Pilihan Program &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PROGRAM */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <p className="text-xs text-gray-600 dark:text-purple-200">
                        Pilih program simulasi yang ingin Anda ikuti (dapat memilih keduanya):
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setRegProgramSNBP(!regProgramSNBP)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            regProgramSNBP
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 shadow-md'
                              : 'border-gray-200 dark:border-purple-900 opacity-60'
                          }`}
                        >
                          <div className="text-xl mb-1">📘</div>
                          <div className="font-extrabold text-xs text-purple-900 dark:text-purple-200">
                            SNBP (Jalur Rapor)
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1">
                            Rasionalisasi rapor 5 semester, TKA IRT, dan sertifikat prestasi.
                          </div>
                          <div className="mt-2 text-right">
                            <input
                              type="checkbox"
                              checked={regProgramSNBP}
                              onChange={() => {}}
                              className="accent-purple-600"
                            />
                          </div>
                        </div>

                        <div
                          onClick={() => setRegProgramSNBT(!regProgramSNBT)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            regProgramSNBT
                              ? 'border-red-600 bg-red-50 dark:bg-red-950/60 shadow-md'
                              : 'border-gray-200 dark:border-purple-900 opacity-60'
                          }`}
                        >
                          <div className="text-xl mb-1">🎯</div>
                          <div className="font-extrabold text-xs text-red-900 dark:text-red-200">
                            SNBT (Jalur Tes)
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1">
                            Formula 60:40, 9 Try Out, dan radar subtes vs target NAM.
                          </div>
                          <div className="mt-2 text-right">
                            <input
                              type="checkbox"
                              checked={regProgramSNBT}
                              onChange={() => {}}
                              className="accent-red-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                        💡 Catatan: Password default Orang Tua akan otomatis dibuat dari 4 digit terakhir nomor HP orang tua.
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="w-1/3 py-2.5 rounded-xl border border-gray-300 dark:border-purple-800 text-xs font-bold"
                        >
                          &larr; Kembali
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={handleRegisterSubmit}
                          className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-purple-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                        >
                          {loading ? 'Mendaftarkan...' : 'Kirim Pendaftaran'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADMIN */}
          {activeTab === 'admin' && (
            <form onSubmit={handleLoginAdmin} className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 text-xs flex items-center gap-2">
                <KeyRound className="w-4 h-4 flex-shrink-0" />
                <span>Area khusus instruktur dan administrator bimbingan belajar.</span>
              </div>

              <div>
                <div className="mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-purple-200">
                    Kata Sandi Admin
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="Masukkan kata sandi admin"
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-purple-900 bg-white dark:bg-[#1E1540] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-800 to-gray-900 text-white font-bold text-sm shadow-md hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Memverifikasi...' : 'Masuk Dashboard Admin'}
              </button>
            </form>
          )}

          {/* Footer help link */}
          <div className="mt-5 pt-3 border-t border-purple-100 dark:border-purple-950/40 text-center">
            <a
              href={`https://wa.me/${settings.WA_ADMIN}?text=Halo%20Admin%20AnalisaKu%202027,%20saya%20butuh%20bantuan%20login/pendaftaran.`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline inline-flex items-center gap-1.5"
            >
              <span>Butuh Bantuan? Hubungi Admin via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
