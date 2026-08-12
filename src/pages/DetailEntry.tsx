import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner'
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import type { JournalEntry } from '../types/journal';
import { MOOD_OPTIONS } from '../types/journal';
import { Skeleton } from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { useTranslation } from 'react-i18next';
import { 
  Pencil, 
  Trash2, 
  ArrowLeft, 
  Music, 
  FileDown, 
  Calendar,
  Cloud,
  Tag,
  Star,
  Archive, 
  ArchiveRestore,
  Image,
  X,
  ChevronDown,
  FileText
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
  const [weather, setWeather] = useState('');
  const [images, setImages] = useState<Array<{ id: string; image_url: string }>>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageToDelete, setImageToDelete] = useState<{ id: string; url: string } | null>(null);
  const [isImageConfirmOpen, setIsImageConfirmOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [isDeleteAllImagesOpen, setIsDeleteAllImagesOpen] = useState(false);

  // ===== FETCH IMAGES (DI LUAR fetchEntry) =====
  const fetchImages = async (entryId: string) => {
    try {
      const { data, error } = await supabase
        .from('entry_images')
        .select('*')
        .eq('entry_id', entryId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

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
      await fetchImages(data.id);
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
  
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(t('detail.deleteSuccess'));
      navigate('/');
    } catch (err: unknown) {
      setError((err as Error).message);
      toast.error(t('detail.deleteFailed') + ': ' + (err as Error).message);
    }
  };

  const getMoodEmoji = (mood: number) => {
    const found = MOOD_OPTIONS.find((m) => m.value === mood);
    return found ? found.emoji : '😐';
  };

  const getMoodLabel = (mood: number) => {
    return t(`moods.${mood}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'id-ID', {
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

  const toggleFavorite = async () => {
    if (!entry || !id) return;

    try {
      const { error } = await supabase
        .from('entries')
        .update({ is_favorite: !entry.is_favorite })
        .eq('id', id);

      if (error) throw error;

      setEntry({ ...entry, is_favorite: !entry.is_favorite });
      toast.success(entry.is_favorite ? t('detail.removeFavoriteSuccess') : t('detail.addFavoriteSuccess'));
    } catch (err: unknown) {
      toast.error(t('detail.updateFavoriteFailed') + ': ' + (err as Error).message);
    }
  };

  const toggleArchive = async () => {
    if (!entry || !id) return;

    try {
      const { error } = await supabase
        .from('entries')
        .update({ is_archived: !entry.is_archived })
        .eq('id', id);

      if (error) throw error;

      setEntry({ ...entry, is_archived: !entry.is_archived });
      toast.success(entry.is_archived ? t('archive.restoreSuccess') : t('detail.archiveSuccess'));
      if (!entry.is_archived) {
        navigate('/');
      }
    } catch (err: unknown) {
      toast.error(t('detail.archiveFailed') + ': ' + (err as Error).message);
    }
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
        .update({
          created_at: dateObj.toISOString(),
          weather: weather || null,
        })
        .eq('id', id);

      if (error) throw error;

      setEntry({ ...entry, created_at: dateObj.toISOString(), weather: weather || null });
      setEditDate(false);
      toast.success('Tanggal & cuaca berhasil diupdate!');
    } catch (err: unknown) {
      toast.error('Gagal update: ' + (err as Error).message);
    }
  };

  // ===== HANDLE DELETE IMAGE (panggil modal) =====
  const handleDeleteImage = (imageId: string, imageUrl: string) => {
    setImageToDelete({ id: imageId, url: imageUrl });
    setIsImageConfirmOpen(true);
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      const { error: dbError } = await supabase
        .from('entry_images')
        .delete()
        .eq('id', imageToDelete.id);

      if (dbError) throw dbError;

      const filePath = imageToDelete.url.split('/').slice(-2).join('/');
      await supabase.storage.from('entry-images').remove([filePath]);

      setImages(images.filter((img) => img.id !== imageToDelete.id));
      toast.success('Foto berhasil dihapus!');
    } catch (err: unknown) {
      toast.error('Gagal hapus foto: ' + (err as Error).message);
    } finally {
      setIsImageConfirmOpen(false);
      setImageToDelete(null);
    }
  };

  const deleteAllImages = () => {
  if (images.length === 0) {
    toast.info('Tidak ada foto untuk dihapus.');
    return;
  }
  setIsDeleteAllImagesOpen(true);
};

const confirmDeleteAllImages = async () => {
  try {
    // Hapus semua dari database
    const { error: dbError } = await supabase
      .from('entry_images')
      .delete()
      .eq('entry_id', id);

    if (dbError) throw dbError;

    // Hapus semua dari storage
    for (const img of images) {
      const filePath = img.image_url.split('/').slice(-2).join('/');
      await supabase.storage.from('entry-images').remove([filePath]);
    }

    setImages([]);
    toast.success('Semua foto berhasil dihapus!');
  } catch (err: unknown) {
    toast.error('Gagal hapus foto: ' + (err as Error).message);
  } finally {
    setIsDeleteAllImagesOpen(false);
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
          <Link to="/" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-4 flex items-center gap-1 text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-700 dark:text-gray-300">{t('detail.entryNotFound')}</p>
        <Link to="/" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1 mt-3">
          <ArrowLeft className="w-4 h-4" />
          {t('common.backToDashboard')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{t('detail.title')}</h1>
          </div>
          <Link 
            to="/"
            className="inline-flex items-center gap-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition text-sm"
          >
            <span className="hidden sm:inline">← {t('common.backToDashboard')}</span>
            <span className="sm:hidden">←</span>
          </Link>
        </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-4">
        <button
          onClick={toggleFavorite}
          className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
            entry.is_favorite
              ? 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-sky-800 dark:hover:bg-amber-600 text-white dark:text-white'
          }`}
        >
          <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${entry.is_favorite ? 'fill-white' : ''}`} />
          {entry.is_favorite ? t('detail.removeFavorite') : t('detail.addFavorite')}
        </button>
        <button onClick={() => exportSingleEntry(entry)} className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <FileDown className="w-3 h-3 sm:w-4 sm:h-4" />
          PDF
        </button>
        <Link to={`/edit/${entry.id}`} className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
          Edit
        </Link>
        <button
          onClick={toggleArchive}
          className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
            entry.is_archived
              ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-300'
          }`}
        >
          {entry.is_archived ? (
            <ArchiveRestore className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
          {entry.is_archived ? t('detail.restore') : t('detail.archive')}
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg transition flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">{t('common.delete')}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden z-10">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsConfirmOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t('detail.deleteJournal')}
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  deleteAllImages();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2"
              >
                <Image className="w-4 h-4" />
                {t('detail.deleteAllPhotos')} ({images.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 px-8 py-4 border-b border-gray-200 dark:border-slate-600">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
            <div>
              <div className="flex items-center sm:gap-3">
                <h2 className="text-4xl sm:text-5xl font-bold mt-4 text-gray-900 dark:text-gray-100 break-words">
                 {entry.title || t('dashboard.untitled')}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                {t('detail.mood')}: {getMoodEmoji(entry.mood)} {getMoodLabel(entry.mood)}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Meta Info: Date & Weather */}
          <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-4">
            {!editDate ? (
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
                <span>{formatDate(entry.created_at)}</span>
                {entry.weather && <span>| {entry.weather}</span>}
                <Cloud className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
                <button onClick={() => { setSelectedDate(formatDateInput(entry.created_at)); setSelectedTime(formatTimeInput(entry.created_at)); setEditDate(true); }} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-500 hover:bg-blue-600 text-white text-[10px] sm:text-xs rounded-lg transition flex items-center gap-0.5 sm:gap-1">
                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {t('detail.change')}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2 py-0.5 sm:px-3 sm:py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs sm:text-sm"
                />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="px-2 py-0.5 sm:px-3 sm:py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs sm:text-sm"
                />
                <input
                  type="text"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  placeholder={t('journal.weatherLabel')}
                  className="px-2 py-0.5 sm:px-3 sm:py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 w-20 sm:w-24"
                />
                <button
                  onClick={() => handleUpdateDate(selectedDate)}
                  className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs sm:text-sm transition"
                >
                  {t('common.save')}
                </button>
                <button
                  onClick={() => setEditDate(false)}
                  className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs sm:text-sm transition"
                >
                  {t('common.cancel')}
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-700 rounded-lg whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200 mb-4 text-sm sm:text-base">
              {entry.content}
            </div>
          </div>

          {/* Song Section */}
          {entry.song_title && (
            <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <Music className="w-4 h-4" />
                {t('detail.favoriteSongToday')}
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                <strong>{entry.song_title}</strong>
                {entry.song_artist && ` - ${entry.song_artist}`}
              </p>
              {entry.song_url && (
                <a href={entry.song_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm mt-1 flex items-center gap-1">
                  <Music className="w-3 h-3 sm:w-4 sm:h-4" />
                  {t('detail.listenOnSpotify')}
                </a>
              )}
            </div>
          )}

          {/* Foto */}
          {images.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Image className="w-4 h-4" />
                {t('detail.photos')} ({images.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {images.map((img) => (
                  <div key={img.id} className="relative group aspect-square">
                    <img
                      src={img.image_url}
                      alt="Foto jurnal"
                      className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer bg-gray-50 dark:bg-slate-700"
                      onClick={() => setSelectedImage(img.image_url)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(img.id, img.image_url);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
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

          {/* Modals */}
          <ConfirmModal
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={confirmDelete}
            title={t('detail.deleteJournal')}
            message={t('detail.confirmDeleteJournal', { title: entry?.title || t('dashboard.untitled') })}
            confirmText={t('detail.yesDelete')}
            cancelText={t('common.cancel')}
            type="danger"
          />
          <ConfirmModal
            isOpen={isImageConfirmOpen}
            onClose={() => { setIsImageConfirmOpen(false); setImageToDelete(null); }}
            onConfirm={confirmDeleteImage}
            title={t('detail.deletePhoto')}
            message={t('detail.confirmDeletePhoto')}
            confirmText={t('detail.yesDelete')}
            cancelText={t('common.cancel')}
            type="danger"
          />
          <ConfirmModal
            isOpen={isDeleteAllImagesOpen}
            onClose={() => setIsDeleteAllImagesOpen(false)}
            onConfirm={confirmDeleteAllImages}
            title={t('detail.deleteAllPhotosTitle')}
            message={t('detail.confirmDeleteAllPhotos')}
            confirmText={t('detail.yesDeleteAll')}
            cancelText={t('common.cancel')}
            type="danger"
          />

          {/* Lightbox */}
          {selectedImage && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn"
              onClick={() => setSelectedImage(null)}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition"
              >
                ✕
              </button>
              <img
                src={selectedImage}
                alt="Fullscreen"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailEntry;