import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import { toast } from 'sonner'
import {
  UserRound,
  Mail,
  Moon,
  Sun,
  Database,
  Download,
  Trash2,
  Calendar,
  Loader2,
  Settings as SettingsIcon,
  Info,
  Globe,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { exportAllEntries } from '../utils/exportPDF';
import ConfirmModal from '../components/ConfirmModal';
import { Link, useNavigate } from 'react-router-dom';

type MenuTab = 'general' | 'profile' | 'data' | 'about';

function Settings() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MenuTab>('general');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userCreatedAt, setUserCreatedAt] = useState<string>('');

  const menuItems = [
    { id: 'general', icon: SettingsIcon, label: 'Umum' },
    { id: 'profile', icon: UserRound, label: 'Profil' },
    { id: 'data', icon: Database, label: 'Data' },
    { id: 'about', icon: Info, label: 'Tentang' },
  ] as const;

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
          // Format tanggal dibuatnya akun
          const createdAt = new Date(user.created_at || Date.now());
          setUserCreatedAt(
            new Intl.DateTimeFormat('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(createdAt)
          );
        }

        const { data: entries, error } = await supabase
          .from('entries')
          .select('id', { count: 'exact' })
          .eq('user_id', user?.id);

        if (!error && entries) {
          setTotalEntries(entries.length);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleDeleteAll = () => {
    if (totalEntries === 0) {
      toast.info('Belum ada jurnal untuk dihapus.');
      return;
    }
    setIsConfirmOpen(true);
  };

  const confirmDeleteAll = async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak ditemukan');

      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setTotalEntries(0);
      toast.success('Semua jurnal berhasil dihapus!');
    } catch (err: unknown) {
      toast.error('Gagal menghapus: ' + (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    toast.success('Berhasil logout!');
    navigate('/login');
  } catch (err: unknown) {
    toast.error('Gagal logout: ' + (err as Error).message);
  }
};

  const handleExportAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak ditemukan');

      const { data: entries, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!entries || entries.length === 0) {
        toast.info('Belum ada jurnal untuk diekspor.');
        return;
      }

      await exportAllEntries(entries);
      toast.success('Data berhasil diekspor!');
    } catch (err: unknown) {
      toast.error('Gagal ekspor data: ' + (err as Error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Pengaturan</h1>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">← Kembali</span>
          <span className="sm:hidden">←</span>
        </Link>
      </div>

      {/* Body: Sidebar + Konten */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* ===== KONTEN ===== */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 sm:p-6">
            {/* Tab Navigation (Mobile) */}
            <div className="flex md:hidden gap-1 mb-4 overflow-x-auto pb-2 border-b border-gray-200 dark:border-slate-700">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap
                    ${activeTab === item.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* === UMUM === */}
            {activeTab === 'general' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Umum</h3>
                <div className="space-y-3">
                  {/* Bahasa */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Bahasa</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Indonesia</span>
                  </div>

                  {/* Tema */}
                  <div className="py-2 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                      <Sun className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Tema</span>
                    </div>
                    <div className="flex gap-2 pl-8">
                      <button
                        onClick={() => { if (theme !== 'light') toggleTheme(); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border-2 transition text-sm ${
                          theme === 'light'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        <span>Terang</span>
                        {theme === 'light' && <span className="text-blue-500 text-xs">✓</span>}
                      </button>
                      <button
                        onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border-2 transition text-sm ${
                          theme === 'dark'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        <span>Gelap</span>
                        {theme === 'dark' && <span className="text-blue-500 text-xs">✓</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* === PROFIL === */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profil</h3>
                <div className="space-y-4">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/*<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
                      {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>*/}
                    <div className="min-w-0">
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">{userName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 min-w-0">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{userEmail}</span>
                      </p>
                    </div>
                  </div>
            
                  {/* Total Jurnal */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 py-2 border-b border-gray-100 dark:border-slate-700">
                    <Calendar className="w-4 h-4" />
                    Total Jurnal: <strong className="text-gray-700 dark:text-gray-300">{totalEntries}</strong>
                  </div>
                  {/* ===== TANGGAL DIBUAT AKUN ===== */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 py-2 border-b border-gray-100 dark:border-slate-700">
                    <Calendar className="w-4 h-4" />
                    Akun dibuat: <strong className="text-gray-700 dark:text-gray-300">{userCreatedAt || 'Belum tersedia'}</strong>
                  </div>
                    
                  {/* ===== LOGOUT ===== */}
                  <div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">Logout</p>
                          <p className="text-xs text-red-500 dark:text-red-400">Keluar dari akun ini</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-red-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* === DATA === */}
            {activeTab === 'data' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Data</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleExportAll}
                    disabled={totalEntries === 0}
                    className="flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <Download className="w-5 h-5" />
                    <span>Ekspor Semua Data ({totalEntries} jurnal)</span>
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    disabled={isDeleting || totalEntries === 0}
                    className="flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>{isDeleting ? 'Menghapus...' : `Hapus Semua Jurnal`}</span>
                  </button>
                  <p className="text-xs text-red-500 dark:text-red-400 text-center">
                    Tindakan ini tidak bisa dibatalkan. Dan terhapus permanent
                  </p>
                </div>
              </div>
            )}

            {/* === TENTANG === */}
            {activeTab === 'about' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tentang</h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p><strong>Journal App</strong> — Aplikasi jurnal harian modern.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Dibuat oleh Feri.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Versi: <span className="font-mono">1.5.0</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDeleteAll}
        title="Hapus Semua Jurnal?"
        message={`Jurnal yang tersedia ${totalEntries}, termasuk yang sudah di Arsipkan.`}
        confirmText="Ya, Hapus Semua"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
}

export default Settings;