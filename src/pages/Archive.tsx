import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { Archive, ArchiveRestore, Calendar } from 'lucide-react';
import type { JournalEntry } from '../types/journal';
import { MOOD_OPTIONS } from '../types/journal';
import { toast } from 'sonner'

function ArchivePage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchived = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching archived entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const unarchiveEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('entries')
        .update({ is_archived: false })
        .eq('id', id);

      if (error) throw error;
      setEntries(entries.filter(e => e.id !== id));
      toast.success('📂 Dikeluarkan dari arsip!');
    } catch (err: unknown) {
      toast.error('Gagal mengembalikan: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchArchived();
  }, []);

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">⏳ Memuat arsip...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Archive className="w-6 h-6 text-blue-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Arsip</h1>
          </div>
          <Link 
            to="/" 
            className="inline-flex items-center gap-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition text-sm"
          >
            <span className="hidden sm:inline">← Kembali ke Dashboard</span>
            <span className="sm:hidden">←</span>
          </Link>
        </div>
        <p className="mt-2 text-sm mb-4 text-gray-500 dark:text-gray-400">
          Semua jurnal yang diarsipkan akan muncul di sini. Kamu bisa mengembalikannya ke Dashboard kapan saja.
        </p>

      {entries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <p className="text-lg text-gray-700 dark:text-gray-300">Belum ada jurnal yang diarsipkan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-1xl">{getMoodEmoji(entry.mood)}</span>
                  <h3 className="text-sm sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {entry.title || 'Tanpa Judul'}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {formatDate(entry.created_at)}
                </p>
              </div>
              <button
                onClick={() => unarchiveEntry(entry.id)}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-1.5 text-sm"
              >
                <ArchiveRestore className="w-4 h-4" />
                Kembalikan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    
  );
}

export default ArchivePage;