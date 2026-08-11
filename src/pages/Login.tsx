import { useState } from 'react';
import { toast } from 'sonner'
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, BookOpen, PenSquare, BarChart3, Calendar, Info, X, FileDown, Camera, } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeAboutTab, setActiveAboutTab] = useState('about');

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      console.error('Supabase error:', error);
      toast.error('Email atau password salah!');
      return;
    }

    if (data?.user) {
      try {
        await supabase
          .from('activity_logs')
          .insert({
            user_id: data.user.id,
            action: 'login',
            details: { email: data.user.email }
          });
        console.log('Activity log tercatat!');
      } catch (logError) {
        console.warn('Gagal mencatat aktivitas:', logError);
        // Abaikan error, login tetap berhasil
      }

      toast.success('Login berhasil!');
      navigate('/');
    } else {
      toast.error('Email atau password salah!');
    }
  } catch (err) {
    console.error('Login error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="w-full  items-center justify-items-center">
        {/* ===== Form Login ===== */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100 dark:border-slate-700 relative">
            {/* Tombol Tentang Aplikasi */}
            <button
              onClick={() => setIsAboutOpen(true)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              aria-label="Tentang Aplikasi"
            >
              <Info className="w-5 h-5" />
            </button>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25 mb-4">
                <img src="/logo.png" alt="Journal App" className="w-10 h-10" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t('auth.welcome')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('auth.loginDesc')}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/25"
              >
                <LogIn className="w-4 h-4" />
                {loading ? t('common.loading') : t('auth.loginBtn')}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">
                {t('auth.registerNow')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ===== MODAL TENTANG APLIKASI (DENGAN TAB) ===== */}
        {isAboutOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4"
            onClick={() => setIsAboutOpen(false)}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <img src="/logo.png" alt="Journal App" className="w-10 h-10" />
                  </div>
                  <h2 className="text-lg pt-5 font-bold text-gray-900 dark:text-gray-100">
                    {t('modal.aboutTitle')}
                  </h2>
                </div>
                <button
                  onClick={() => setIsAboutOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
        
              {/* Body dengan Tab */}
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex justify-center gap-0.5 sm:gap-1 px-3 sm:px-6 pt-3 sm:pt-4 border-b border-gray-200 dark:border-slate-700 overflow-x-auto scrollbar-hide">
                  {['about', 'features', 'technology', 'credits', 'social'].map((tabKey) => (
                    <button
                      key={tabKey}
                      onClick={() => setActiveAboutTab(tabKey)}
                      className={`
                        px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg sm:rounded-t-xl transition whitespace-nowrap
                        ${activeAboutTab === tabKey
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                        }
                      `}
                    >
                      {t(`modal.tabs.${tabKey}`)}
                    </button>
                  ))}
                </div>
                
                {/* Konten Tab */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Tab: Tentang */}
                  {activeAboutTab === 'about' && (
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {t('modal.aboutDesc')}
                      </p> 
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                          <span>
                            <strong>{t('modal.important')}:</strong> {t('modal.wipNotice')}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab: Fitur */}
                  {activeAboutTab === 'features' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <PenSquare className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{t('modal.features.writeJournal.title')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('modal.features.writeJournal.desc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{t('modal.features.moodStats.title')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('modal.features.moodStats.desc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{t('modal.features.calendar.title')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('modal.features.calendar.desc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <BookOpen className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{t('modal.features.favoriteArchive.title')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('modal.features.favoriteArchive.desc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <Camera className="w-5 h-5 text-pink-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{t('modal.features.uploadPhoto.title')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('modal.features.uploadPhoto.desc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <FileDown className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{t('modal.features.exportPdf.title')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('modal.features.exportPdf.desc')}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Teknologi */}
                  {activeAboutTab === 'technology' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        {t('modal.techDesc')}
                      </p>
                      <div className="flex justify-center">
                        <img
                          src="https://skillicons.dev/icons?i=typescript,react,vite,tailwind,supabase,vercel&theme=dark"
                          alt="Tech Stack"
                          className="w-full max-w-md rounded-xl"
                        />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-400 text-center">
                        TypeScript • React • Vite • Tailwind CSS • Supabase • Vercel
                      </p>
                    </div>
                  )}

                  {/* Tab: Kredit */}
                  {activeAboutTab === 'credits' && (
                    <div className="space-y-4 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25 mb-2">
                        <img src="/logo.png" alt="Journal App" className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Journal App</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Version 1.5.0</p>
                      <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('modal.createdBy')} <strong>Feri</strong>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date().getFullYear()} • All Rights Reserved
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab: Sosial Media */}
                    {activeAboutTab === 'social' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          {t('modal.contactMe')}
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap">
                          <a href="https://www.instagram.com/imnotferrriii" target="_blank" rel="noopener noreferrer">
                            <img src="https://skillicons.dev/icons?i=instagram" alt="Instagram" className="w-12 h-12" />
                          </a>
                          <a href="https://github.com/FerrCodes" target="_blank" rel="noopener noreferrer">
                            <img src="https://skillicons.dev/icons?i=github" alt="GitHub" className="w-12 h-12" />
                          </a>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                          
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default Login;