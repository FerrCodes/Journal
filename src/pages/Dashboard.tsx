import { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import type { JournalEntry } from '../types/journal';
import { MOOD_OPTIONS } from '../types/journal';
import { toast } from 'react-toastify';
import { PenSquare, Search, Filter, X, BarChart3, Calendar, Smile, BookOpen, Star, Cloud, Music, ChevronDown, Archive } from 'lucide-react';

function Dashboard() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        .eq('is_archived', false)
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
    if (showFavoritesOnly) {
    result = result.filter((entry) => entry.is_favorite === true);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredEntries(result);
    }, [searchQuery, selectedMood, selectedTag, showFavoritesOnly, entries]);

  const getMoodEmoji = (mood: number) => {
    const found = MOOD_OPTIONS.find((m) => m.value === mood);
    return found ? found.emoji : '😐';
  };

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

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
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl sm:text-xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 truncate">
          <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-500 flex-shrink-0" />
          <span className="truncate">Daftar Jurnal</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {totalEntries} entri • Terakhir: {latestMood ? getMoodEmoji(latestMood) : 'Belum ada'}
        </p>
      </div>
        <div className="flex items-center gap-2">
        {/* Tombol Utama + Dropdown */}
        <div className="relative" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl transition flex items-center gap-1 sm:gap-2 text-sm sm:text-base flex-shrink-0"
        >
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFavoritesOnly(!showFavoritesOnly);
                    setIsDropdownOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition ${
                    showFavoritesOnly
                      ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-yellow-500' : ''}`} />
                  {showFavoritesOnly ? 'Tampilkan Semua' : 'Tampilkan Favorit'}
                </button>
                <Link
                  to="/create"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  <PenSquare className="w-4 h-4 text-blue-500" />
                  Tambah Jurnal Baru
                </Link>
                <Link
                  to="/archive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  <Archive className="w-4 h-4 text-gray-500" />
                  Arsip
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {totalEntries > 0 && (
        <>
      {/* Total Jurnal */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{totalEntries}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">Total Jurnal</p>
          </div>
        </div>
      </div>

      {/* Mood Terbanyak */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
            <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {mostCommonMood ? getMoodEmoji(Number(mostCommonMood)) : '😐'}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">Mood Terbanyak</p>
          </div>
        </div>
      </div>

      {/* Variasi Mood */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Object.keys(moodCount).length}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">Variasi Mood</p>
          </div>
        </div>
      </div>

      {/* Dengan Tag */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {entries.filter(e => e.tags && e.tags.length > 0).length}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">Dengan Tag</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-800 p-3 sm:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6">
        <div className="flex sm:flex-row flex-wrap gap-2 sm:gap-3 items-start sm:items-center">
          <div className="w-full sm:flex-1 min-w-[130px] sm:min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jurnal..."
              className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
            />
          </div>
          <select
            value={selectedMood ?? ''}
            onChange={(e) => setSelectedMood(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 sm:flex-none w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
          >
            <option value="">Semua Mood</option>
            {MOOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.emoji} {option.label}
              </option>
              
            ))}
          </select>
          {/* Filter Tag */}
          {(entries.some(e => e.tags && e.tags.length > 0)) && (
            <select
              value={selectedTag ?? ''}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="flex-1 sm:flex-none w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
            >
              <option value="">Semua Tag</option>
              {Array.from(new Set(entries.flatMap(e => e.tags || []))).map((tag) => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          )}
          {/* ... tag filter ... */}
          {(searchQuery || selectedMood !== null || selectedTag !== null) && (
            <button
              onClick={handleResetFilter}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-300 rounded-xl transition flex items-center gap-1 text-sm"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Reset</span>
            </button>
          )}
        </div>
        <div className="mt-2 sm:mt-3 text-center sm:text-center text-xs text-gray-500 dark:text-gray-400">
          Menampilkan {filteredEntries.length} dari {entries.length} jurnal
        </div>
      </div>

      {/* List Jurnal */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="text-6xl mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {entries.length === 0 ? 'Belum ada jurnal' : 'Tidak ada hasil yang cocok'}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {entries.length === 0 ? 'Buat jurnal pertamamu sekarang!' : 'Coba ubah kata kunci atau filter yang lain.'}
          </p>
        </div>
        ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredEntries.map((entry) => (
            <Link
              key={entry.id}
              to={`/entry/${entry.id}`}
              className="block bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-slate-700 p-4 sm:p-5 transition-all duration-200 hover:scale-[1.01]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                    {entry.is_favorite && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    )}
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {entry.title || 'Tanpa Judul'}
                    </h3>
                    {entry.tags && entry.tags.length > 0 && (
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs">
                        #{entry.tags[0]}
                        {entry.tags.length > 1 && ` +${entry.tags.length - 1}`}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-2 mb-1">
                    {entry.content}
                  </p>
                  {/* Garis Pemisah */}
                <div className="border-t-2 border-gray-300 dark:border-slate-600 my-2" />
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-gray-400 dark:text-white/70">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formatDate(entry.created_at)}
                    </span>
                    {entry.song_title && (
                      <span className="flex items-center gap-0.5 sm:gap-1 truncate max-w-[120px] sm:max-w-[200px]">
                        <Music className="w-3 h-3 sm:w-4 sm:h-4" />
                        {entry.song_title}
                        {entry.song_artist && ` - ${entry.song_artist}`}
                      </span>
                    )}
                    {entry.weather && (
                      <span className="flex items-center gap-1">
                        <Cloud className="w-3 h-3 sm:w-4 sm:h-4" />
                        {entry.weather}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-gray-300 dark:text-gray-600 text-sm hidden sm:block">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;