import React, { useState, useEffect } from 'react';
import { X, Lock, Eye, AlertTriangle, BookOpen, ExternalLink, Shield } from 'lucide-react';
import { Modul, Siswa } from '../../types';
import { getModulSiswa, getModulUrl } from '../../services/api';

interface ModulViewerProps {
  siswa: Siswa;
}

export const ModulViewer: React.FC<ModulViewerProps> = ({ siswa }) => {
  const [modulList, setModulList] = useState<Modul[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');

  // Active viewing modal
  const [activeModul, setActiveModul] = useState<{ id: string; judul: string; embedUrl: string } | null>(null);
  const [isTabActive, setIsTabActive] = useState(true);

  useEffect(() => {
    loadModul();
  }, [siswa]);

  const loadModul = async () => {
    setLoading(true);
    try {
      const list = await getModulSiswa(siswa.nis);
      setModulList(list);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModul = async (modul: Modul) => {
    try {
      const res = await getModulUrl(modul.id, siswa.nis);
      setActiveModul({ id: modul.id, judul: res.judul, embedUrl: res.embed_url });
    } catch (e) {
      alert('Gagal memuat modul.');
    }
  };

  // Proteksi keyboard & visibility change saat viewer terbuka
  useEffect(() => {
    if (!activeModul) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Blok F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Blok Ctrl+P, Cmd+P, Ctrl+S, Cmd+S, Ctrl+U
      if ((e.ctrlKey || e.metaKey) && ['p', 's', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        alert('🚫 Perhatian: Pencetakan atau penyimpanan modul materi dilindungi hak cipta.');
        return false;
      }
      // Esc to close
      if (e.key === 'Escape') {
        setActiveModul(null);
      }
    };

    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeModul]);

  const categories = ['SEMUA', ...Array.from(new Set(modulList.map((m) => m.kategori).filter(Boolean)))];

  const filteredModuls = modulList.filter((m) => {
    if (selectedKategori !== 'SEMUA' && m.kategori !== selectedKategori) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.judul.toLowerCase().includes(q) || m.deskripsi.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Neo-Brutalism */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neo-card p-5 sm:p-6 bg-white dark:bg-[#181133] shadow-[4px_4px_0px_#0f172a]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span>Modul &amp; Bank Materi Belajar</span>
          </h2>
          <p className="text-xs font-bold text-slate-700 dark:text-purple-200 mt-1">
            Materi tersaring otomatis untuk kelas <strong className="text-purple-700 dark:text-purple-300">{siswa.kelas}</strong> dan program <strong className="text-purple-700 dark:text-purple-300">{siswa.pilihan_program}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Cari judul modul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2 text-xs neo-input bg-white dark:bg-[#160E2E] text-[#0f172a] dark:text-white font-bold"
          />
        </div>
      </div>

      {/* Kategori Filters Neo-Brutalism */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((kat) => (
          <button
            key={kat}
            onClick={() => setSelectedKategori(kat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border-2 border-[#0f172a] ${
              selectedKategori === kat
                ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#0f172a] -translate-y-0.5'
                : 'bg-white dark:bg-[#181133] text-[#0f172a] dark:text-purple-200 hover:bg-purple-100 shadow-[1px_1px_0px_#0f172a]'
            }`}
          >
            {kat}
          </button>
        ))}
      </div>

      {/* Modul Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs font-bold text-slate-700 dark:text-purple-300">Memuat katalog modul belajar...</div>
      ) : filteredModuls.length === 0 ? (
        <div className="text-center py-16 neo-card bg-white dark:bg-[#181133] p-8 shadow-[4px_4px_0px_#0f172a]">
          <BookOpen className="w-10 h-10 text-gray-400 dark:text-purple-400 mx-auto mb-2" />
          <p className="text-sm font-black text-[#0f172a] dark:text-white">Tidak ada modul yang cocok</p>
          <p className="text-xs font-bold text-slate-700 dark:text-purple-300 mt-1">Silakan pilih kategori lain atau periksa kembali kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModuls.map((modul) => (
            <div
              key={modul.id}
              className="neo-card p-0 bg-white dark:bg-[#181133] shadow-[4px_4px_0px_#0f172a] hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="neo-badge px-2.5 py-0.5 text-[10px] font-black uppercase bg-purple-200 text-[#0f172a]">
                    {modul.tipe_file}
                  </span>
                  <span className="text-[10px] font-black text-slate-700 dark:text-purple-300">
                    Target: {modul.kelas_target}
                  </span>
                </div>

                <h3 className="font-black text-sm text-[#0f172a] dark:text-white group-hover:text-purple-600 transition-colors line-clamp-2">
                  {modul.judul}
                </h3>

                <p className="mt-2 text-xs font-bold text-slate-700 dark:text-purple-200 line-clamp-3 leading-relaxed">
                  {modul.deskripsi}
                </p>
              </div>

              <div className="px-5 py-3.5 bg-purple-50 dark:bg-[#140c24] border-t-2 border-[#0f172a] flex items-center justify-between">
                <span className="text-[11px] font-black text-purple-900 dark:text-purple-300">
                  {modul.kategori}
                </span>

                <button
                  onClick={() => handleOpenModul(modul)}
                  className="neo-btn-sm px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-[2px_2px_0px_#0f172a] flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Buka Materi</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN PROTECTED VIEWER OVERLAY */}
      {activeModul && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col select-none"
          onContextMenu={(e) => {
            e.preventDefault();
            return false;
          }}
          onDragStart={(e) => {
            e.preventDefault();
            return false;
          }}
        >
          {/* Top Bar Viewer */}
          <div className="h-14 px-4 bg-gray-900/90 border-b border-gray-800 text-white flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-purple-700 flex items-center justify-center text-xs">
                <Shield className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold truncate max-w-[280px] sm:max-w-md">
                  {activeModul.judul}
                </h4>
                <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Mode Baca Terproteksi (ESC untuk keluar)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModul(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Viewer Area */}
          <div className="flex-1 relative w-full h-full overflow-hidden bg-gray-950 flex items-center justify-center">
            {/* Watermark diagonal repeated */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-15 rotate-[-25deg] select-none text-purple-200">
              <div className="text-center font-black text-xl sm:text-2xl tracking-widest uppercase">
                © AnalisaKu 2027 • {siswa.nama_siswa} ({siswa.nis}) • Dilarang Mendistribusikan
              </div>
            </div>

            {/* Iframe with sandbox and tab blur check */}
            {!isTabActive ? (
              <div className="text-center p-8 z-30 bg-black/80 rounded-2xl text-white">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <p className="font-bold text-sm">Pratinjau dijeda saat tab tidak aktif.</p>
                <p className="text-xs text-gray-400 mt-1">Kembali ke jendela ini untuk melanjutkan membaca.</p>
              </div>
            ) : (
              <iframe
                src={activeModul.embedUrl}
                title={activeModul.judul}
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
                className="w-full h-full border-0"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
