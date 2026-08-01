import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import type { JournalEntry } from '../types/journal';
import { MOOD_OPTIONS } from '../types/journal';
import { toast } from 'react-toastify';
import { PenSquare, Search, FileDown } from 'lucide-react';
import { exportAllEntries } from '../utils/exportPDF';


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

    // ===== FILTER TAG (TAMBAHKAN INI) =====
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

  if (loading) {
  return (
    <div className="text-center py-10">
      <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 dark:text-gray-400 mt-4">Memuat jurnal...</p>
    </div>
  );
}

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300">
        ❌ {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold">Daftar Jurnal</h2>
        <div className="flex gap-2">
          {entries.length > 0 && (
            <button
              onClick={() => exportAllEntries(entries)}
              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </button>
          )}
          <Link
            to="/create"
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <PenSquare className="w-4 h-4" />
            Tulis Baru
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jurnal..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={selectedMood ?? ''}
            onChange={(e) => setSelectedMood(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Semua Mood</option>
            {MOOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.emoji} {option.label}
              </option>
            ))}
          </select>

          {/* Filter Tag (hanya muncul kalau ada tag) */}
          {(entries.some(e => e.tags && e.tags.length > 0)) && (
            <select
              value={selectedTag ?? ''}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              ↺ Reset
            </button>
          )}
        </div>
        <div className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
          Menampilkan {filteredEntries.length} dari {entries.length} jurnal
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl shadow-md">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {entries.length === 0 ? 'Belum ada jurnal' : 'Tidak ada hasil yang cocok'}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {entries.length === 0 ? 'Mulai tulis jurnal pertamamu sekarang!' : 'Coba ubah kata kunci atau filter yang lain.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Link
              key={entry.id}
              to={`/entry/${entry.id}`}
              className="block bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {entry.title || 'Tanpa Judul'}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    {entry.content.length > 120 ? entry.content.substring(0, 120) + '...' : entry.content}
                  </p>
                  {entry.song_title && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      🎵 {entry.song_title} {entry.song_artist ? `- ${entry.song_artist}` : ''}
                    </p>
                  )}
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    📅 {formatDate(entry.created_at)}
                  </p>
                   {/* ===== TAMPILKAN TAG ===== */}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                </div>
                <span className="text-gray-300 dark:text-gray-600 text-xl">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;