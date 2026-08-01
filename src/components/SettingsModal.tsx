import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useReminder } from '../hooks/useReminder';
import { supabase } from '../services/supabase';
import { toast } from 'react-toastify';
import {
  User,
  Mail,
  Moon,
  Sun,
  Bell,
  Clock,
  Database,
  Download,
  Trash2,
  Calendar,
  Loader2,
  Settings as SettingsIcon,
  Info,
  Globe,
  X,
} from 'lucide-react';
import { exportAllEntries } from '../utils/exportPDF';
import ConfirmModal from './ConfirmModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MenuTab = 'general' | 'theme' | 'profile' | 'data' | 'about';

function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, toggleTheme } = useTheme();
  const { settings, permission, requestPermission, saveSettings } = useReminder();
  const [activeTab, setActiveTab] = useState<MenuTab>('general');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
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
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleDeleteAll = () => {
    if (totalEntries === 0) {
      toast.info('📭 Belum ada jurnal untuk dihapus.');
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
      toast.success('🗑️ Semua jurnal berhasil dihapus!');
    } catch (err: unknown) {
      toast.error('❌ Gagal menghapus: ' + (err as Error).message);
    } finally {
      setIsDeleting(false);
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
        toast.info('📭 Belum ada jurnal untuk diekspor.');
        return;
      }

      await exportAllEntries(entries);
      toast.success('✅ Data berhasil diekspor!');
    } catch (err: unknown) {
      toast.error('❌ Gagal ekspor data: ' + (err as Error).message);
    }
  };

  const menuItems = [
  { id: 'general', icon: SettingsIcon, label: 'Umum' },
  { id: 'profile', icon: User, label: 'Profil' },
  { id: 'data', icon: Database, label: 'Data' },
  { id: 'about', icon: Info, label: 'Tentang' },
] as const;

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] h-[500px] overflow-hidden mx-4 animate-scaleIn flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-500" />
            Pengaturan
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Kiri */}
          <div className="w-48 flex-shrink-0 border-r border-gray-200 dark:border-slate-700 overflow-y-auto p-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition
                  ${activeTab === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Konten Kanan */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* UMUM */}
            {/* === UMUM (termasuk Tema) === */}
            {activeTab === 'general' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Umum</h3>
                <div className="space-y-4">
                  
                  {/* Bahasa */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Bahasa</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Indonesia</span>
                  </div>
            
                  {/* Tema (dengan 2 tombol pilihan) */}
                  <div className="py-2 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <Sun className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Tema</span>
                    </div>
                    <div className="flex gap-3 pl-8">
                      <button
                        onClick={() => { if (theme !== 'light') toggleTheme(); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 transition ${
                          theme === 'light'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        <span className="text-sm font-medium">Terang</span>
                        {theme === 'light' && (
                          <span className="text-blue-500 text-xs">✓</span>
                        )}
                      </button>
                      <button
                        onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 transition ${
                          theme === 'dark'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        <span className="text-sm font-medium">Gelap</span>
                        {theme === 'dark' && (
                          <span className="text-blue-500 text-xs">✓</span>
                        )}
                      </button>
                    </div>
                  </div>
                    
                  {/* Notifikasi */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Notifikasi</span>
                    </div>
                    <button
                      onClick={() => {
                        if (!settings.enabled && permission !== 'granted') {
                          requestPermission();
                        }
                        saveSettings({ ...settings, enabled: !settings.enabled });
                      }}
                      className={`w-12 h-6 rounded-full transition ${
                        settings.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                          settings.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5`}
                      />
                    </button>
                  </div>
                    
                  {/* Waktu Notifikasi (jika aktif) */}
                  {settings.enabled && (
                    <div className="flex items-center gap-3 py-2 pl-10">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div className="flex items-center gap-2">
                        <select
                          value={settings.hour}
                          onChange={(e) => saveSettings({ ...settings, hour: Number(e.target.value) })}
                          className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>
                              {i.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        <span className="text-gray-500 dark:text-gray-400">:</span>
                        <select
                          value={settings.minute}
                          onChange={(e) => saveSettings({ ...settings, minute: Number(e.target.value) })}
                          className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        >
                          {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                            <option key={m} value={m}>
                              {m.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TEMA */}
            {activeTab === 'theme' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tema</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => { if (theme !== 'light') toggleTheme(); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition ${
                      theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sun className="w-5 h-5 text-yellow-500" />
                      <span className="text-gray-700 dark:text-gray-300">Terang</span>
                    </div>
                    {theme === 'light' && <span className="text-blue-500 text-sm font-medium">✓ Aktif</span>}
                  </button>
                  <button
                    onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition ${
                      theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-indigo-500" />
                      <span className="text-gray-700 dark:text-gray-300">Gelap</span>
                    </div>
                    {theme === 'dark' && <span className="text-blue-500 text-sm font-medium">✓ Aktif</span>}
                  </button>
                </div>
              </div>
            )}

            {/* PROFIL */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profil</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{userName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="w-4 h-4" /> {userEmail}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Total Jurnal: <strong className="text-gray-700 dark:text-gray-300">{totalEntries}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* DATA */}
            {activeTab === 'data' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Data</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleExportAll}
                    disabled={totalEntries === 0}
                    className="flex items-center gap-3 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                  >
                    <Download className="w-5 h-5" />
                    <span>Ekspor Semua Data ({totalEntries} jurnal)</span>
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    disabled={isDeleting || totalEntries === 0}
                    className="flex items-center gap-3 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>{isDeleting ? 'Menghapus...' : `Hapus Semua Jurnal (${totalEntries})`}</span>
                  </button>
                  <p className="text-xs text-red-500 dark:text-red-400">⚠️ Tindakan ini tidak bisa dibatalkan.</p>
                </div>
              </div>
            )}

            {/* TENTANG */}
            {activeTab === 'about' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tentang</h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p><strong>Journal App</strong> — Aplikasi jurnal harian modern.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dibuat dengan ❤️ menggunakan React, Vite, TypeScript, dan Tailwind CSS.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Versi: <span className="font-mono">1.0.0</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDeleteAll}
        title="Hapus Semua Jurnal?"
        message={`⚠️ Kamu akan menghapus SEMUA ${totalEntries} jurnal. Tindakan ini TIDAK BISA DIBATALKAN!`}
        confirmText="Ya, Hapus Semua"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
}

export default SettingsModal;