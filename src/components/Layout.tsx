import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { useState } from 'react';
import {
  LayoutDashboard,
  PenSquare,
  BarChart3,
  Moon,
  Sun,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { Settings as SettingsIcon } from 'lucide-react';

function Layout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('👋 Sampai jumpa!');
    navigate('/login');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/create', icon: PenSquare, label: 'Tambah' },
    { to: '/stats', icon: BarChart3, label: 'Statistik' },
    { to: '/settings', icon: SettingsIcon, label: 'Pengaturan' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen 
          bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700
          transition-all duration-300 ease-in-out
          flex flex-col
          overflow-hidden
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          w-64
        `}
      >
        {/* HEADER SIDEBAR: Logo + Tombol Collapse */}
        <div
          className={`
            p-3 border-b border-gray-200 dark:border-slate-700 
            flex items-center
            ${isCollapsed ? 'justify-center' : 'justify-between'}
          `}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl flex-shrink-0">📓</span>
            {!isCollapsed && (
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
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

        {/* NAVIGATION */}
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

        {/* BOTTOM: Dark Mode + Logout */}
        <div className="p-3 border-t border-gray-200 dark:border-slate-700 space-y-1">
          <button
            onClick={toggleTheme}
            className={`
              flex w-full items-center gap-3 px-3 py-3 rounded-lg 
              text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition
              ${isCollapsed ? 'justify-center' : 'justify-start'}
            `}
          >
            {theme === 'light' ? (
              <Moon className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
            ) : (
              <Sun className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
            )}
            {!isCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap">
                {theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className={`
              flex w-full items-center gap-3 px-3 py-3 rounded-lg 
              text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition
              ${isCollapsed ? 'justify-center' : 'justify-start'}
            `}
          >
            <LogOut className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
            {!isCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap">Logout</span>
            )}
          </button>
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
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 px-4 py-3 md:px-6 flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden text-2xl text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Jurnal Harian
          </h1>

          <div className="flex-1"></div>

          <button
            onClick={toggleTheme}
            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-slate-800"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;