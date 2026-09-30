import React, { useState, useEffect } from 'react';
import { Siswa, AppSettings } from './types';
import { initDB, getSettings } from './services/api';
import { runCalculationUnitTests } from './lib/calc.test';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { StudentLayout } from './components/student/StudentLayout';
import { PortalOrtu } from './components/PortalOrtu';
import { AdminDashboard } from './components/AdminDashboard';

type AppView = 'landing' | 'student' | 'ortu' | 'admin';

export default function App() {
  const [initLoading, setInitLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(1);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Theme
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('analisaku_theme') === 'dark';
  });

  // Current view & state
  const [view, setView] = useState<AppView>('landing');
  const [activeAuthTab, setActiveAuthTab] = useState<'siswa' | 'ortu' | 'daftar' | 'admin' | null>(null);

  // Authenticated user state
  const [currentSiswa, setCurrentSiswa] = useState<Siswa | null>(null);

  // Initialize DB & Test Suite on startup
  useEffect(() => {
    const startup = async () => {
      // Step 1: ⚙️ Inisialisasi
      setLoadingStep(1);
      initDB();

      // Step 2: 🌐 Koneksi Server
      setTimeout(() => setLoadingStep(2), 250);

      // Step 3: 📦 Memuat Data
      setTimeout(async () => {
        setLoadingStep(3);
        const s = await getSettings();
        setSettings(s);

        // Run unit test suite
        const testRes = runCalculationUnitTests();
        console.log(`[AnalisaKu 2027 Test Suite] ${testRes.passed} passed, ${testRes.failed} failed.`);

        // Step 4: ✅ Siap Login
        setLoadingStep(4);
        setTimeout(() => {
          setInitLoading(false);
        }, 300);
      }, 500);
    };

    startup();
  }, []);

  // Sync dark mode class to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('analisaku_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('analisaku_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLoginSuccess = (user: { role: 'SISWA' | 'ORTU' | 'ADMIN'; siswa?: Siswa }) => {
    setActiveAuthTab(null);
    if (user.role === 'SISWA' && user.siswa) {
      setCurrentSiswa(user.siswa);
      setView('student');
    } else if (user.role === 'ORTU' && user.siswa) {
      setCurrentSiswa(user.siswa);
      setView('ortu');
    } else if (user.role === 'ADMIN') {
      setView('admin');
    }
  };

  const handleLogout = () => {
    setCurrentSiswa(null);
    setView('landing');
  };

  // 11. Initial Loading Screen
  if (initLoading) {
    const steps = [
      { num: 1, label: '⚙️ Inisialisasi' },
      { num: 2, label: '🌐 Koneksi Server' },
      { num: 3, label: '📦 Memuat Data' },
      { num: 4, label: '✅ Siap Login' },
    ];

    return (
      <div className="fixed inset-0 z-50 bg-[#FAF7FF] dark:bg-[#0D0920] flex flex-col justify-between p-6">
        {/* Top gradient loading bar (ungu -> kuning -> hijau -> pink) */}
        <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-purple-950">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-amber-400 via-emerald-400 to-pink-500 transition-all duration-300"
            style={{ width: `${(loadingStep / 4) * 100}%` }}
          />
        </div>

        {/* Center Logo & Steps */}
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-[#7C3AED] via-purple-600 to-[#F59E0B] mx-auto flex items-center justify-center text-4xl shadow-xl shadow-purple-600/30">
            🎓
          </div>

          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              AnalisaKu 2027
            </h1>
            <p className="text-xs text-gray-500 dark:text-purple-300 mt-1">
              Platform Rasionalisasi SNBP & SNBT Berbasis Data
            </p>
          </div>

          {/* 4 steps pills */}
          <div className="grid grid-cols-2 gap-2 text-left">
            {steps.map((st) => (
              <div
                key={st.num}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  loadingStep >= st.num
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200'
                    : 'border-gray-200 dark:border-purple-950 text-gray-400 opacity-50'
                }`}
              >
                {st.label}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-gray-400">
          @Copyright Pak Guru AI 2026 • AnalisaKu 2027
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 1. LANDING PAGE */}
      {view === 'landing' && settings && (
        <LandingPage
          settings={settings}
          onOpenLogin={(tab = 'siswa') => setActiveAuthTab(tab)}
        />
      )}

      {/* 2. AUTH MODAL */}
      {activeAuthTab && settings && (
        <AuthModal
          initialTab={activeAuthTab}
          settings={settings}
          onClose={() => setActiveAuthTab(null)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* 3. STUDENT PORTAL */}
      {view === 'student' && currentSiswa && settings && (
        <StudentLayout
          siswa={currentSiswa}
          settings={settings}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
        />
      )}

      {/* 4. PARENT PORTAL */}
      {view === 'ortu' && currentSiswa && settings && (
        <PortalOrtu
          siswa={currentSiswa}
          settings={settings}
          onLogout={handleLogout}
        />
      )}

      {/* 5. ADMIN DASHBOARD */}
      {view === 'admin' && settings && (
        <AdminDashboard
          settings={settings}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
          onSettingsUpdated={(newSettings) => setSettings(newSettings)}
        />
      )}
    </div>
  );
}
