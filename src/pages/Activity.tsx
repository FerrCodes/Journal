import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  LogIn, 
  LogOut,
  PenSquare, 
  Trash2, 
  Edit,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  entry_id: string | null;
  details: {
    title?: string;
    mood?: number;
    email?: string;
    last_sign_in?: string;
  };
  created_at: string;
}

function ActivityPage() {
  const location = useLocation();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [lastLogout, setLastLogout] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  const fetchActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);

      const loginLogs = data?.filter(log => log.action === 'login');
      if (loginLogs && loginLogs.length > 0) {
        setLastLogin(loginLogs[loginLogs.length - 1].created_at);
      } else {
        setLastLogin(null);
      }

      const logoutLogs = data?.filter(log => log.action === 'logout');
      if (logoutLogs && logoutLogs.length > 0) {
        setLastLogout(logoutLogs[logoutLogs.length - 1].created_at);
      } else {
        setLastLogout(null);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchActivities();

  // Refresh saat tab jadi aktif
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      fetchActivities();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Refresh saat window di-focus (balik dari aplikasi lain)
  const handleFocus = () => {
    fetchActivities();
  };
  window.addEventListener('focus', handleFocus);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleFocus);
  };
}, [location.key]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <PenSquare className="w-4 h-4 text-green-500" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'login':
        return <LogIn className="w-4 h-4 text-green-500" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create': return t('activity.create');
      case 'update': return t('activity.update');
      case 'delete': return t('activity.delete');
      case 'login': return t('activity.login');   
      case 'logout': return t('activity.logout');
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'update':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 'delete':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      case 'login':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'logout':
        return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, d MMMM yyyy, HH:mm', { locale: i18n.language === 'en' ? enUS : id });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{t('activity.title')}</h1>
          </div>
          <Link 
            to="/" 
            className="inline-flex items-center gap-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition text-sm"
          >
            <span className="hidden sm:inline">← Kembali</span>
            <span className="sm:hidden">←</span>
          </Link>
        </div>

      {/* Last Login & Last Logout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('activity.lastLogin')}</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                {lastLogin ? formatDate(lastLogin) : 'Belum pernah login'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('activity.lastLogout')}</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                {lastLogout ? formatDate(lastLogout) : 'Belum pernah logout'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Aktivitas */}
      {activities.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 text-center">
          <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('activity.emptyTitle')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">{t('activity.emptyDesc')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActionColor(activity.action)}`}>
                {getActionIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getActionLabel(activity.action)}
                  </span>
                  {activity.details?.title && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      &quot;{activity.details.title}&quot;
                    </span>
                  )}
                  {activity.action === 'login' && activity.details?.email && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.details.email}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatDate(activity.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityPage;