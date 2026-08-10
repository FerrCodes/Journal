import { useState } from 'react';
import { toast } from 'sonner'
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, Eye, EyeOff, X, BookOpen, Camera, FileDown, PenSquare, BarChart3, Calendar, Info} from 'lucide-react';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeAboutTab, setActiveAboutTab] = useState('Tentang');
  const navigate = useNavigate();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      toast.success('✅ Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err: unknown) {
      setError((err as Error).message);
      toast.error('❌ Registrasi gagal: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100 dark:border-slate-700 relative">
          {/* Tombol Tentang Aplikasi */}
          <button
            onClick={() => {
              setIsAboutOpen(true);
              setActiveAboutTab('Tentang');
            }}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            aria-label="Tentang Aplikasi"
          >
            <Info className="w-5 h-5" />
          </button>
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/25 mb-4">
              <img src="/public/logo.png" alt="Journal App" className="w-10 h-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Daftar Akun
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Buat akun dan mulai membuat Jurnal baru!
            </p>
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
                  <div className="p-2 from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 rounded-lg">
                    <img src="/public/logo.png" alt="Journal App" className="w-10 h-10" />
                  </div>
                  <h2 className="text-lg pt-5 font-bold text-gray-900 dark:text-gray-100">
                    Tentang Journal App
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
                  {['Tentang', 'Fitur', 'Teknologi', 'Kredit', 'Sosial Media'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveAboutTab(tab)}
                      className={`
                        px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg sm:rounded-t-xl transition whitespace-nowrap
                        ${activeAboutTab === tab
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                        }
                      `}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                {/* Konten Tab */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Tab: Tentang */}
                  {activeAboutTab === 'Tentang' && (
                    <div className="space-y-4">
                      <p className="text-gray-400 dark:text-gray-400leading-relaxed">
                        <strong className="text-white">Journal App</strong> adalah aplikasi jurnal harian modern yang pertama kali saya buat. Menulis jurnal harian dengan fitur Mood Emoji Tracker, Mood Emoji Statistik, Kalender dan Arsip. 
                        Mencoba teknologi baru dan mengenal ekosistem modern untuk membangun aplikasi web yang cepat, ringan, dan responsif.
                      </p>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                          <span className="text-lg">⚠️</span>
                          <span>
                            <strong>Penting:</strong> Aplikasi ini masih dalam tahap pengembangan dan masih dalam percobaan di Android.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab: Fitur */}
                  {activeAboutTab === 'Fitur' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <PenSquare className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Tulis Jurnal</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Catat harian dengan mood, lagu, dan foto</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Statistik Mood</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Grafik tren mood harian & distribusi</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Kalender Jurnal</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Lihat jurnal per tanggal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <BookOpen className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Favorit & Arsip</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola jurnal favorit dan arsip</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <Camera className="w-5 h-5 text-pink-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Upload Foto</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Tambahkan foto ke jurnal harian</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <FileDown className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Export PDF</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Cetak jurnal ke PDF</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Teknologi */}
                  {activeAboutTab === 'Teknologi' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        Dibangun dengan teknologi modern:
                      </p>
                      <div className="flex justify-center">
                        <img
                          src="https://skillicons.dev/icons?i=react,ts,vite,tailwind,supabase,git,vercel,figma&theme=dark"
                          alt="Tech Stack"
                          className="w-full max-w-md rounded-xl"
                        />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-400 text-center">
                        React • TypeScript • Vite • Tailwind CSS • Supabase • Git • Vercel • Figma
                      </p>
                    </div>
                  )}

                  {/* Tab: Kredit */}
                  {activeAboutTab === 'Kredit' && (
                    <div className="space-y-4 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/25 mb-2">
                        <img src="/public/logo.png" alt="Journal App" className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Journal App</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Versi 1.5.0</p>
                      <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          dibuat oleh <strong className="text-gray-900 dark:text-gray-100">Feri</strong>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date().getFullYear()} • All Rights Reserved
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab: Sosial Media */}
                    {activeAboutTab === 'Sosial Media' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          Hubungi Saya
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
                          Klik icon untuk mengunjungi profil kami 🚀
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password <span className="text-gray-400 dark:text-gray-500">(min. 6 karakter)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
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

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Memuat...' : 'Daftar'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition">
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;