import { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, BookOpen, PenSquare, BarChart3, Calendar, Info, X, FileDown, Camera, Music, Disc3 } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const navigate = useNavigate();
  const [activeAboutTab, setActiveAboutTab] = useState('Tentang');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Selamat datang kembali!');
      navigate('/');
    } catch (err: unknown) {
      setError((err as Error).message);
      toast.error('❌ Login gagal: ' + (err as Error).message);
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
                <img src="/public/logo.png" alt="Journal App" className="w-10 h-10" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Selamat Datang
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Lanjutkan progres Jurnal baru
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
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

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/25"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'Memuat...' : 'Masuk'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Belum punya akun?{' '}
              <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">
                Daftar Sekarang
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
                    <img src="/public/logo.png" alt="Journal App" className="w-10 h-10" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
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
                <div className="flex gap-0.5 sm:gap-1 px-3 sm:px-6 pt-3 sm:pt-4 border-b border-gray-200 dark:border-slate-700 overflow-x-auto scrollbar-hide">
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
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        <strong className="text-gray-900 dark:text-gray-100">Journal App</strong> adalah aplikasi jurnal harian modern yang membantu kamu 
                        merekam pengalaman, perasaan, dan momen berharga setiap hari.
                      </p>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          💡 "Catat setiap momen, kenang selamanya."
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Dibuat untuk memudahkan kamu mendokumentasikan kegiatan harian, 
                        sekaligus melacak perubahan mood dan perasaan dari waktu ke waktu.
                      </p>
                    </div>
                  )}

                  {/* Tab: Fitur */}
                  {activeAboutTab === 'Fitur' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <PenSquare className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Tulis Jurnal</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Catat pengalaman dengan mood, lagu, dan foto</p>
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
                          <p className="text-sm text-gray-500 dark:text-gray-400">Dokumentasi dengan foto</p>
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Aplikasi ini dibangun dengan teknologi modern:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-center">
                          <p className="font-medium text-gray-900 dark:text-gray-100">React</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">UI Library</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-center">
                          <p className="font-medium text-gray-900 dark:text-gray-100">TypeScript</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">JavaScript dengan tipe</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-center">
                          <p className="font-medium text-gray-900 dark:text-gray-100">Vite</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Build Tool</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-center">
                          <p className="font-medium text-gray-900 dark:text-gray-100">Tailwind CSS</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Styling</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-center">
                          <p className="font-medium text-gray-900 dark:text-gray-100">Supabase</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Backend & Database</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-center">
                          <p className="font-medium text-gray-900 dark:text-gray-100">Lucide Icons</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Icon Library</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Kredit */}
                  {activeAboutTab === 'Kredit' && (
                    <div className="space-y-4 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25 mb-2">
                        <img src="/public/logo.png" alt="Journal App" className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Journal App</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Versi 1.0.0</p>
                      <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          dibuat dengan ❤️ oleh <strong className="text-gray-900 dark:text-gray-100">Feri</strong>
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
                          Temukan dan ikuti kami di media sosial:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {/* Discord */}
                          <a
                            href="https://discord.gg/your-invite-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition group"
                          >
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition">
                              <Disc3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Discord</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">@journalapp</span>
                          </a>
                    
                          {/* Instagram */}
                          <a
                            href="https://instagram.com/your-username"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition group"
                          >
                            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition">
                              <Camera className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Instagram</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">@journalapp</span>
                          </a>
                    
                          {/* TikTok */}
                          <a
                            href="https://tiktok.com/@your-username"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition group"
                          >
                            <div className="p-3 bg-black/10 dark:bg-white/10 rounded-full group-hover:bg-black/20 dark:group-hover:bg-white/20 transition">
                              <svg className="w-6 h-6 text-gray-900 dark:text-gray-100" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.76-.08 1.4-.54 2.79-1.35 3.99-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">TikTok</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">@journalapp</span>
                          </a>
                    
                          {/* X (Twitter) */}
                          <a
                            href="https://x.com/your-username"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition group"
                          >
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition">
                              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">X (Twitter)</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">@journalapp</span>
                          </a>
                    
                          {/* Spotify */}
                          <a
                            href="https://spotify.com/your-playlist"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition group"
                          >
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition">
                              <Music className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Spotify</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">Playlist</span>
                          </a>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                          Klik icon untuk mengunjungi halaman kami 🚀
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