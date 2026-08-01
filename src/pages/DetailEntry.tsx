import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import type { JournalEntry } from '../types/journal';
import { MOOD_OPTIONS } from '../types/journal';
import { Skeleton } from '../components/Skeleton';
import { Pencil, Trash2, ArrowLeft, Music, FileDown } from 'lucide-react';
import { exportSingleEntry } from '../utils/exportPDF';

function DetailEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntry = async () => {
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
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Skeleton style={{ width: '120px', height: '20px' }} />
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <Skeleton style={{ width: '60%', height: '32px' }} />
          </div>
          <Skeleton style={{ height: '20px', width: '40%', marginBottom: '16px' }} />
          <Skeleton style={{ height: '100px', marginBottom: '16px' }} />
          <Skeleton style={{ height: '80px' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300">
        ❌ {error}
        <br />
        <Link to="/" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300  mb-4 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-700 dark:text-gray-300">📭 Entri tidak ditemukan.</p>
        <Link to="/" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
          ← Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 inline-block mb-4">
        ← Kembali ke Dashboard
      </Link>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{getMoodEmoji(entry.mood)}</span>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {entry.title || 'Tanpa Judul'}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Mood: {getMoodEmoji(entry.mood)} {getMoodLabel(entry.mood)}
            </p>
          </div>
          <div className="flex gap-2">
          <button
            onClick={() => exportSingleEntry(entry)}
            className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </button>
          <Link
            to={`/edit/${entry.id}`}
            className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
        </div>
        </div>

        <div className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          📅 {formatDate(entry.created_at)}
          {entry.weather && ` | ☁️ ${entry.weather}`}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200 mb-4">
          {entry.content}
        </div>

        {entry.song_title && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
  <Music className="w-4 h-4" />
  Lagu Favorit Hari Ini
</h4>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>{entry.song_title}</strong>
              {entry.song_artist && ` - ${entry.song_artist}`}
            </p>
            {entry.song_url && (
              <a
                href={entry.song_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm inline-block mt-1"
              >
                🔗 Dengarkan di Spotify/YouTube
              </a>
            )}
          </div>
        )}

        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-200 dark:bg-slate-600 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailEntry;