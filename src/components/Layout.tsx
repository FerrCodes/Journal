import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner'
import { useState, useRef, useEffect } from 'react';
import SettingsModal from './SettingsModal';
import {
  LayoutDashboard,
  PenSquare,
  BarChart3,
  Moon,
  Sun,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  ChevronUp,
  ChevronDown,
  Calendar,
  Archive,
  Activity
} from 'lucide-react';

function Layout({ refreshActivity }: { refreshActivity: () => void }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // 🔥 Catat logout dari frontend
    if (user) {
      try {
        await supabase
          .from('activity_logs')
          .insert({
            user_id: user.id,
            action: 'logout',
            details: { email: user.email }
          });
        console.log('Logout tercatat!');
      } catch (logError) {
        console.warn('Gagal mencatat logout:', logError);
      }
    }

    await supabase.auth.signOut();
    toast.success('Berhasil Logout!');
    navigate('/login');
  } catch (err) {
    toast.error('Gagal logout: ' + (err as Error).message);
  }
};

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);
  const closeUserDropdown = () => setIsUserDropdownOpen(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeUserDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ambil user info dari Supabase
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
      }
    };
    getUser();
  }, []);

  useEffect(() => {
  const handleClickOutside = () => {
    if (isProfileDropdownOpen) {
      setIsProfileDropdownOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isProfileDropdownOpen]);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/create', icon: PenSquare, label: 'Tambah' },
    { to: '/stats', icon: BarChart3, label: 'Statistik' },
    { to: '/calendar', icon: Calendar, label: 'Kalender' },
    { to: '/archive', icon: Archive, label: 'Arsip' },
    { 
      to: '/activity', 
      icon: Activity, 
      label: 'Aktivitas',
      onClick: refreshActivity
    },
  ];

  // Untuk bottom navigation (mobile)
const bottomNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: Calendar, label: 'Kalender' },
  { to: '/create', icon: PenSquare, label: 'Jurnal Baru' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/settings', icon: Settings, label: 'Pengaturan' },
];

  // Ambil inisial untuk avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* ===== SIDEBAR ===== */}
      <aside
          className={`
            fixed md:sticky top-0 left-0 z-40 h-screen 
            bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700
            transition-all duration-300 ease-in-out
            flex flex-col
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            ${isCollapsed ? 'md:w-20' : 'md:w-64'}
            w-64
          `}
        >
        {/* HEADER: Logo + Tombol Collapse */}
        <div
          className={`
            p-3 border-b border-gray-200 dark:border-slate-700 
            flex items-center
            ${isCollapsed ? 'justify-center' : 'justify-between'}
          `}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl flex-shrink-0"></span>
            {!isCollapsed && (
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap flex items-center gap-1">
                <img src="/public/logo.png" alt="Journal App" className="w-10 h-10" />
                Journal
              </span>
            )}
          </div>

          {/* Tombol Collapse */}
          <button
            onClick={toggleCollapse}
            className={`
              hidden md:flex items-center justify-center
              w-8 h-8 rounded-lg 
              text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
              hover:bg-gray-100 dark:hover:bg-slate-800 transition
            `}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* NAVIGATION (pusat) */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                } ${isCollapsed ? 'justify-center' : 'justify-start'}`
              }
            >
              <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ===== USER DROPDOWN (di Bawah Sidebar) ===== */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-2 relative" ref={dropdownRef}>
          {/* Trigger: Avatar + Nama + Chevron */}
          <button
            onClick={toggleUserDropdown}
            className={`
              w-full flex items-center gap-2 px-3 py-2 rounded-xl 
              hover:bg-gray-100 dark:hover:bg-slate-800 transition
              ${isCollapsed ? 'justify-center' : 'justify-between'}
            `}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-md flex-shrink-0">
                {getInitials(userName)}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userEmail}
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-gray-400 flex-shrink-0">
                {isUserDropdownOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            )}
          </button>
          
          {/* Dropdown Menu (muncul ke ATAS) */}
          {isUserDropdownOpen && !isCollapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden animate-fadeInUp">
              <div className="p-1 space-y-0.5">
                {/* Pengaturan */}
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    closeUserDropdown();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition group w-full"
                >
                  <Settings className="w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                  <span className="text-sm font-medium">Pengaturan</span>
                </button>
          
                {/* Mode Gelap dengan Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition group"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'light' ? (
                      <Moon className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    ) : (
                      <Sun className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300" />
                    )}
                    <span className="text-sm font-medium">
                      {theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
                    </span>
                  </div>
                  {/* Toggle Switch */}
                  <div
                    className={`w-10 h-5 rounded-full transition ${
                      theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                        theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </div>
                </button>
                    
                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-slate-700 my-1" />
                    
                {/* Logout */}
                <button
                  onClick={() => {
                    handleLogout();
                    closeUserDropdown();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition group"
                >
                  <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ===== OVERLAY (Mobile) ===== */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar (ringkas) */}
        <button
        onClick={toggleSidebar}
        className="md:hidden text-2xl text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
        aria-label="Toggle sidebar"
      >
      </button>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {/* ===== BOTTOM NAVIGATION (Mobile Only) ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 md:hidden">
        <div className="flex items-center justify-around px-1 py-1.5">
          {bottomNavItems.map(({ to, icon: Icon, label }) => {
            const isTulis = to === '/create';
            const active = isActive(to);

      return (
        <NavLink
          key={to}
          to={to}
          onClick={closeSidebar}
          className={`flex flex-col items-center transition-all duration-200 ${
            active
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <div
            className={`flex items-center justify-center rounded-full transition-all duration-200 ${
              isTulis
                ? active
                  ? 'w-14 h-14 -mt-4 bg-blue-500/20 dark:bg-blue-500/30 border-2 border-blue-500'
                  : 'w-12 h-12 -mt-2 bg-blue-500/10 dark:bg-blue-500/20'
                : active
                ? 'w-14 h-12 -mt-2'
                : 'w-12 h-10'
            }`}
          >
            <Icon
              className={`transition-all duration-200 ${
                isTulis
                  ? active
                    ? 'w-7 h-7 text-blue-500'
                    : 'w-6 h-6 text-blue-500 dark:text-blue-400'
                  : active
                  ? 'w-7 h-7 scale-110'
                  : 'w-5 h-5'
              }`}
            />
          </div>
          <span
            className={`text-[9px] font-medium transition-all duration-200 ${
              active ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {label}
          </span>
        </NavLink>
      );
    })}
  </div>
</div>
    </div>
  );
}

export default Layout;