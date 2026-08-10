import { useEffect, useState } from 'react';
import { toast } from 'sonner'
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { Skeleton } from '../components/Skeleton';
import { BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { MOOD_OPTIONS } from '../types/journal';
import type { JournalEntry } from '../types/journal';

function Stats() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Silakan login terlebih dahulu.');

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (err: unknown) {
      setError((err as Error).message);
      toast.error('❌ Gagal memuat statistik: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntries();
  }, []);

  const getLineChartData = () => {
    return entries.map((entry) => ({
      tanggal: new Date(entry.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      }),
      mood: entry.mood,
      judul: entry.title || 'Tanpa Judul',
    }));
  };

  const getBarChartData = () => {
    const moodCount: Record<number, number> = {};
    entries.forEach((entry) => {
      moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
    });

    return Object.entries(moodCount).map(([mood, count]) => ({
      mood: Number(mood),
      emoji: MOOD_OPTIONS.find((m) => m.value === Number(mood))?.emoji || '😐',
      label: MOOD_OPTIONS.find((m) => m.value === Number(mood))?.label || 'Biasa Aja',
      count,
    }));
  };

  const COLORS = ['#ef4444', '#f59e0b', '#fbbf24', '#22c55e', '#3b82f6'];
  const lineData = getLineChartData();
  const barData = getBarChartData();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Memuat statistik...</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
              <Skeleton style={{ width: '40px', height: '32px', margin: '0 auto' }} />
              <Skeleton style={{ width: '60%', height: '16px', margin: '8px auto 0' }} />
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md mb-6">
          <Skeleton style={{ width: '40%', height: '24px', marginBottom: '16px' }} />
          <Skeleton style={{ height: '250px' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300">
        ❌ {error}
        <br />
        <Link to="/" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 inline-block mt-2">
          ← Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          <h1 className="text-3xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">Statistik</h1>
        </div>
        <Link 
          to="/" 
          className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">← Kembali</span>
          <span className="sm:hidden">←</span>
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl shadow-md">
          <p className="text-lg text-gray-700 dark:text-gray-300">Belum ada data jurnal</p>
          <p className="text-gray-500 dark:text-gray-400">Tulis beberapa jurnal dulu untuk melihat statistik mood-mu!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl shadow-md text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{entries.length}</p>
              <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-sm">Total Jurnal</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {entries.length > 0
                  ? MOOD_OPTIONS.find(m => m.value === Math.round(entries.reduce((sum, e) => sum + e.mood, 0) / entries.length))?.emoji
                  : '😐'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Rata-rata Mood</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {entries.length > 0
                  ? MOOD_OPTIONS.find(m => m.value === Math.max(...entries.map(e => e.mood)))?.emoji
                  : '😐'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Mood Tertinggi</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {entries.length > 0
                  ? MOOD_OPTIONS.find(m => m.value === Math.min(...entries.map(e => e.mood)))?.emoji
                  : '😐'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Mood Terendah</p>
            </div>
          </div>

          {lineData.length >= 2 && (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tren Mood Harian</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis dataKey="tanggal" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <YAxis domain={[1, 5]} tickCount={5} stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none' }}
                    formatter={(value) => {
                      const found = MOOD_OPTIONS.find(m => m.value === value);
                      return `${found?.emoji} ${found?.label}`;
                    }}
                    labelFormatter={(label) => `Tanggal: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="mood" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} name="Mood" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {barData.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-3 sm:p-5 rounded-xl shadow-md mb-4 sm:mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Frekuensi Mood</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis dataKey="emoji" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none' }}
                    formatter={(value) => `${value} jurnal`}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Jumlah Jurnal">
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.mood - 1] || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {barData.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Distribusi Mood</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={barData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name }) => {
                      const item = barData.find(d => d.label === name);
                      return item ? `${item.emoji}` : name;
                    }}
                    labelLine={true}
                  >
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.mood - 1] || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Stats;