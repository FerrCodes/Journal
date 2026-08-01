import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import type { JournalEntry } from '../types/journal';
import { MOOD_OPTIONS } from '../types/journal';
import { toast } from 'react-toastify';
import { PenSquare, Search, Filter, X, BarChart3, Calendar, Smile, BookOpen } from 'lucide-react';

function Dashboard() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
      setFilteredEntries(data || []);
    } catch (err: unknown) {
      setError((err as Error).message);
      toast.error('❌ Gagal memuat data: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntries();
  }, []);

  useEffect(() => {
    let result = entries;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (entry) =>
          (entry.title && entry.title.toLowerCase().includes(query)) ||
          entry.content.toLowerCase().includes(query)
      );
    }
    if (selectedMood !== null) {
      result = result.filter((entry) => entry.mood === selectedMood);
    }
    if (selectedTag !== null) {
      result = result.filter((entry) => entry.tags?.includes(selectedTag));
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredEntries(result);
  }, [searchQuery, selectedMood, selectedTag, entries]);

  const getMoodEmoji = (mood: number) => {
    const found = MOOD_OPTIONS.find((m) => m.value === mood);
    return found ? found.emoji : '😐';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setSelectedMood(null);
    setSelectedTag(null);
  };

  // Hitung statistik
  const totalEntries = entries.length;
  const latestMood = entries.length > 0 ? entries[0].mood : null;
  const moodCount = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  const mostCommonMood = entries.length > 0 
    ? Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] 
    : null;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-xl w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
            ))}
          </div>
          <div className="h-16 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-6 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-700 dark:text-red-300">
          ❌ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
            Daftar Jurnal
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {totalEntries} entri • Terakhir: {latestMood ? getMoodEmoji(latestMood) : 'Belum ada'}
          </p>
        </div>
        <Link
          to="/create"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <PenSquare className="w-4 h-4" />
          Tulis Baru
        </Link>
      </div>

      {/* Stats Cards */}
      {totalEntries > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalEntries}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Jurnal</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Smile className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {mostCommonMood ? getMoodEmoji(Number(mostCommonMood)) : '😐'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Mood Terbanyak</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Object.keys(moodCount).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Variasi Mood</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Filter className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {entries.filter(e => e.tags && e.tags.length > 0).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dengan Tag</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jurnal..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <select
            value={selectedMood ?? ''}
            onChange={(e) => setSelectedMood(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value="">Semua Mood</option>
            {MOOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.emoji} {option.label}
              </option>
            ))}
          </select>
          {(entries.some(e => e.tags && e.tags.length > 0)) && (
            <select
              value={selectedTag ?? ''}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="">Semua Tag</option>
              {Array.from(new Set(entries.flatMap(e => e.tags || []))).map((tag) => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          )}
          {(searchQuery || selectedMood !== null || selectedTag !== null) && (
            <button
              onClick={handleResetFilter}
              className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-300 rounded-xl transition flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Menampilkan {filteredEntries.length} dari {entries.length} jurnal
        </div>
      </div>

      {/* List Jurnal */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {entries.length === 0 ? 'Belum ada jurnal' : 'Tidak ada hasil yang cocok'}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {entries.length === 0 ? 'Mulai tulis jurnal pertamamu sekarang!' : 'Coba ubah kata kunci atau filter yang lain.'}
          </p>
          {entries.length === 0 && (
            <Link to="/create" className="inline-block mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl transition">
              ✏️ Tulis Jurnal
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Link
              key={entry.id}
              to={`/entry/${entry.id}`}
              className="block bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-slate-700 p-5 transition-all duration-200 hover:scale-[1.01]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {entry.title || 'Tanpa Judul'}
                    </h3>
                    {entry.tags && entry.tags.length > 0 && (
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                        #{entry.tags[0]}
                        {entry.tags.length > 1 && ` +${entry.tags.length - 1}`}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-1">
                    {entry.content}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                    <span>📅 {formatDate(entry.created_at)}</span>
                    {entry.song_title && (
                      <span className="flex items-center gap-1">
                        🎵 {entry.song_title}
                        {entry.song_artist && ` - ${entry.song_artist}`}
                      </span>
                    )}
                    {entry.weather && (
                      <span>☁️ {entry.weather}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gray-300 dark:text-gray-600 text-sm">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;