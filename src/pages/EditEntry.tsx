import { useEffect, useState } from 'react';
import { toast } from 'sonner'
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { MOOD_OPTIONS } from '../types/journal';
import type { MoodValue } from '../types/journal';
import { Pencil, Save, Tag, Upload, X, Image} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function EditEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodValue>(3);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [weather, setWeather] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [existingImages, setExistingImages] = useState<Array<{ id: string; image_url: string }>>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
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

        setTitle(data.title || '');
        setContent(data.content || '');
        setMood(data.mood as MoodValue);
        setSongTitle(data.song_title || '');
        setSongArtist(data.song_artist || '');
        setSongUrl(data.song_url || '');
        setWeather(data.weather || '');
        setTags(data.tags || []);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ===== FUNGSI UNTUK TAG =====
const handleAddTag = () => {
  const trimmed = tagInput.trim();
  if (trimmed && !tags.includes(trimmed)) {
    setTags([...tags, trimmed]);
    setTagInput('');
  }
};

const handleRemoveTag = (tagToRemove: string) => {
  setTags(tags.filter((t) => t !== tagToRemove));
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleAddTag();
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  setError(null);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User tidak ditemukan.');

    const { error: updateError } = await supabase
      .from('entries')
      .update({
        title: title || null,
        content: content,
        mood: mood,
        song_title: songTitle || null,
        song_artist: songArtist || null,
        song_url: songUrl || null,
        weather: weather || null,
        tags: tags,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    // Upload foto baru kalau ada
    if (newFiles.length > 0 && id) {
      setUploading(true);
      const imageUrls = await uploadImages(id);
      
      const imageInserts = imageUrls.map((url) => ({
        entry_id: id,
        image_url: url,
      }));

      const { error: imageError } = await supabase
        .from('entry_images')
        .insert(imageInserts);

      if (imageError) throw imageError;
    }

    toast.success('Jurnal berhasil diperbarui!');
    navigate(`/entry/${id}`);
  } catch (err: unknown) {
    setError((err as Error).message);
    toast.error('❌ Gagal memperbarui jurnal: ' + (err as Error).message);
  } finally {
    setSaving(false);
    setUploading(false);
  }
};

// ===== UPLOAD FUNGSI =====
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFiles = Array.from(e.target.files || []);
  if (selectedFiles.length + newFiles.length > 3) {
    toast.warning('⚠️ Maksimal 3 foto per jurnal.');
    return;
  }
  setNewFiles([...newFiles, ...selectedFiles]);
  const previews = selectedFiles.map((file) => URL.createObjectURL(file));
  setNewPreviews([...newPreviews, ...previews]);
};

const removeNewFile = (index: number) => {
  setNewFiles(newFiles.filter((_, i) => i !== index));
  setNewPreviews(newPreviews.filter((_, i) => i !== index));
};

const removeExistingImage = async (imageId: string, imageUrl: string) => {
  const confirm = window.confirm('Yakin mau hapus foto ini?');
  if (!confirm) return;

  try {
    const { error: dbError } = await supabase
      .from('entry_images')
      .delete()
      .eq('id', imageId);

    if (dbError) throw dbError;

    const filePath = imageUrl.split('/').slice(-2).join('/');
    await supabase.storage.from('entry-images').remove([filePath]);

    setExistingImages(existingImages.filter((img) => img.id !== imageId));
    toast.success('Foto berhasil dihapus!');
  } catch (err: unknown) {
    toast.error('❌ Gagal hapus foto: ' + (err as Error).message);
  }
};

const uploadImages = async (entryId: string): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  for (const file of newFiles) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${entryId}/${uuidv4()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('entry-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('entry-images')
      .getPublicUrl(filePath);

    uploadedUrls.push(urlData.publicUrl);
  }
  return uploadedUrls;
};

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 dark:text-gray-400">⏳ Memuat data...</p>
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
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Pencil className="w-6 h-6 text-blue-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Edit Jurnal</h1>
          </div>
          <Link 
            to={`/entry/${id}`}
            className="inline-flex items-center gap-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition text-sm"
          >
            <span className="hidden sm:inline">← Kembali ke Detail</span>
            <span className="sm:hidden">← Kembali</span>
          </Link>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Judul (Opsional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul hari ini..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            Isi Jurnal <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            placeholder="Ceritakan hari ini..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
          />
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
            Mood Hari Ini <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                className={`px-4 py-2 rounded-lg transition ${
                  mood === option.value
                    ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                }`}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <h3 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">🎵 Lagu Favorit Hari Ini (Opsional)</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="Judul Lagu"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              value={songArtist}
              onChange={(e) => setSongArtist(e.target.value)}
              placeholder="Artis"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="url"
              value={songUrl}
              onChange={(e) => setSongUrl(e.target.value)}
              placeholder="Link Spotify/YouTube"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Cuaca (Opsional)</label>
          <input
            type="text"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            placeholder="Contoh: Cerah, Hujan, Mendung"
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Tags */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <h3 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags (Opsional)
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik tag, lalu Enter..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Tambah
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-500 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Foto */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <h3 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Image className="w-4 h-4" />
            Foto (Opsional, maksimal 3)
          </h3>

          {/* Foto yang sudah ada */}
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.image_url}
                    alt="Foto"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id, img.image_url)}
                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Preview foto baru */}
          <div className="flex flex-wrap gap-2 mb-3">
            {newPreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => removeNewFile(index)}
                  className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {newFiles.length + existingImages.length < 3 && (
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg transition cursor-pointer text-sm">
              <Upload className="w-4 h-4" />
              Pilih Foto
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || uploading || !content}
          className="w-full py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
        >
          {saving || uploading ? 'Menyimpan...' : (
            <>
              <Save className="w-4 h-4" />
              Update Jurnal
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default EditEntry;