import React from 'react';
import { Lock, MessageCircle, LogOut } from 'lucide-react';
import { Siswa, AppSettings } from '../../types';

interface AccessExpiredOverlayProps {
  siswa: Siswa;
  settings: AppSettings;
  onLogout: () => void;
}

export const AccessExpiredOverlay: React.FC<AccessExpiredOverlayProps> = ({
  siswa,
  settings,
  onLogout,
}) => {
  const waUrl = `https://wa.me/${settings.WA_ADMIN}?text=Halo%20Admin%20AnalisaKu%202027,%20masa%20akses%20akun%20saya%20(NIS:%20${siswa.nis}%20-%20${encodeURIComponent(siswa.nama_siswa)})%20telah%20berakhir.%20Mohon%20info%20perpanjangan%20paket.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-md">
      <div className="max-w-md w-full bg-white dark:bg-[#160E2E] rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-purple-200 dark:border-purple-800">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          Masa Akses Berakhir
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-purple-200/80 leading-relaxed">
          Halo, <strong className="text-purple-700 dark:text-purple-300">{siswa.nama_siswa}</strong>! Paket akses simulasi dan rasionalisasi Anda ({siswa.akses}) telah berakhir pada{' '}
          {siswa.akses_akhir ? new Date(siswa.akses_akhir).toLocaleDateString('id-ID') : 'hari ini'}.
        </p>

        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 my-5 text-left border border-purple-100 dark:border-purple-900/50 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">NIS Siswa:</span>
            <span className="font-mono font-bold">{siswa.nis}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Program:</span>
            <span className="font-bold text-purple-700 dark:text-purple-300">{siswa.pilihan_program}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Cabang:</span>
            <span>{siswa.cabang}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hubungi Admin via WhatsApp</span>
          </a>

          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-300 dark:border-purple-800 text-gray-700 dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-purple-900/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};
