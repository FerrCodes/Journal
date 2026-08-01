import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import type { JournalEntry } from '../types/journal';
import { MOOD_OPTIONS } from '../types/journal';
import { Skeleton } from '../components/Skeleton';
import { 
  Pencil, 
  Trash2, 
  ArrowLeft, 
  Music, 
  FileDown, 
  Calendar,
  Tag,
  Cloud,
} from 'lucide-react';
import { exportSingleEntry } from '../utils/exportPDF';

function DetailEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDate, setEditDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const fetchEntry = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      if (!id) {
        throw new Error('ID entri tidak ditemukan.');
      }

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Entri tidak ditemukan.');

      setEntry(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntry();
  }, [fetchEntry]);

  const handleDelete = async () => {
    if (!entry || !id) return;

    const confirmDelete = window.confirm('Yakin mau hapus jurnal ini?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('🗑️ Jurnal berhasil dihapus!');
      navigate('/');
    } catch (err: unknown) {
      setError((err as Error).message);
      toast.error('❌ Gagal menghapus jurnal: ' + (err as Error).message);
    }
  };

  const getMoodEmoji = (mood: number) => {
    const found = MOOD_OPTIONS.find((m) => m.value === mood);
    return found ? found.emoji : '😐';
  };

  const getMoodLabel = (mood: number) => {
    const found = MOOD_OPTIONS.find((m) => m.value === mood);
    return found ? found.label : 'Biasa Aja';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDateInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatTimeInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toTimeString().slice(0, 5);
  };

  const handleUpdateDate = async (newDate: string) => {
    if (!entry || !id) return;

    try {
      const dateObj = new Date(newDate);
      const timeStr = selectedTime || '00:00';
      const [hours, minutes] = timeStr.split(':');
      dateObj.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from('entries')
        .update({ created_at: dateObj.toISOString() })
        .eq('id', id);

      if (error) throw error;

      setEntry({ ...entry, created_at: dateObj.toISOString() });
      setEditDate(false);
      toast.success('✅ Tanggal berhasil diupdate!');
    } catch (err: unknown) {
      toast.error('❌ Gagal update tanggal: ' + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton style={{ width: '120px', height: '20px' }} />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
          <Skeleton style={{ height: '40px', width: '60%', marginBottom: '16px' }} />
          <Skeleton style={{ height: '20px', width: '30%', marginBottom: '24px' }} />
          <Skeleton style={{ height: '200px', marginBottom: '24px' }} />
          <Skeleton style={{ height: '100px' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-6 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-700 dark:text-red-300">
          ❌ {error}
          <Link to="/" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1 mt-3">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-700 dark:text-gray-300">📭 Entri tidak ditemukan.</p>
        <Link to="/" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1 mt-3">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Tombol Kembali */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
        Kembali ke Dashboard
      </Link>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
        
        {/* Header dengan Background Gradient */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 px-8 py-6 border-b border-gray-200 dark:border-slate-600">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Mood + Title */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{getMoodEmoji(entry.mood)}</span>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 break-words">
                  {entry.title || 'Tanpa Judul'}
                </h1>
              </div>
              
              {/* Mood Label */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Mood: {getMoodEmoji(entry.mood)} {getMoodLabel(entry.mood)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <button
                onClick={() => exportSingleEntry(entry)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow"
              >
                <FileDown className="w-4 h-4" />
                PDF
              </button>
              <Link
                to={`/edit/${entry.id}`}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          
          {/* Meta Info: Date & Weather */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              {!editDate ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span>{formatDate(entry.created_at)}</span>
                  <button
                    onClick={() => {
                      setSelectedDate(formatDateInput(entry.created_at));
                      setSelectedTime(formatTimeInput(entry.created_at));
                      setEditDate(true);
                    }}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3" />
                    Ubah tanggal
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <button
                    onClick={() => handleUpdateDate(selectedDate)}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setEditDate(false)}
                    className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            {entry.weather && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Cloud className="w-4 h-4" />
                <span>{entry.weather}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200 min-h-[100px] border border-gray-200 dark:border-slate-600">
              {entry.content}
            </div>
          </div>

          {/* Song Section */}
          {entry.song_title && (
            <div className="mb-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-500 dark:border-blue-400">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  Lagu Favorit Hari Ini
                </h4>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                {entry.song_title}
                {entry.song_artist && (
                  <span className="font-normal text-gray-500 dark:text-gray-400 text-base ml-2">
                    — {entry.song_artist}
                  </span>
                )}
              </p>
              {entry.song_url && (
                <a
                  href={entry.song_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  🔗 Dengarkan di Spotify/YouTube
                </a>
              )}
            </div>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 dark:bg-slate-600 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-500 transition"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailEntry;